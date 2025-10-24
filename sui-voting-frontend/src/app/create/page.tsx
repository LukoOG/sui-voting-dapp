"use client";
import Image from "next/image";

import { toast } from "sonner";

import { useState } from "react";
import { motion } from "framer-motion";

import { Plus, X, Image as ImageIcon, Settings, Waves, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { useCurrentAccount } from "@mysten/dapp-kit";

import { usePollActions } from "@/hooks/handlePollActions";
import type { Option } from "@/lib/types"
//import { useNavigate } from "react-router-dom";

const DEFAULT_DURATION: number = 604800000 //1 week

const getDuration = ():number | null => null 

//id to help map mutations
type PollOption = { id: string } & Option;

const CreatePoll = () => {
  const navigate = (_stuff: string) => ("navigetd") //useNavigate();
  const account = useCurrentAccount();
  const { createPoll } = usePollActions();
  const [pollTitle, setPollTitle] = useState("");
  const [pollDescription, setPollDescription] = useState("");
  const [options, setOptions] = useState<PollOption[]>([
    { id: "1", name: "", image: "", caption: "" },
    { id: "2", name: "", image: "", caption: "" },
  ]);

  // Settings
  const [weightedVotes, setWeightedVotes] = useState(false);
  const [multipleChoice, setMultipleChoice] = useState(false);
  const [pollDuration, setPollDuration] = useState("7");
  const [requireWallet, setRequireWallet] = useState(false);
  const [showResults, setShowResults] = useState(true);

  const addOption = () => {
    const newId = (Math.max(...options.map(o => parseInt(o.id))) + 1).toString();
    setOptions([...options, { id: newId, name: "", image: "", caption:"" }]);
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter(option => option.id !== id));
    }
  };

  const updateOption = (id: string, field: "image" | "name" | "caption", value: string) => {
    setOptions(options.map(option => 
      option.id === id ? { ...option, [field]: value } : option
    ));
  };

	const handleCreatePoll = async () => {
		const errors: string[] = [];
		if (!pollTitle.trim()) errors.push("Poll title is required.");
		if (options.length < 2) errors.push("You must have at least two options.");
		if (options.some(opt => !opt.name.trim())) errors.push("All options must have names.");
		if (pollTitle.length > 80) errors.push("Title is too long (max 80 characters).");
		if (pollDescription.length > 250) errors.push("Description too long (max 250 characters).");

		if (errors.length > 0) {
			toast("Error", {
			  description: errors.map((e) => e)
			 
			});
		return;
		}

	  

	  const durationMap: Record<string, number> = {
		"1": 86400000,
		"3": 3 * 86400000,
		"7": 7 * 86400000,
		"14": 14 * 86400000,
		"30": 30 * 86400000,
		"0": 0
	  };
	  const duration = durationMap[pollDuration] ?? DEFAULT_DURATION;

	  createPoll.mutateAsync(
		{
		  title: pollTitle.trim(),
		  description: pollDescription.trim(),
		  thumbnail: "https://res.cloudinary.com/dfxieiol1/image/upload/v1749093935/product_images/rvqzp5ezu8mhh9go1zkj.jpg",
		  duration,
		  options,
		},
		account!.address
	  );
	};


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-accent"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-md">
                <Waves className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-foreground">Create Poll</h1>
                <p className="text-xs text-muted-foreground">Set up your versus battle</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleCreatePoll}
            className="cursor-pointer bg-accent hover:bg-accent-hover text-white"
          >
            Publish Poll
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Poll Details</CardTitle>
                  <CardDescription>Give your poll a catchy title and description</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Poll Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Best DeFi Protocol on Sui?"
                      value={pollTitle}
                      onChange={(e) => setPollTitle(e.target.value)}
                      className="text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Add context or details about your poll..."
                      value={pollDescription}
                      onChange={(e) => setPollDescription(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Options */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Poll Options</CardTitle>
                  <CardDescription>Add choices for people to vote on (minimum 2)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {options.map((option, index) => (
                    <motion.div
                      key={option.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="p-4 border border-border rounded-lg bg-surface space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-muted-foreground">
                          Option {index + 1}
                        </Label>
                        {options.length > 2 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOption(option.id)}
                            className="h-6 w-6 text-destructive hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Input
                          placeholder="Enter option name"
                          value={option.name}
                          onChange={(e) => updateOption(option.id, "name", e.target.value)}
                          className="text-base"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ImageIcon className="w-4 h-4" />
                          <span>Image URL (Optional)</span>
                        </div>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          value={option.image ?? ""}
                          onChange={(e) => updateOption(option.id, "image", e.target.value)}
                          className="text-sm"
                        />
                        {option.image && (
                          <div className="mt-2 relative h-32 rounded-md overflow-hidden border border-border">
                            <Image
							width={1000} height={800}
                              src={option.image}
                              alt={`Option ${index + 1} preview`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "https://images.unsplash.com/photo-1579547621113-e4bb2a19bdd6?w=400&h=200&fit=crop";
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addOption}
                    className="w-full border-dashed border-2 hover:border-accent hover:text-accent"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Option
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-accent" />
                    <CardTitle>Poll Settings</CardTitle>
                  </div>
                  <CardDescription>Customize how your poll works</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Weighted Votes */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="weighted" className="text-sm font-medium">
                        Weighted Votes
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Wallet votes count more than anonymous votes
                      </p>
                    </div>
                    <Switch
                      id="weighted"
                      checked={weightedVotes}
                      onCheckedChange={setWeightedVotes}
                    />
                  </div>

                  {/* Multiple Choice */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="multiple" className="text-sm font-medium">
                        Multiple Choice
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Allow voters to select multiple options
                      </p>
                    </div>
                    <Switch
                      id="multiple"
                      checked={multipleChoice}
                      onCheckedChange={setMultipleChoice}
                    />
                  </div>

                  {/* Require Wallet */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="wallet" className="text-sm font-medium">
                        Require Wallet
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Only wallet users can vote
                      </p>
                    </div>
                    <Switch
                      id="wallet"
                      checked={requireWallet}
                      onCheckedChange={setRequireWallet}
                    />
                  </div>

                  {/* Show Results */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="results" className="text-sm font-medium">
                        Show Results
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Display live vote counts
                      </p>
                    </div>
                    <Switch
                      id="results"
                      checked={showResults}
                      onCheckedChange={setShowResults}
                    />
                  </div>

                  {/* Poll Duration */}
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-sm font-medium">
                      Poll Duration
                    </Label>
                    <select
                      id="duration"
                      value={pollDuration}
                      onChange={(e) => setPollDuration(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="1">1 Day</option>
                      <option value="3">3 Days</option>
                      <option value="7">7 Days</option>
                      <option value="14">14 Days</option>
                      <option value="30">30 Days</option>
                      <option value="0">No Expiration</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Preview Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card className="bg-accent/5 border-accent/20">
                <CardHeader>
                  <CardTitle className="text-sm">Quick Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-muted-foreground">
                  <p>• Use clear, concise option names</p>
                  <p>• Add images to make options more engaging</p>
                  <p>• Enable weighted votes for serious polls</p>
                  <p>• Set appropriate duration based on topic</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePoll;