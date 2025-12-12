"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';

const queryClient = new QueryClient()
const networks = {
  devnet: { url: getFullnodeUrl('devnet') },
  testnet: { url: getFullnodeUrl('testnet') }
}

export default function SuiLayoutProvider (
    { children} : { children: React.ReactNode}
) {
    return(
    <QueryClientProvider client={queryClient}>
        <SuiClientProvider networks={networks} defaultNetwork='testnet'>
            <WalletProvider autoConnect={true}>
                {children}
            </WalletProvider>
        </SuiClientProvider>
    </QueryClientProvider> 
    )
}