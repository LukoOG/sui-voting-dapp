'use client';

import { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useDisconnectWallet, ConnectModal, useCurrentAccount } from "@mysten/dapp-kit"
import Link from "next/link";
import { useTheme } from "next-themes"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";


const Navbar = () => {
  const account  = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const [open, setOpen] = useState(false);
    const shortAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;
	const { theme, setTheme } = useTheme()
	
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" >
              <span
				  className="text-2xl font-bold text-primary relative inline-block transition-all duration-300 
				  ease-out hover:scale-105
					hover:text-primary/80
					hover:drop-shadow-[0_0_6px_var(--ring)]">
				  SuiVS
				</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/explore" 
              >
                <Button className="cursor-pointer" variant="ghost">Explore</Button>
              </Link>
              <Link 
                href="/create"
              >
                <Button className="cursor-pointer" variant="ghost">Create Poll</Button>
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={()=>setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full text-muted-foreground hover:cursor-pointer hover:bg-border transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            {account ? (
				  <TooltipProvider>
					<Tooltip>
					  <TooltipTrigger asChild>
						<Button onClick={() => disconnect()} className="cursor-pointer">
						  Welcome {shortAddress(account.address)}
						</Button>
					  </TooltipTrigger>
					  <TooltipContent>
						<p>Click to disconnect your wallet</p>
					  </TooltipContent>
					</Tooltip>
				  </TooltipProvider>
			) : (
				<ConnectModal
					trigger={<Button className="cursor-pointer" variant="link">Connect Wallet</Button>}
					open={open}
					onOpenChange={(open) => setOpen(open)}
				/>
			)}

          </div>
        </div>
      </div>
    </header>

  );
}

export default Navbar