/**
 * poll-queries.ts
 *
 * React hooks for querying Poll objects from the Sui network.
 *
 * Migration summary
 * -----------------
 * BEFORE: raw fetch() to a hardcoded GraphQL URL + useSuiClientQuery (JSON-RPC).
 * AFTER : SuiGraphQLClient with typed query strings defined in graphqlClient.ts.
 *         - usePaginatedPolls  → SuiGraphQLClient.query (GET_POLLS_QUERY)
 *         - usePollById        → SuiGraphQLClient.query (GET_POLL_BY_ID_QUERY)
 *         - useUserPolls       → SuiGraphQLClient.query (GET_USER_POLLS_QUERY)
 */

import { useEffect, useState } from "react";
import {
  graphqlClient,
  GET_POLLS_QUERY,
  GET_POLL_BY_ID_QUERY,
  GET_USER_POLLS_QUERY,
  POLL_TYPE,
  type PollsPageResult,
  type PollByIdResult,
  type UserPollsResult,
  type RawPollJson,
} from "@/lib/sui/graphqlClient";

// ---------------------------------------------------------------------------
// usePaginatedPolls
// ---------------------------------------------------------------------------

/**
 * Fetches a paginated list of all Poll objects via GraphQL.
 *
 * @param page     - current page index (0-based)
 * @param pageSize - number of items per page
 */
export function usePaginatedPolls(page: number, pageSize: number) {
  const [polls, setPolls] = useState<RawPollJson[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  // Cursors are stored per page index so forward/backward navigation is stable
  const [cursors, setCursors] = useState<Record<number, string | null>>({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const afterCursor = page > 0 ? (cursors[page - 1] ?? null) : null;

    graphqlClient
      .query<PollsPageResult>({
        query: GET_POLLS_QUERY,
        variables: {
          first: pageSize,
          after: afterCursor,
          type: POLL_TYPE,
        },
      })
      .then(({ data, errors }) => {
        if (cancelled) return;
        if (errors?.length) {
          console.log(POLL_TYPE)
          console.error("[usePaginatedPolls] GraphQL errors:", errors);
          return;
        }
        if (!data) return;

        const nodes = data.objects.nodes
          .map((node) => node.asMoveObject?.contents?.json)
          .filter((json): json is RawPollJson => json != null);

        setPolls(nodes);
        setHasNextPage(data.objects.pageInfo.hasNextPage);
        setCursors((prev) => ({
          ...prev,
          [page]: data.objects.pageInfo.endCursor,
        }));
      })
      .catch((err) => {
        if (!cancelled) console.error("[usePaginatedPolls] error:", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, pageSize]); // eslint-disable-line react-hooks/exhaustive-deps

  return { polls, loading, hasNextPage };
}

// ---------------------------------------------------------------------------
// usePollById
// ---------------------------------------------------------------------------

/**
 * Fetches a single Poll object by its on-chain object ID.
 * Returns the raw JSON from the Move object content plus its dynamic fields.
 */
export function usePollById(pollId: string) {
  const [data, setData] = useState<PollByIdResult["object"] | null>(null);
  const [loading, setLoading] = useState(false);
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
      .then(({ data: result, errors }) => {
        if (cancelled) return;
        if (errors?.length) {
          setError(new Error(errors[0].message));
          return;
        }
        setData(result?.object ?? null);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pollId]);

  return { data, loading, error };
}

// ---------------------------------------------------------------------------
// useUserPolls
// ---------------------------------------------------------------------------

/**
 * Fetches Poll objects associated with a given wallet address.
 */
export function useUserPolls(userAddress: string) {
  const [polls, setPolls] = useState<RawPollJson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userAddress) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    graphqlClient
      .query<UserPollsResult>({
        query: GET_USER_POLLS_QUERY,
        variables: { owner: userAddress, type: POLL_TYPE },
      })
      .then(({ data, errors }) => {
        if (cancelled) return;
        if (errors?.length) {
          setError(new Error(errors[0].message));
          return;
        }
        const nodes =
          data?.address?.objects.nodes
            .map((n) => n.asMoveObject?.contents?.json)
            .filter((j): j is RawPollJson => j != null) ?? [];
        setPolls(nodes);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userAddress]);

  return { polls, loading, error };
}
