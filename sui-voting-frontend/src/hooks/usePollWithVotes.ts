/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useSuiClient } from "@mysten/dapp-kit";
import { parsePollFromSui } from "@/lib/sui/parsePoll";
import { PollFields } from "@/lib/types";

interface ParsedPollOption {
  id: string;
  text: string;
  name: string;
  votes: number;
  image?: string;
  caption?: string;
}

interface ParsedPollConfig {
  allowAnonymous: boolean;
  allowMultiple: boolean;
  weightedVotes: boolean;
}

interface ParsedPoll {
  id: number;
  objectId: string;
  title: string;
  image: string;
  totalVotes: number;
  creator: string;
  category?: string;
  description?: string;
  options: ParsedPollOption[];
  config: ParsedPollConfig;
  endsAt?: string;
  close_time: string;
  start_time: string;
  is_active: boolean;
}

/**
 * Custom hook to fetch poll data with vote counts
 * Uses GraphQL to get poll data and dynamic fields to get vote counts
 */
export function usePollWithVotes(pollId: string) {
  const suiClient = useSuiClient();
  const [poll, setPoll] = useState<ParsedPoll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!pollId) return;

    const fetchPollWithVotes = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch the poll object
        const pollObject = await suiClient.getObject({
          id: pollId,
          options: {
            showContent: true,
            showOwner: true,
          },
        });

        if (!pollObject.data?.content || pollObject.data.content.dataType !== "moveObject") {
          throw new Error("Invalid poll data");
        }

        const fields = pollObject.data.content.fields as unknown as PollFields;
        
        // Parse basic poll data
        const parsedPoll = parsePollFromSui(fields);

        // Fetch vote counts from the votes table
        // The votes table is stored as dynamic fields
        const votesTableId = (fields.votes as any).fields?.id?.id;
        
        if (votesTableId) {
          try {
            // Get all dynamic fields of the votes table
            const dynamicFields = await suiClient.getDynamicFields({
              parentId: votesTableId,
            });

            // Fetch vote count for each option
            const votePromises = parsedPoll.options.map(async (option, index) => {
              try {
                // Find the dynamic field for this option index
                const fieldInfo = dynamicFields.data.find((field: any) => {
                  const nameValue = field.name?.value;
                  return nameValue === String(index) || nameValue === index;
                });

                if (fieldInfo) {
                  // Fetch the actual vote count value
                  const voteObject = await suiClient.getObject({
                    id: fieldInfo.objectId,
                    options: { showContent: true },
                  });

                  if (voteObject.data?.content && voteObject.data.content.dataType === "moveObject") {
                    const voteValue = (voteObject.data.content.fields as any)?.value;
                    return parseInt(voteValue || "0");
                  }
                }
                return 0;
              } catch (err) {
                console.error(`Error fetching votes for option ${index}:`, err);
                return 0;
              }
            });

            const voteCounts = await Promise.all(votePromises);

            // Update options with vote counts
            let totalVotes = 0;
            parsedPoll.options = parsedPoll.options.map((option, index) => {
              const votes = voteCounts[index] || 0;
              totalVotes += votes;
              return {
                ...option,
                votes,
              };
            });

            parsedPoll.totalVotes = totalVotes;
          } catch (voteError) {
            console.error("Error fetching vote counts:", voteError);
            // Continue with zero votes if fetching fails
          }
        }

        setPoll(parsedPoll);
      } catch (err) {
        console.error("Error fetching poll:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch poll"));
      } finally {
        setLoading(false);
      }
    };

    fetchPollWithVotes();
  }, [pollId, suiClient]);

  return { poll, loading, error };
}

// Made with Bob
