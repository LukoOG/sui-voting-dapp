'use client';

import { useState } from 'react';
import { Vote, Waves } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [connected, setConnected] = useState(false);

  return (
          <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center shadow-lg shadow-[hsl(var(--shadow-glow))]">
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

            {/* Navigation */}
            <div className="flex items-center gap-6">
              <a
                href="/explore"
                className="hidden sm:inline text-muted-foreground hover:text-accent transition-colors font-medium"
              >
                Explore
              </a>

              <div className="hidden sm:flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-accent"
                >
                  <Vote className="w-4 h-4 mr-2" />
                  Create Poll
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="border-accent text-accent hover:bg-accent hover:text-primary-foreground"
              >
                Login / Connect
              </Button>
            </div>
          </div>
        </div>
      </nav>

  );
}
