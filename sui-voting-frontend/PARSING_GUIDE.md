# Sui GraphQL Response Parsing Guide

## Overview

This guide explains how to parse Sui blockchain GraphQL responses for the voting dApp, specifically handling the complex nested structure of Move objects and Sui Tables.

## The Challenge

Sui Move objects have a nested structure when queried via GraphQL:
- Fields are wrapped in `fields` objects
- Tables (like `votes`, `voters`, `anon_voters`) don't expose their contents directly
- Options are arrays of objects with nested `fields`
- Configuration is a nested object with its own `fields`

## Solution Architecture

### 1. Type Definitions (`src/lib/types/suiTypes.ts`)

We define TypeScript interfaces that match the Sui Move struct structure:

```typescript
export interface PollFields {
  anon_voters: SuiTable<{ size: number }>;
  close_time: string;
  creator: string;
  description: string;
  id: SuiId;
  is_active: boolean;
  options: PollOption[];
  poll_config: PollConfig;
  poll_id: string;
  start_time: string;
  thumbnail_url: string;
  title: string;
  voters: SuiTable<{ size: number }>;
  votes: SuiTable;
  category?: string;
}
```

### 2. Parser Functions (`src/lib/sui/parsePoll.ts`)

#### Basic Parsing: `parsePollFromSui()`

Converts raw Sui fields into a clean, frontend-friendly format:

```typescript
export function parsePollFromSui(fields: PollFields): ParsedPoll {
  // Parse nested poll_config
  const config: ParsedPollConfig = {
    allowAnonymous: fields.poll_config?.fields?.allow_anon_vote ?? false,
    allowMultiple: fields.poll_config?.fields?.allow_multiple_choice ?? false,
    weightedVotes: fields.poll_config?.fields?.allow_weighted ?? false,
  };

  // Parse options array
  const options: ParsedPollOption[] = (fields.options || []).map((option, index) => {
    const optionFields = option.fields;
    return {
      id: String(index),
      text: optionFields.name || `Option ${index + 1}`,
      name: optionFields.name || `Option ${index + 1}`,
      votes: 0, // Populated separately
      image: optionFields.image_url || undefined,
      caption: optionFields.caption || undefined,
    };
  });

  return {
    id: parseInt(fields.poll_id),
    objectId: fields.id.id,
    title: fields.title,
    image: fields.thumbnail_url,
    totalVotes: 0, // Calculated from votes
    creator: fields.creator,
    category: fields.category || "General",
    description: fields.description || undefined,
    options,
    config,
    endsAt: new Date(parseInt(fields.close_time)).toISOString(),
    close_time: fields.close_time,
    start_time: fields.start_time,
    is_active: fields.is_active,
  };
}
```

#### Vote Count Fetching: `fetchVoteCounts()`

Sui Tables store data as dynamic fields. To get vote counts:

1. Get the table's object ID from `fields.votes.fields.id.id`
2. Query dynamic fields of that table
3. Each dynamic field represents an option index → vote count mapping

```typescript
export async function fetchVoteCounts(
  pollObjectId: string,
  optionCount: number,
  suiClient: any
): Promise<Map<number, number>> {
  const voteCounts = new Map<number, number>();

  // Get dynamic fields of the votes table
  const dynamicFields = await suiClient.getDynamicFields({
    parentId: pollObjectId,
  });

  // Fetch each option's vote count
  for (let i = 0; i < optionCount; i++) {
    const fieldInfo = dynamicFields.data.find((field: any) => {
      const nameValue = field.name?.value;
      return nameValue === String(i) || nameValue === i;
    });

    if (fieldInfo) {
      const voteObject = await suiClient.getObject({
        id: fieldInfo.objectId,
        options: { showContent: true },
      });

      const voteValue = voteObject.data?.content?.fields?.value;
      voteCounts.set(i, parseInt(voteValue || "0"));
    }
  }

  return voteCounts;
}
```

### 3. Custom Hook (`src/hooks/usePollWithVotes.ts`)

Combines fetching and parsing into a single hook:

```typescript
export function usePollWithVotes(pollId: string) {
  const suiClient = useSuiClient();
  const [poll, setPoll] = useState<ParsedPoll | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPollWithVotes = async () => {
      // 1. Fetch poll object
      const pollObject = await suiClient.getObject({
        id: pollId,
        options: { showContent: true, showOwner: true },
      });

      const fields = pollObject.data.content.fields as PollFields;
      
      // 2. Parse basic poll data
      const parsedPoll = parsePollFromSui(fields);

      // 3. Fetch vote counts from dynamic fields
      const votesTableId = fields.votes.fields?.id?.id;
      if (votesTableId) {
        const dynamicFields = await suiClient.getDynamicFields({
          parentId: votesTableId,
        });

        // 4. Update options with vote counts
        const voteCounts = await fetchVoteCountsForOptions(dynamicFields);
        parsedPoll.options = updateOptionsWithVotes(parsedPoll.options, voteCounts);
        parsedPoll.totalVotes = calculateTotalVotes(voteCounts);
      }

      setPoll(parsedPoll);
    };

    fetchPollWithVotes();
  }, [pollId, suiClient]);

  return { poll, loading, error };
}
```

### 4. Usage in Components (`src/app/poll/[id]/page.tsx`)

```typescript
const PollDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // Use the custom hook
  const { poll, loading, error } = usePollWithVotes(id as string);

  if (loading || !poll) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{poll.title}</h1>
      {poll.options.map((option) => (
        <div key={option.id}>
          {option.name}: {option.votes} votes
        </div>
      ))}
    </div>
  );
};
```

## Key Concepts

### 1. Sui Tables as Dynamic Fields

Sui Tables don't expose their contents in the main query. You must:
- Get the table's object ID
- Query its dynamic fields separately
- Each dynamic field is a key-value pair

### 2. Nested Field Access

Move objects have nested structures:
```javascript
// Raw response
fields.poll_config.fields.allow_anon_vote

// Parsed
config.allowAnonymous
```

### 3. Type Safety

Always define TypeScript interfaces matching your Move structs:
- Helps catch parsing errors early
- Provides autocomplete in your IDE
- Documents the data structure

### 4. Timestamp Handling

Sui timestamps are in milliseconds as strings:
```typescript
const closeTime = parseInt(fields.close_time);
const date = new Date(closeTime);
```

## Best Practices

1. **Separate Concerns**: Keep parsing logic separate from UI components
2. **Error Handling**: Always handle missing or malformed data
3. **Type Safety**: Use TypeScript interfaces for all data structures
4. **Caching**: Consider caching parsed results to avoid re-parsing
5. **Async Operations**: Use hooks for async data fetching
6. **Default Values**: Provide sensible defaults for optional fields

## Common Pitfalls

1. **Forgetting to parse nested fields**: `fields.poll_config.fields.allow_anon_vote`
2. **Not handling missing data**: Use optional chaining and defaults
3. **Incorrect type conversions**: Timestamps and numbers are strings
4. **Ignoring dynamic fields**: Tables require separate queries
5. **Not updating on changes**: Use proper React hooks for reactivity

## Example Response Structure

```javascript
{
  anon_voters: {
    type: '0x2::table::Table<0x2::object::ID, u64>',
    fields: { id: { id: '0x...' }, size: 0 }
  },
  close_time: '1766184342780',
  creator: '0x676c8f856db98ff25c55969b7b9a54744d638286c34d5d0a3845462cc8a343cd',
  description: 'Test poll for voting',
  id: { id: '0xc8aaacaf7283858e47e8cb158518bf26050796fc066a0220559c3ebadc69e396' },
  is_active: true,
  options: [
    {
      type: '0x...::poll::PollOption',
      fields: {
        id: 0,
        name: 'Option 1',
        image_url: 'https://...',
        caption: 'Description'
      }
    }
  ],
  poll_config: {
    type: '0x...::poll::PollConfig',
    fields: {
      allow_anon_vote: true,
      allow_multiple_choice: false,
      allow_weighted: false
    }
  },
  // ... other fields
}
```

## Testing

Test your parsers with various scenarios:
- Polls with/without images
- Polls with/without descriptions
- Different config combinations
- Edge cases (0 votes, expired polls, etc.)

## Performance Considerations

- Fetch vote counts only when needed
- Cache parsed results
- Use pagination for large lists
- Consider using GraphQL subscriptions for real-time updates