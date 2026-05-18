/* eslint-disable @typescript-eslint/no-explicit-any */
import { PollFields } from "@/lib/types";

export type PollPreview = {
  id: string;
  pollId: number;
  title: string;
  description?: string;
  thumbnailUrl: string;
  creator: string;
  isActive: boolean;
  startTime: number;
  closeTime: number;
  optionCount: number;
  totalVotes: number;
};

export interface ParsedPollOption {
  id: string;
  text: string;
  name: string;
  votes: number;
  image?: string;
  caption?: string;
}

export interface ParsedPollConfig {
  allowAnonymous: boolean;
  allowMultiple: boolean;
  weightedVotes: boolean;
}

export interface ParsedPoll {
  id: number;
  objectId: string;
  title: string;
  image: string;
  totalVotes: number;
  creator: string;
  category?: string;
  description?: string;
  options: ParsedPollOption[];
  config: ParsedPollConfig;
  endsAt?: string;
  close_time: string;
  start_time: string;
  is_active: boolean;
}

/**
 * Parse poll data from Sui GraphQL response
 * Handles the nested structure of Sui Move objects
 */
export function parsePollFromSui(fields: PollFields): ParsedPoll {
  // Parse poll configuration
  const config: ParsedPollConfig = {
    allowAnonymous: fields.poll_config?.fields?.allow_anon_vote ?? false,
    allowMultiple: fields.poll_config?.fields?.allow_multiple_choice ?? false,
    weightedVotes: fields.poll_config?.fields?.allow_weighted ?? false,
  };

  // Parse options with vote counts
  const options: ParsedPollOption[] = (fields.options || []).map(
    (option, index) => {
      const optionFields = option.fields;

      return {
        id: String(index), // Use index as ID for consistency
        text: optionFields.name || `Option ${index + 1}`,
        name: optionFields.name || `Option ${index + 1}`,
        votes: 0, // Will be populated from votes table
        image: optionFields.image_url || undefined,
        caption: optionFields.caption || undefined,
      };
    },
  );

  // Calculate total votes from the votes table
  // The votes table is a Sui Table<u64, u64> mapping option_index -> vote_count
  const totalVotes = 0;

  // Note: Sui Tables in GraphQL don't expose their contents directly
  // You need to query them separately or use dynamic fields
  // For now, we'll set votes to 0 and you'll need to fetch them via dynamic fields

  // Parse timestamps
  const closeTime = fields.close_time;
  const startTime = fields.start_time;

  // Create ISO date string for endsAt
  const endsAt = new Date(parseInt(closeTime)).toISOString();

  return {
    id: parseInt(fields.poll_id),
    objectId: fields.id.id,
    title: fields.title,
    image: fields.thumbnail_url,
    totalVotes,
    creator: fields.creator,
    category: fields.category || "General",
    description: fields.description || undefined,
    options,
    config,
    endsAt,
    close_time: closeTime,
    start_time: startTime,
    is_active: fields.is_active,
  };
}

/**
 * Fetch vote counts from Sui Table using dynamic fields
 * This is necessary because Sui Tables don't expose their contents in the main query
 */
export async function fetchVoteCounts(
  pollObjectId: string,
  optionCount: number,
  suiClient: any,
): Promise<Map<number, number>> {
  const voteCounts = new Map<number, number>();

  try {
    // Query dynamic fields for the votes table
    const dynamicFields = await suiClient.getDynamicFields({
      parentId: pollObjectId,
    });

    // Parse vote counts from dynamic fields
    for (let i = 0; i < optionCount; i++) {
      // Find the dynamic field for this option index
      const voteField = dynamicFields.data.find((field: any) => {
        // The field name should match the option index
        return field.name?.value === String(i);
      });

      if (voteField) {
        // Fetch the actual vote count
        const voteData = await suiClient.getDynamicFieldObject({
          parentId: pollObjectId,
          name: {
            type: "u64",
            value: String(i),
          },
        });

        const voteCount = parseInt(
          voteData?.data?.content?.fields?.value || "0",
        );
        voteCounts.set(i, voteCount);
      } else {
        voteCounts.set(i, 0);
      }
    }
  } catch (error) {
    console.error("Error fetching vote counts:", error);
    // Return empty map on error
  }

  return voteCounts;
}

/**
 * Enhanced parser that includes vote counts
 * Use this when you have access to the Sui client
 */
export async function parsePollWithVotes(
  fields: PollFields,
  suiClient: any,
): Promise<ParsedPoll> {
  const poll = parsePollFromSui(fields);

  try {
    // Fetch vote counts for each option
    const voteCounts = await fetchVoteCounts(
      poll.objectId,
      poll.options.length,
      suiClient,
    );

    // Update options with vote counts
    let totalVotes = 0;
    poll.options = poll.options.map((option, index) => {
      const votes = voteCounts.get(index) || 0;
      totalVotes += votes;
      return {
        ...option,
        votes,
      };
    });

    poll.totalVotes = totalVotes;
  } catch (error) {
    console.error("Error parsing poll with votes:", error);
  }

  return poll;
}

/**
 * Parse poll preview for list views (without detailed vote counts)
 */
export function parsePollPreview(fields: PollFields): PollPreview {
  return {
    id: fields.id.id,
    pollId: parseInt(fields.poll_id),
    title: fields.title,
    description: fields.description || undefined,
    thumbnailUrl: fields.thumbnail_url,
    creator: fields.creator,
    isActive: fields.is_active,
    startTime: parseInt(fields.start_time),
    closeTime: parseInt(fields.close_time),
    optionCount: fields.options?.length || 0,
    totalVotes: 0, // Will need separate query for accurate count
  };
}

// Made with Bob
