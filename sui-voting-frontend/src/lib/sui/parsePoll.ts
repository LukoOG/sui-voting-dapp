/**
 * parsePoll.ts
 *
 * Pure parsing utilities that convert raw Move object JSON into typed
 * application-level data structures.
 *
 * Migration summary
 * -----------------
 * BEFORE: fetchVoteCounts / parsePollWithVotes accepted `suiClient: any` and
 *         called the JSON-RPC `getDynamicFields` / `getDynamicFieldObject`
 *         methods directly, leading to N+1 RPC calls and loss of type safety.
 *
 * AFTER:  The two helpers now accept a pre-resolved Map<number, number>
 *         produced by the single GraphQL query in usePollWithVotes / graphqlClient.
 *         No RPC calls are made here — this file is pure data transformation.
 */

import type { PollFields } from "@/lib/types";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Core parser
// ---------------------------------------------------------------------------

/**
 * Parse poll data from a raw Sui Move object JSON response.
 * Vote counts are initialised to 0; populate them with `applyVoteCounts`.
 */
export function parsePollFromSui(fields: PollFields): ParsedPoll {
  // GraphQL returns poll_config as a flat object — no .fields wrapper
  const config: ParsedPollConfig = {
    allowAnonymous: fields.poll_config?.allow_anon_vote ?? false,
    allowMultiple: fields.poll_config?.allow_multiple_choice ?? false,
    weightedVotes: fields.poll_config?.allow_weighted ?? false,
  };

  // GraphQL returns options as flat objects — no .fields wrapper
  const options: ParsedPollOption[] = (fields.options ?? []).map(
    (option, index) => ({
      id: String(index),
      text: option.name ?? `Option ${index + 1}`,
      name: option.name ?? `Option ${index + 1}`,
      votes: 0,
      image: option.image_url ?? undefined,
      caption: option.caption ?? undefined,
    }),
  );

  const endsAt = new Date(parseInt(fields.close_time)).toISOString();

  return {
    id: parseInt(fields.poll_id),
    // GraphQL returns id as a plain address string, not { id: string }
    objectId: fields.id,
    title: fields.title,
    image: fields.thumbnail_url,
    totalVotes: 0,
    creator: fields.creator,
    category: fields.category ?? "General",
    description: fields.description ?? undefined,
    options,
    config,
    endsAt,
    close_time: fields.close_time,
    start_time: fields.start_time,
    is_active: fields.is_active,
  };
}

// ---------------------------------------------------------------------------
// Vote-count helpers (no RPC calls — accept pre-resolved data)
// ---------------------------------------------------------------------------

/**
 * Merge a pre-resolved vote-count map into an already-parsed poll.
 *
 * `voteCounts` is a `Map<optionIndex, count>` produced by
 * `parseVoteCountsFromDynamicFields` in `usePollWithVotes`.
 */
export function applyVoteCounts(
  poll: ParsedPoll,
  voteCounts: Map<number, number>,
): ParsedPoll {
  let totalVotes = 0;
  const options = poll.options.map((option, index) => {
    const votes = voteCounts.get(index) ?? 0;
    totalVotes += votes;
    return { ...option, votes };
  });
  return { ...poll, options, totalVotes };
}

/**
 * Convenience wrapper: parse a poll and immediately apply vote counts.
 *
 * @param fields     - raw PollFields from the GraphQL JSON response
 * @param voteCounts - Map<optionIndex, voteCount> resolved from dynamic fields
 */
export function parsePollWithVotes(
  fields: PollFields,
  voteCounts: Map<number, number>,
): ParsedPoll {
  return applyVoteCounts(parsePollFromSui(fields), voteCounts);
}

// ---------------------------------------------------------------------------
// Preview parser (for list/card views — no vote counts needed)
// ---------------------------------------------------------------------------

/**
 * Parse a lightweight poll preview from raw fields.
 * Suitable for card/list views where vote counts are shown as totals only.
 */
export function parsePollPreview(fields: PollFields): PollPreview {
  return {
    id: fields.id,
    pollId: parseInt(fields.poll_id),
    title: fields.title,
    description: fields.description ?? undefined,
    thumbnailUrl: fields.thumbnail_url,
    creator: fields.creator,
    isActive: fields.is_active,
    startTime: parseInt(fields.start_time),
    closeTime: parseInt(fields.close_time),
    optionCount: fields.options?.length ?? 0,
    totalVotes: 0,
  };
}
