"use client";
import { motion } from "framer-motion";
import { Flame, Vote } from "lucide-react";
import Image from "next/image";

export default function Hero() {
	const trendingPolls = [
	  { id: 1, title: "Best DeFi Protocol on Sui?", votes: 12847, url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&amp;h=300&amp;fit=crop"},
	  { id: 2, title: "Favorite NFT Collection", votes: 9521, url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&amp;h=300&amp;fit=crop"  },
	  { id: 3, title: "Most Anticipated Sui Launch", votes: 8394, url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&amp;h=300&amp;fit=crop"  },
	  { id: 4, title: "Top Gaming dApp", votes: 7203, url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&amp;h=300&amp;fit=crop"  },
	  { id: 5, title: "Community Choice Awards", votes: 6815, url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&amp;h=300&amp;fit=crop"  },
	  { id: 6, title: "Best Sui Wallet", votes: 5492, url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&amp;h=300&amp;fit=crop"  },
	];

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-12">
      {/* Headline + Subtext */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-[var(--text)]">
          Vote. Rank. Decide — All on{" "}
          <span className="text-[var(--accent)]">Sui</span>.
        </h2>

        <p className="text-[var(--text-muted)] max-w-lg mx-auto mb-8 leading-relaxed">
          Join the fun. Cast your vote or create a poll instantly.
          <br className="hidden sm:block" /> 
          No wallet? No problem — vote anonymously in seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="px-6 py-3 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium transition">
            Continue Anonymously
          </button>
          <button className="px-6 py-3 rounded-lg border border-[var(--border)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white font-medium transition">
            Connect Wallet
          </button>
        </div>
      </motion.div>

      {/* Trending Polls */}
      <motion.div
        id="trending"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="pt-12 border-t border-[var(--border)]"
      >
        <div className="flex items-center justify-center gap-2 mb-6">
          <Flame size={20} strokeWidth={6} className="text-[var(--accent)] w-5 h-5" />
          <h3 className="text-xl font-semibold text-[var(--text)]">
            Trending Polls
          </h3>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trendingPolls.map((poll, index) => (
              <motion.div
                key={poll.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.03, y: -4 }}
                className="p-6 bg-card-bg border border-border rounded-xl shadow-sm cursor-pointer hover:shadow-lg hover:border-accent/50 transition-all group"
              >
				<div className="relative h-48 overflow-hidden">
					<img alt="" src={poll.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
					<div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
				</div>
				
                <h4 className="text-foreground font-medium mb-2 group-hover:text-accent transition-colors">
                  {poll.title}
                </h4>
                <div className="flex items-center gap-2">
                  <Vote className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {poll.votes.toLocaleString()} votes
                  </p>
                </div>
              </motion.div>
            ))}
        </div>
      </motion.div>
    </section>
  );
}
