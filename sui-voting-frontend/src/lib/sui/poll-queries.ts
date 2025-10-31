import { useSuiClientQuery } from '@mysten/dapp-kit';
import suiEnv from "@/lib/sui/suiEnv";

import { useEffect, useState } from "react";

const SUI_GRAPHQL_ENDPOINT = "https://graphql.devnet.sui.io/graphql"; 

export function usePaginatedPolls(page: number, pageSize: number) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [endCursor, setEndCursor] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);

    // Calculate the cursor for the current page (for simplicity, this example assumes sequential paging)
    // In a real-world scenario, you would want to keep track of cursors for each page.
    let afterCursor = null;
    if (page > 1 && endCursor) {
      afterCursor = endCursor;
    }

    const query = `
      query GetPolls($first: Int, $after: String) {
        objects(
          first: $first,
          after: $after,
          filter: { type: "${suiEnv.pollType}" }
        ) {
          nodes {
            address
            type
            // add other fields you need
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    fetch(SUI_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: {
          first: pageSize,
          after: afterCursor,
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
		console.log(data);
        setPolls(data.data.objects.nodes);
        setHasNextPage(data.data.objects.pageInfo.hasNextPage);
        setEndCursor(data.data.objects.pageInfo.endCursor);
      })
      .finally(() => setLoading(false));
  }, [page, pageSize, endCursor]);

  return { polls, loading, hasNextPage };
}

export function usePollById(pollId: string) {
  return useSuiClientQuery('getObject', {
    id: pollId,
  });
}

export function useUserPolls(userAddress: string) {
  return useSuiClientQuery('getOwnedObjects', {
    owner: userAddress,
    // Add type filter for Poll objects if needed
  });
}
