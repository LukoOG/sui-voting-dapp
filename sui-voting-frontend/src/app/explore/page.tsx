"use client";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

export default function Hero() {
  const trendingPolls = [
    { id: 1, title: "Best AI Tool of 2025", votes: 1234 },
    { id: 2, title: "Most Anticipated Game Release", votes: 980 },
    { id: 3, title: "Coolest Web3 Project on Sui", votes: 756 },
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
		
		{/*
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="px-6 py-3 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium transition">
            Continue Anonymously
          </button>
          <button className="px-6 py-3 rounded-lg border border-[var(--border)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white font-medium transition">
            Connect Wallet
          </button>
        </div>
		*/}
		
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
          <Flame className="text-[var(--accent)] w-5 h-5" />
          <h3 className="text-xl font-semibold text-[var(--text)]">
            Trending Polls
          </h3>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trendingPolls.map((poll) => (
            <motion.div
              key={poll.id}
              whileHover={{ scale: 1.03 }}
              className="p-5 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl shadow-sm cursor-pointer hover:shadow-md transition"
            >
              <h4 className="text-[var(--text)] font-medium mb-2">
                {poll.title}
              </h4>
              <p className="text-sm text-[var(--text-muted)]">
                {poll.votes.toLocaleString()} votes
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
