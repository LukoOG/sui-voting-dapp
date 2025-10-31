"use client";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, TrendingUp, Clock, Vote, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { usePaginatedPolls } from "@/hooks/handlePollQueries";

// Mock data for polls
const mockPolls = [
  {
    id: "1",
    title: "Best Programming Language 2024",
    description: "Vote for your favorite programming language",
    totalVotes: 15234,
    timeRemaining: "2 days left",
    isActive: true,
    requiresWallet: false,
    options: [
      { text: "JavaScript", image: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=300&fit=crop" },
      { text: "Python", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=300&fit=crop" },
      { text: "Rust", image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=300&fit=crop" },
    ],
  },
  {
    id: "2",
    title: "Best City to Visit in Europe",
    description: "Which European city should I visit next?",
    totalVotes: 8932,
    timeRemaining: "5 days left",
    isActive: true,
    requiresWallet: true,
    options: [
      { text: "Paris", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop" },
      { text: "Barcelona", image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&h=300&fit=crop" },
      { text: "Rome", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=300&fit=crop" },
    ],
  },
  {
    id: "3",
    title: "Favorite Superhero Movie",
    description: "Vote for the best superhero movie of all time",
    totalVotes: 23451,
    timeRemaining: "1 day left",
    isActive: true,
    requiresWallet: false,
    options: [
      { text: "The Dark Knight", image: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=300&fit=crop" },
      { text: "Avengers: Endgame", image: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=300&fit=crop" },
      { text: "Spider-Man: Into the Spider-Verse", image: "https://images.unsplash.com/photo-1608889335941-32ac5f2041b9?w=400&h=300&fit=crop" },
    ],
  },
  {
    id: "4",
    title: "Best Mobile Operating System",
    description: "iOS vs Android - The eternal debate",
    totalVotes: 12678,
    timeRemaining: "3 days left",
    isActive: true,
    requiresWallet: false,
    options: [
      { text: "iOS", image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400&h=300&fit=crop" },
      { text: "Android", image: "https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=400&h=300&fit=crop" },
    ],
  },
  {
    id: "5",
    title: "Favorite Coffee Style",
    description: "How do you like your coffee?",
    totalVotes: 5432,
    timeRemaining: "6 days left",
    isActive: true,
    requiresWallet: false,
    options: [
      { text: "Espresso", image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=300&fit=crop" },
      { text: "Cappuccino", image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop" },
      { text: "Cold Brew", image: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=300&fit=crop" },
    ],
  },
  {
    id: "6",
    title: "Best Blockchain Platform",
    description: "Vote for the most promising blockchain",
    totalVotes: 9876,
    timeRemaining: "4 days left",
    isActive: true,
    requiresWallet: true,
    options: [
      { text: "Sui", image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop" },
      { text: "Ethereum", image: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=400&h=300&fit=crop" },
      { text: "Solana", image: "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=400&h=300&fit=crop" },
    ],
  },
];

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("trending");
  const [filterStatus, setFilterStatus] = useState("all");
  const asd = usePaginatedPolls(0, 10);
  console.log(asd)

  return (
    <div className="min-h-screen bg-background">   
      {/* Header */}
      <div className="container mx-auto px-4 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Explore Polls
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Discover trending polls and make your voice heard
          </p>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className="container mx-auto px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 items-center"
        >
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search polls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]">
                <TrendingUp className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trending">Trending</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="ending-soon">Ending Soon</SelectItem>
                <SelectItem value="most-voted">Most Voted</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Polls</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="wallet">Wallet Required</SelectItem>
                <SelectItem value="open">Open to All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      </div>

      {/* Polls Grid */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockPolls.map((poll, index) => (
            <motion.div
              key={poll.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
            >

                <div className="group cursor-pointer">
                  <div className="bg-card-bg border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-accent/50 transition-all">
                    {/* Options Preview */}
                    <div className="grid grid-cols-3 gap-1 p-1">
                      {poll.options.slice(0, 3).map((option, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square overflow-hidden rounded-lg"
                        >
                          <Image
							height={1024}
							width={860}
                            src={option.image}
                            alt={option.text}
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

                    {/* Poll Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-foreground font-semibold group-hover:text-accent transition-colors line-clamp-2">
                          {poll.title}
                        </h3>
                        {poll.requiresWallet && (
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
                          <span>{poll.totalVotes.toLocaleString()} votes</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{poll.timeRemaining}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Explore;