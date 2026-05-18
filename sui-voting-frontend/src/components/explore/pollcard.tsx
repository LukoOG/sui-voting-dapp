import { formatTimeRemaining, getPreviewImages } from "@/lib/utils/parsepolls";
import { motion } from "framer-motion";
import { Clock, Vote, Wallet } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

//export for image preview
export interface PollOption {
  id: string;
  name: string;
  text?: string;
  caption?: string;
  image_url?: string;
}

interface PollConfig {
  allow_anon_vote: boolean;
  allow_multiple_choice: boolean;
  allow_weighted: boolean;
}

interface PollCardProps {
  poll: {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string;
    creator: string;
    close_time: number;
    options: PollOption[];
    voters: { size: number };
    anon_voters: { size: number };
    poll_config: PollConfig;
  };
  index: number;
}

function PollCard({ poll, index }: PollCardProps) {
  getPreviewImages(poll.options, poll.thumbnail_url);
  const noOfVotes = () =>
    Number(poll.voters.size) + Number(poll.anon_voters.size);

  const optionImages = poll.options.filter(
    (opt): opt is typeof opt & { image_url: string } =>
      opt.image_url !== undefined && opt.image_url.length > 0,
  );

  const showGrid = optionImages.length >= 3;
  return (
    <motion.div
      key={poll.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
    >
      <div className="group cursor-pointer">
        <div className="bg-card-bg border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-accent/50 transition-all">
          {/* Options Preview */}
          {showGrid ? (
            <div className="grid grid-cols-3 gap-1 p-1">
              {optionImages.slice(0, 3).map((option, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square overflow-hidden rounded-lg"
                >
                  <Image
                    src={option.image_url}
                    alt={option.text ?? "Poll option"}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                    <span className="text-white text-xs font-medium truncate">
                      {option.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative aspect-[16/9] overflow-hidden">
              <Image
                src={poll.thumbnail_url}
                alt={poll.title}
                width={800}
                height={450}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>
          )}

          {/* Poll Info */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-foreground font-semibold group-hover:text-accent transition-colors line-clamp-2">
                {poll.title}
              </h3>

              {!poll.poll_config.allow_anon_vote && (
                <Badge variant="secondary" className="ml-2 shrink-0">
                  <Wallet className="w-3 h-3 mr-1" />
                  Wallet
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {poll.description}
            </p>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Vote className="w-4 h-4" />
                <span>{noOfVotes()} votes</span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{formatTimeRemaining(poll.close_time)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
export default PollCard;
