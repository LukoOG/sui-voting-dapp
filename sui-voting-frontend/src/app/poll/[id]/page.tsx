"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Vote, Check, Clock, Share, ArrowLeft, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useResolveSuiNSName, useCurrentAccount } from "@mysten/dapp-kit";
import { usePollActions } from "@/hooks/handlePollActions";
import { toast } from "sonner";
import { usePollWithVotes } from "@/hooks/usePollWithVotes";

const PollDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const account = useCurrentAccount();
  const { walletVote } = usePollActions();

  // Use the new hook to fetch poll with vote counts
  const { poll, loading: isPending } = usePollWithVotes(id as string);

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const shortAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  const { data: Ns } = useResolveSuiNSName(poll?.creator);

  const totalVotes = useMemo(() => {
    if (poll) {
      console.log(poll)
      return poll.totalVotes;
    }
  }, [poll]);

  const timeRemaining = useMemo(() => {
    if (!poll?.close_time) return "Timeless";
    const diff = new Date(Number(poll.close_time)).getTime() - new Date().getTime();
    if (diff < 0) return "Poll ended";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h remaining`;
  }, [poll]);

  const creator = useMemo(() => {
    if (poll?.creator) {
      return Ns ?? shortAddress(poll.creator);
    }
    return "loading...";
  }, [poll, Ns]);

  const handleOptionClick = (optionId: string) => {
    if (hasVoted || isVoting || !poll) return;

    if (poll.config.allowMultiple) {
      setSelectedOptions((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId],
      );
    } else {
      // If single choice, clicking toggles selection or switches to it
      if (selectedOptions.includes(optionId)) {
        setSelectedOptions([]);
      } else {
        setSelectedOptions([optionId]);
      }
    }
  };

  const handleVote = async () => {
    if (selectedOptions.length === 0 || !account) return;

    setIsVoting(true);
    try {
      if (!id || !poll) {
        toast.error("Poll data not found");
        return;
      }

      // Execute vote for each selected option
      for (const optionId of selectedOptions) {
        const optionIndex = poll.options.findIndex((o) => o.id === optionId);

        if (optionIndex === -1) {
          toast.error("Invalid option selected");
          continue;
        }

        await walletVote.mutateAsync({
          poll_id: id as string,
          option_index: optionIndex,
          owner: account?.address ?? "",
          is_anonymous: poll.config.allowAnonymous,
          weight: 1,
          address: account.address,
        });
      }

      toast.success("Vote submitted successfully!");
      setHasVoted(true);
      setSelectedOptions([]);
    } catch (error) {
      console.error("Vote error:", error);
      toast.error("An error occurred while voting");
    } finally {
      setIsVoting(false);
    }
  };

  if (isPending || !poll || !id) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-3xl font-extrabold text-foreground mb-4">
          Loading
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-700">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/explore"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to Explore
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Poll Content */}
        <div className="lg:col-span-8 space-y-8">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">
                {poll.category}
              </span>
              {poll.config.allowMultiple && (
                <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider">
                  Multi-Choice
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              {poll.title}
            </h1>

            {poll.description && (
              <p className="text-lg text-muted-foreground leading-relaxed">
                {poll.description}
              </p>
            )}
          </div>

          {/* Poll Options Area */}
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                {hasVoted ? "Results" : "Make your choice"}
                {!hasVoted && poll.config.allowMultiple && (
                  <span className="text-sm font-normal text-muted-foreground">
                    (Select multiple)
                  </span>
                )}
              </h2>
              {hasVoted && (
                <span className="text-sm font-medium text-primary animate-pulse">
                  Live Updates
                </span>
              )}
            </div>

            <div
              className={`grid gap-3 ${poll.options.some((o) => o.image) ? "grid-cols-1" : "grid-cols-1"}`}
            >
              {poll.options.map((option) => {
                const isSelected = selectedOptions.includes(option.id);

                // Calculate stats - using votes from poll data
                const votes = option.votes || 0;
                const percentage =
                  totalVotes && totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                const displayText =
                  option.text || option.name || "Unnamed option";

                return (
                  <motion.button
                    key={option.id}
                    layout
                    disabled={hasVoted || isVoting}
                    onClick={() => handleOptionClick(option.id)}
                    whileHover={
                      !hasVoted
                        ? { scale: 1.01, borderColor: "var(--primary)" }
                        : {}
                    }
                    whileTap={!hasVoted ? { scale: 0.99 } : {}}
                    className={`relative w-full group overflow-hidden rounded-xl border-2 transition-all duration-300 text-left
                                    ${
                                      hasVoted
                                        ? "cursor-default border-transparent bg-secondary/30"
                                        : isSelected
                                          ? "border-primary bg-primary/5 ring-1 ring-primary/30 shadow-md shadow-primary/10"
                                          : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
                                    }
                                `}
                  >
                    {/* Progress Bar Background (Only visible after voting) */}
                    {hasVoted && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "circOut" }}
                        className={`absolute top-0 left-0 h-full opacity-20 ${isSelected ? "bg-primary" : "bg-muted-foreground"}`}
                      />
                    )}

                    <div className="relative p-4 md:p-5 flex items-center justify-between gap-4 z-10">
                      <div className="flex items-center gap-4 flex-grow">
                        {/* Image thumbnail if exists */}
                        {option.image && (
                          <div className="relative h-12 w-12 md:h-16 md:w-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                            <Image
                              height={1024}
                              width={1024}
                              src={option.image}
                              alt={displayText}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="flex flex-col">
                          <span
                            className={`font-bold text-base md:text-lg transition-colors ${hasVoted && isSelected ? "text-primary" : "text-foreground"}`}
                          >
                            {displayText}
                          </span>
                          {option.caption && !hasVoted && (
                            <span className="text-xs text-muted-foreground font-medium">
                              {option.caption}
                            </span>
                          )}
                          {hasVoted && (
                            <span className="text-xs text-muted-foreground font-medium md:hidden">
                              {votes.toLocaleString()} votes
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right side: Checkbox (pre-vote) or Percentage (post-vote) */}
                      <div className="flex items-center gap-3">
                        {!hasVoted ? (
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "border-primary bg-primary text-white" : "border-muted-foreground/30 group-hover:border-primary/50"}`}
                          >
                            {isSelected && <Check className="w-4 h-4" />}
                          </div>
                        ) : (
                          <div className="text-right flex flex-col items-end">
                            <div className="flex items-center gap-2">
                              {isSelected && (
                                <Check className="w-5 h-5 text-primary" />
                              )}
                              <span className="text-xl font-black text-foreground">
                                {Math.round(percentage)}%
                              </span>
                            </div>
                            <span className="text-sm font-medium text-muted-foreground hidden md:block">
                              {votes.toLocaleString()} votes
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Submit Action */}
            <AnimatePresence>
              {!hasVoted && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-4"
                >
                  <Button
                    onClick={handleVote}
                    disabled={
                      selectedOptions.length === 0 || isVoting || !account
                    }
                    className={`w-full py-4 text-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2
                                    ${
                                      selectedOptions.length > 0 && account
                                        ? "opacity-100 translate-y-0 shadow-primary/25 hover:shadow-primary/40"
                                        : "opacity-50 cursor-not-allowed bg-muted text-muted-foreground shadow-none"
                                    }
                                `}
                  >
                    {isVoting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isVoting
                      ? "Submitting..."
                      : !account
                        ? "Connect Wallet to Vote"
                        : `Vote ${selectedOptions.length > 0 ? `(${selectedOptions.length})` : ""}`}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Post-vote Message */}
            {hasVoted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-secondary/30 border border-secondary p-4 rounded-xl text-center"
              >
                <p className="text-foreground font-medium">
                  Thanks for voting! Share this poll to boost your choice.
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Column: Metadata Sidebar */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {/* Poll Image Card */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="aspect-video w-full overflow-hidden relative">
              <Image
                height={1024}
                width={1024}
                src={poll.image}
                alt={poll.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Ends in</span>
                </div>
                <span className="font-bold text-foreground">
                  {timeRemaining}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Vote className="w-4 h-4" />
                  <span className="text-sm font-medium">Total Votes</span>
                </div>
                <span className="font-bold text-foreground">{totalVotes}</span>
              </div>
            </div>
          </div>

          {/* Creator & Config */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white font-bold">
                {poll.creator.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase">
                  Created By
                </p>
                <p className="font-bold text-foreground">{creator}</p>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-2">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${poll.config.allowAnonymous ? "bg-green-500/10 text-green-600 border-green-200 dark:border-green-900" : "bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-900"}`}
              >
                {poll.config.allowAnonymous ? "Anonymous" : "Wallet Required"}
              </span>
              {poll.config.weightedVotes && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-600 border border-purple-200 dark:border-purple-900">
                  Weighted
                </span>
              )}
            </div>
          </div>

          {/* Share Button */}
          <Button
            variant="secondary"
            className="w-full flex items-center justify-center gap-2 py-3"
            onClick={() => setShowCopied((prev) => !prev)}
          >
            <Share className="w-4 h-4" />
            {showCopied ? "Link Copied!" : "Share Poll"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PollDetailView;
