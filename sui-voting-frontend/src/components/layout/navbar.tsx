'use client';

import { useState } from 'react';
import { Waves, Sun, Moon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useDisconnectWallet, ConnectModal, useCurrentAccount } from "@mysten/dapp-kit"
import Link from "next/link";
import { useTheme } from "next-themes"

interface HeaderProps {
  currentTheme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Navbar = () => {
  const account  = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const [open, setOpen] = useState(false);
    const shortAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;
	const { theme, setTheme } = useTheme()
	console.log(theme)
	
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" >
              <span className="text-2xl font-bold text-primary">SuiVS</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/explore" 

              >
                Explore
              </Link>
              <Link 
                href="/create"
                
                onClick={(e) => e.preventDefault()} // Placeholder
              >
                Create Poll
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={()=>setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full text-muted-foreground hover:bg-border transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <Button variant="primary">Connect Wallet</Button>
          </div>
        </div>
      </div>
    </header>

  );
}

export default Navbar