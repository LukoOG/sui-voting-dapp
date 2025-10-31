'use client';

import { useState } from 'react';
import { Vote, Waves } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useDisconnectWallet, ConnectButton, ConnectModal, useCurrentAccount } from "@mysten/dapp-kit"

export default function Navbar() {
  const account  = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const [open, setOpen] = useState(false);
    const shortAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;
	
  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <div className="flex items-center gap-3 cursor-pointer select-none">
            <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all">
              <Waves className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground">
                SuiVS
              </h1>
              <p className="text-xs text-muted-foreground">
                Vote for your favorites on Sui
              </p>
            </div>
          </div>

          {/* Right: Navigation */}
          <div className="flex items-center gap-4 sm:gap-6">
            <a
              href="/explore"
              className="hidden sm:inline text-muted-foreground hover:text-accent transition-colors font-medium"
            >
              Explore
            </a>

            {/* Create Poll (visible only for connected users) */}
            {account && (
            <a
              href="/create"
              className="hidden sm:inline text-muted-foreground hover:text-accent transition-colors font-medium"
            >
              Create Poll
            </a>
            )}

            {/* Wallet Section */}
			{!account ? (
			  <ConnectModal
				trigger={
				  <Button variant="default">
					Connect Wallet
				  </Button>
				}
				open={open}
				onOpenChange={setOpen}
			  />
			) : (
			  <div className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg bg-card text-sm text-foreground hover:bg-accent/10 transition">
				<span className="font-mono text-[var(--accent)]">
				  {shortAddress(account.address)}
				</span>
				<div className="w-2 h-2 rounded-full bg-[var(--success)]"></div>

					<Button onClick={()=>disconnect()} variant="ghost" size="sm" className="cursor-pointer hover:text-muted">
					  Disconnect
					</Button>
				  
			  </div>
			)}
          </div>
        </div>
      </div>
    </nav>

  );
}
