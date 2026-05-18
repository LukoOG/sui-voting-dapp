"use client";
import { motion } from "framer-motion";
import { Flame, Vote } from "lucide-react";
import Image from "next/image";
import Link from "next/link";


export default function Hero() {
	const trendingPolls = [
	  { 
		id: 1, 
		title: "Best DeFi Protocol on Sui?", 
		totalVotes: 12847,
		image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop",
		category: "DeFi"
	  },
	  { 
		id: 2, 
		title: "Favorite NFT Collection", 
		totalVotes: 9521,
		image: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=400&h=300&fit=crop",
		category: "DeFi"
	  },
	  { 
		id: 3, 
		title: "Most Anticipated Sui Launch", 
		totalVotes: 8394,
		image: "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=400&h=300&fit=crop",
		category: "DeFi"
	  },
	  { 
		id: 4, 
		title: "Top Gaming dApp", 
		totalVotes: 7203,
		image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop",
		category: "DeFi"
	  },
	  { 
		id: 5, 
		title: "Community Choice Awards", 
		totalVotes: 6815,
		image: "https://images.unsplash.com/photo-1579547621113-e4bb2a19bdd6?w=400&h=300&fit=crop",
		category: "DeFi"
	  },
	  { 
		id: 6, 
		title: "Best Sui Wallet", 
		totalVotes: 5492,
		image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop"
	  },
	  { 
		id: 7, 
		title: "Hottest Meme Coin", 
		totalVotes: 4928,
		image: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=400&h=300&fit=crop",
		category: "DeFi"
	  },
	  { 
		id: 8, 
		title: "Best Developer Tool", 
		totalVotes: 3847,
		image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop",
		category: "DeFi"
	  },
	  { 
		id: 9, 
		title: "Most Innovative Project", 
		totalVotes: 3291,
		image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop",
		category: "DeFi"
	  },
	];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24 text-center space-y-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-primary/20 blur-[100px] rounded-full -z-10 pointer-events-none"></div>
        
        <h1 className="text-5xl sm:text-7xl font-extrabold mb-8 tracking-tight text-foreground leading-tight">
          The Pulse of <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
            The Ecosystem.
          </span>
        </h1>

        <p className="text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed text-xl font-medium">
          Create polls, rank projects, and settle debates instantly. 
          Whether you connect your wallet or stay incognito, 
          <span className="text-foreground font-semibold"> your opinion powers Sui.</span>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
          <Link href="/explore" className="w-full sm:w-auto">
            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg transition shadow-xl shadow-primary/30 ring-2 ring-primary ring-offset-2 ring-offset-background"
            >
                Start Voting Now
            </motion.button>
          </Link>
          <Link href="/create" className="w-full sm:w-auto" onClick={(e) => e.preventDefault()}>
            <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: "var(--secondary)" }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-card border-2 border-border text-foreground hover:border-primary/30 font-bold text-lg transition shadow-sm"
            >
                Create a Poll
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Trending Polls */}
      <motion.div
        id="trending"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="pt-16"
      >
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg text-foreground">
                <Flame strokeWidth={5} className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold text-foreground">
              Trending Now
            </h3>
          </div>
          <Link href="/explore" className="text-primary font-semibold hover:underline decoration-2 underline-offset-4">
            View All &rarr;
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {trendingPolls.map((poll, index) => (
              <Link key={poll.id} href={`/poll/${poll.id}`}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.05, duration: 0.4 }}
                    whileHover={{ y: -8 }}
                    className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group overflow-hidden h-full flex flex-col"
                >
                    <div className="relative h-52 overflow-hidden">
                        <Image
                            alt={poll.title} 
                            src={poll.image} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80"></div>
                         <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md text-white border border-white/20 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                            {poll.category}
                        </div>
                    </div>
                    
                    <div className="p-6 text-left flex-grow flex flex-col">
                        <h4 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors leading-tight">
                        {poll.title}
                        </h4>
                        <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
                            <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary/80 transition-colors">
                                <Vote className="w-5 h-5" />
                                <span className="text-sm font-medium">{poll.totalVotes.toLocaleString()} totalVotes</span>
                            </div>
                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                                ACTIVE
                            </span>
                        </div>
                    </div>
                </motion.div>
              </Link>
            ))}
        </div>
      </motion.div>
    </section>
  );
}
