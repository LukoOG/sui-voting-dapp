"use client";

/**
 * SuiLayoutProvider.tsx
 *
 * Application-level Sui SDK provider tree.
 *
 * Migration summary
 * -----------------
 * BEFORE: bare { url } network config with no GraphQL endpoint declared.
 * AFTER : createNetworkConfig with a typed `graphqlUrl` variable per network,
 *         making the correct GraphQL endpoint available anywhere in the app via
 *         useNetworkVariable("graphqlUrl"). The singleton graphqlClient in
 *         graphqlClient.ts reads from NEXT_PUBLIC_GRAPHQL_URL at module load
 *         time, which is aligned with these values.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";

const queryClient = new QueryClient();

const { networkConfig } = createNetworkConfig({
  devnet: {
    url: getFullnodeUrl("devnet"),
    variables: {
      graphqlUrl: "https://sui-devnet.mystenlabs.com/graphql",
    },
  },
  testnet: {
    url: getFullnodeUrl("testnet"),
    variables: {
      graphqlUrl: "https://sui-testnet.mystenlabs.com/graphql",
    },
  },
});

export default function SuiLayoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect={true}>{children}</WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
