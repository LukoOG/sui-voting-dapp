import { useSuiClientQuery } from '@mysten/dapp-kit';
import { useMemo } from 'react';
import suiEnv from "@/lib/sui/suiEnv";

export function usePaginatedPolls(page: number, pageSize: number) {
  const cursor = page === 0 ? null : String((page - 1) * pageSize);

  const filter = useMemo(
    () => ({
      StructType: suiEnv.pollType,
    }),
    []
  );

  return useSuiClientQuery('queryObjects', {
    filter,
    options: {
      showContent: true,
      showOwner: true,
      showType: true,
    },
    limit: pageSize,
    cursor,
  });
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
