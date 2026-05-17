# Sui GraphQL Parsing Implementation Summary

## Problem Statement

The poll detail page was having trouble parsing the Sui GraphQL response due to the complex nested structure of Move objects, particularly:
- Nested `fields` objects
- Sui Tables that don't expose contents directly
- Complex type structures with multiple levels of nesting

## Solution Overview

Implemented a comprehensive parsing strategy with three main components:

### 1. Enhanced Type Definitions
**File**: `src/lib/types/suiTypes.ts`

Already had good type definitions matching the Sui Move structs. These provide type safety and documentation.

### 2. Parser Functions
**File**: `src/lib/sui/parsePoll.ts` (Completely rewritten)

Created three main parsing functions:

#### `parsePollFromSui(fields: PollFields): ParsedPoll`
- Converts raw Sui fields to frontend-friendly format
- Handles nested structures (poll_config, options)
- Provides sensible defaults for optional fields
- Returns a clean, typed object

#### `fetchVoteCounts(pollObjectId, optionCount, suiClient): Promise<Map<number, number>>`
- Fetches vote counts from Sui Table dynamic fields
- Queries each option's vote count separately
- Returns a map of option index → vote count

#### `parsePollWithVotes(fields, suiClient): Promise<ParsedPoll>`
- Combines basic parsing with vote count fetching
- Returns a complete poll object with accurate vote counts

### 3. Custom Hook
**File**: `src/hooks/usePollWithVotes.ts` (New file)

Created `usePollWithVotes(pollId: string)` hook that:
- Fetches poll object from Sui
- Parses the response using `parsePollFromSui()`
- Fetches vote counts from dynamic fields
- Updates options with vote counts
- Calculates total votes
- Manages loading and error states
- Returns `{ poll, loading, error }`

### 4. Updated Poll Detail Page
**File**: `src/app/poll/[id]/page.tsx`

Changes made:
- Removed old `useSuiClientQuery` and manual parsing
- Integrated `usePollWithVotes` hook
- Removed `useEffect` for parsing (now handled by hook)
- Updated Poll interface to match ParsedPoll structure
- Removed optional chaining where fields are guaranteed
- Added proper null checks in event handlers

## Key Technical Details

### Handling Sui Tables

Sui Tables (like `votes`, `voters`, `anon_voters`) store data as dynamic fields:

```typescript
// 1. Get the table's object ID
const votesTableId = fields.votes.fields?.id?.id;

// 2. Query dynamic fields
const dynamicFields = await suiClient.getDynamicFields({
  parentId: votesTableId,
});

// 3. Fetch each field's value
for (const field of dynamicFields.data) {
  const voteObject = await suiClient.getObject({
    id: field.objectId,
    options: { showContent: true },
  });
  const voteCount = voteObject.data?.content?.fields?.value;
}
```

### Parsing Nested Structures

```typescript
// Raw Sui response
{
  poll_config: {
    type: '0x...::poll::PollConfig',
    fields: {
      allow_anon_vote: true,
      allow_multiple_choice: false,
      allow_weighted: false
    }
  }
}

// Parsed output
{
  config: {
    allowAnonymous: true,
    allowMultiple: false,
    weightedVotes: false
  }
}
```

### Type Safety

All parsing functions are fully typed:
- Input: `PollFields` (matches Sui Move struct)
- Output: `ParsedPoll` (frontend-friendly interface)
- Intermediate: `ParsedPollOption`, `ParsedPollConfig`

## Benefits

1. **Separation of Concerns**: Parsing logic is separate from UI
2. **Reusability**: Parser functions can be used anywhere
3. **Type Safety**: Full TypeScript support with proper interfaces
4. **Error Handling**: Graceful handling of missing/malformed data
5. **Performance**: Efficient fetching with proper async handling
6. **Maintainability**: Clear, documented code structure
7. **Testability**: Pure functions easy to test

## Usage Example

```typescript
// In any component
import { usePollWithVotes } from '@/hooks/usePollWithVotes';

function MyComponent() {
  const { poll, loading, error } = usePollWithVotes(pollId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!poll) return <div>Poll not found</div>;

  return (
    <div>
      <h1>{poll.title}</h1>
      <p>Total votes: {poll.totalVotes}</p>
      {poll.options.map(option => (
        <div key={option.id}>
          {option.name}: {option.votes} votes ({Math.round(option.votes / poll.totalVotes * 100)}%)
        </div>
      ))}
    </div>
  );
}
```

## Files Modified/Created

### Created:
1. `src/hooks/usePollWithVotes.ts` - Custom hook for fetching polls with votes
2. `PARSING_GUIDE.md` - Comprehensive documentation
3. `IMPLEMENTATION_SUMMARY.md` - This file

### Modified:
1. `src/lib/sui/parsePoll.ts` - Complete rewrite with proper parsing functions
2. `src/app/poll/[id]/page.tsx` - Updated to use new hook and parser

### Unchanged (but relevant):
1. `src/lib/types/suiTypes.ts` - Already had good type definitions
2. `src/hooks/handlePollActions.ts` - Voting logic unchanged

## Testing Recommendations

1. Test with polls that have:
   - Different numbers of options
   - Various vote counts (0, 1, many)
   - With and without images
   - With and without descriptions
   - Different configurations (anonymous, multiple choice, weighted)

2. Test edge cases:
   - Expired polls
   - Polls with no votes
   - Polls with missing optional fields
   - Network errors during fetching

3. Test performance:
   - Large number of options
   - High vote counts
   - Multiple concurrent requests

## Future Improvements

1. **Caching**: Implement caching to avoid refetching unchanged data
2. **Real-time Updates**: Use GraphQL subscriptions for live vote updates
3. **Optimistic Updates**: Update UI immediately when voting
4. **Batch Fetching**: Fetch multiple polls' vote counts in parallel
5. **Error Recovery**: Implement retry logic for failed requests
6. **Loading States**: Add skeleton loaders for better UX

## Conclusion

The implementation provides a robust, type-safe, and maintainable solution for parsing Sui GraphQL responses. The separation of concerns makes the code easy to understand, test, and extend. The custom hook provides a clean API for components to fetch and display poll data with accurate vote counts.