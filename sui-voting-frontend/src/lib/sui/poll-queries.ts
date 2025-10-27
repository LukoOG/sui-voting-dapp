import { useSuiClientQuery } from '@mysten/dapp-kit';

export function usePaginatedPolls(page: number, pageSize: number) {
  return useSuiClientQuery('getOwnedObjects', {
    owner: '0xYourPollModuleAddress', // or use a filter for poll type
    cursor: String(page * pageSize),
    limit: pageSize,
    // Add type filter if needed
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
