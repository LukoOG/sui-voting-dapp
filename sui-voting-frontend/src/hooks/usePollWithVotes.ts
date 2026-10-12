/**
 * usePollWithVotes.ts
 *
 * Custom hook that fetches a Poll object together with its per-option vote
 * counts in a single GraphQL round-trip.
 *
 * Migration summary
 * -----------------
 * BEFORE: useSuiClient() (JSON-RPC) → getObject() → getDynamicFields() →
 *         N×getObject() (one per vote option). Three separate RPC batches,
 *         any-typed, and the function was incorrectly named getPollWithVotes
 *         (lower-case 'g') while being called as a React hook.
 *
 * AFTER:  SuiGraphQLClient.query() with GET_POLL_BY_ID_QUERY, which fetches
 *         the Move object JSON *and* its dynamic fields (vote table rows) in
 *         one request. Vote counts are parsed directly from the nested
 *         dynamicFields response — no extra round-trips needed.
 */

import { useState, useEffect } from "react";
import {
  graphqlClient,
  GET_POLL_BY_ID_QUERY,
  type PollByIdResult,
} from "@/lib/sui/graphqlClient";
import { parsePollFromSui } from "@/lib/sui/parsePoll";
import type { PollFields } from "@/lib/types";

/** Dynamic-field node shape as returned by GET_POLL_BY_ID_QUERY */
type DynamicFieldNode = {
  name: { json: unknown };
  value: { json: unknown } | null;
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
 * Parses the raw dynamic-field nodes returned by GET_POLL_BY_ID_QUERY and
 * produces a Map<optionIndex, voteCount>.
 *
 * The votes Sui Table stores entries as dynamic fields where the field name
 * is a u64 option index and the value is a u64 vote count.
 */
function parseVoteCountsFromDynamicFields(
  nodes: DynamicFieldNode[],
): Map<number, number> {
  const map = new Map<number, number>();

  for (const node of nodes) {
    // name.json can be a number, string-number, or an object — normalise it
    const nameJson = node.name?.json;
    const key =
      typeof nameJson === "number"
        ? nameJson
        : typeof nameJson === "string"
          ? parseInt(nameJson, 10)
          : NaN;

    if (isNaN(key)) continue;

    const valueJson = node.value?.json;
    const count =
      typeof valueJson === "number"
        ? valueJson
        : typeof valueJson === "string"
          ? parseInt(valueJson, 10)
          : typeof valueJson === "object" &&
              valueJson !== null &&
              "value" in valueJson
            ? parseInt(String((valueJson as Record<string, unknown>).value), 10)
            : 0;

    map.set(key, isNaN(count) ? 0 : count);
  }

  return map;
}

/**
 * Fetches a Poll by its on-chain object ID and resolves per-option vote
 * counts from the associated dynamic fields — all in one GraphQL call.
 *
 * @param pollId - the Sui object ID of the poll
 */
export function usePollWithVotes(pollId: string) {
  const [poll, setPoll] = useState<ParsedPoll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!pollId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    graphqlClient
      .query<PollByIdResult>({
        query: GET_POLL_BY_ID_QUERY,
        variables: { id: pollId },
      })
      .then(({ data, errors }) => {
        if (cancelled) return;

        if (errors?.length) {
          throw new Error(errors[0].message);
        }

        const obj = data?.object;
        if (!obj?.asMoveObject?.contents?.json) {
          throw new Error("Poll object not found or has no Move content");
        }

        // Cast the raw JSON to our strongly-typed PollFields shape
        const fields = obj.asMoveObject.contents.json as unknown as PollFields;

        // Parse the structural poll data (titles, options, config, times …)
        console.log("before parsing",fields)
        const parsedPoll = parsePollFromSui(fields);
        console.log("after parsing",fields)

        // Resolve vote counts from the dynamic fields co-fetched in the query
        const voteCounts = parseVoteCountsFromDynamicFields(
          obj.dynamicFields.nodes,
        );

        let totalVotes = 0;
        parsedPoll.options = parsedPoll.options.map((option, index) => {
          const votes = voteCounts.get(index) ?? 0;
          totalVotes += votes;
          return { ...option, votes };
        });
        parsedPoll.totalVotes = totalVotes;

        setPoll(parsedPoll);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error("[usePollWithVotes] error:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch poll"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pollId]);

  return { poll, loading, error };
}
