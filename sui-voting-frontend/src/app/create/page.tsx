"use client";
import { toast } from "sonner";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { pollSchema } from "@/lib/schemas/poll.schema";
import { motion } from "framer-motion";

import { Plus, X, Image as ImageIcon, Settings, Waves, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { uploadToCloudinary } from "@/lib/utils/uploadToCloudinary";

import { useCurrentAccount } from "@mysten/dapp-kit";

import { usePollActions } from "@/hooks/handlePollActions";
//import { useNavigate } from "react-router-dom";

//const getDuration = ():number | null => null 

//id to help map mutations
type PollForm = z.infer<typeof pollSchema>;
const DEFAULT_IMAGE = "https://res.cloudinary.com/dfxieiol1/image/upload/v1763136116/sui_banner2_baub9o.webp";

const CreatePoll = () => {
  const navigate = () => ("navigetd") //useNavigate();
  const account = useCurrentAccount();
  const { createPoll } = usePollActions();
  
  const {
    register,
    control,
    handleSubmit,
	watch,
	setValue,
	reset,
    formState: { errors },
  } = useForm<PollForm>({
    resolver: zodResolver(pollSchema),
    defaultValues: {
      title: "",
      thumbnail: DEFAULT_IMAGE,
      thumbnailFile: undefined,
      description: "",
      duration: "7",
      options: [
        { name: "", image: "", imageFile: undefined, caption: "" },
        { name: "", image: "", imageFile: undefined, caption: "" },
      ],
      config: {
        weightedVotes: false,
        multipleChoice: false,
        requireWallet: false,
        showResults: true,
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: control,
    name: "options",
  });
  
	const handleCreatePoll = async (data: PollForm) => {
		const toastId = toast.loading("Creating poll...");
		try {
		  const durationMap: Record<string, number> = {
			"1": 86400000,
			"3": 3 * 86400000,
			"7": 7 * 86400000,
			"14": 14 * 86400000,
			"30": 30 * 86400000,
			"0": 0,
		  };
		  
		  let thumbnailUrl = data.thumbnail ?? "";
		  
		  const thumbnailFile = data.thumbnailFile as File | undefined;
		  if(thumbnailFile instanceof File){
			thumbnailUrl = await uploadToCloudinary(thumbnailFile);
		  };
		  
		  const resolvedOptions = await Promise.all(
			data.options.map( async(opt)=>{
				let imageUrl = opt.image ?? "";
				
				const file = opt.imageFile as File | undefined;
				if (file instanceof File) {
				  imageUrl = await uploadToCloudinary(file);
				}
				
				return {
					...opt,
					image: imageUrl
				}
			} )
		  )
		console.log(resolvedOptions);
		  
		  await createPoll.mutateAsync({
			address: account?.address as string,
			title: data.title,
			description: data.description ?? "",
			thumbnail: thumbnailUrl,
			duration: durationMap[data.duration],
			options: resolvedOptions,
			config: Object?.values(data.config).slice(0, 3),
		  });
		  
		  toast.dismiss(toastId);
		  toast.success("Poll created successfully!");
		  reset();
		} catch (e) {
		  console.error(e);
		  toast.dismiss(toastId);
		  toast.error("Failed to create poll");
		}
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
			  onClick={() => navigate()}
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
			onClick={handleSubmit(handleCreatePoll)}
			className="bg-accent hover:bg-accent-hover text-white"
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
			{/* Poll Details */}
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
					  {...register("title")}
					  className="text-base"
					/>
					{errors.title && (
					  <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
					)}
				  </div>

				  <div className="space-y-2">
					<Label htmlFor="description">Description (Optional)</Label>
					<Textarea
					  id="description"
					  placeholder="Add context or details about your poll..."
					  rows={3}
					  {...register("description")}
					  className="resize-none"
					/>
					{errors.description && (
					  <p className="text-xs text-destructive mt-1">{errors.description.message}</p>
					)}
				  </div>

					<div className="space-y-2">
					  <div className="flex items-center gap-2">
						<ImageIcon className="w-4 h-4 text-muted-foreground" />
						<Label htmlFor="thumbnail">Thumbnail Image (Optional)</Label>
					  </div>

					  {/* URL input */}
					  <Input
						id="thumbnail"
						placeholder="https://example.com/thumbnail.jpg"
						{...register("thumbnail")}
						className="text-sm"
					  />
					  {errors.thumbnail && (
						<p className="text-xs text-destructive mt-1">{errors.thumbnail.message}</p>
					  )}

					  {/* File Upload */}
					  <div className="space-y-2">
						<Label>Upload Thumbnail (Optional)</Label>
						<Input
						  type="file"
						  accept="image/*"
						  onChange={(e) => {
							const file = e.target.files?.[0];
							setValue("thumbnailFile", file ?? undefined);
						  }}
						/>
					  </div>

					  {/* Unified Preview */}
					  {(() => {
						const file = watch("thumbnailFile");
						const url = watch("thumbnail");

						if (!file && !url) return null;

						const previewSrc = file ? URL.createObjectURL(file) : url;
						if(!previewSrc) return null;

						return (
						  <div className="h-60 mx-auto w-fit overflow-hidden rounded-md border border-border">
							<img
							  src={previewSrc}
							  alt={`thumbnail image on SuiVs for ${watch("thumbnail")}`}
							  className="w-full h-full object-cover"
							  onError={(e) => {
								(e.target as HTMLImageElement).src =
								  "https://images.unsplash.com/photo-1579547621113-e4bb2a19bdd6?w=400&h=200&fit=crop";
							  }}
							/>
						  </div>
						);
					  })()}
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
				  {fields.map((field, index) => {
					    const optionImageFile = watch(`options.${index}.imageFile`);
						const optionImageUrl = watch(`options.${index}.image`);
						
						const imageSrc = optionImageFile ? URL.createObjectURL(optionImageFile) : optionImageUrl ?? "";
						
					return ( <motion.div
					  key={field.id}
					  initial={{ opacity: 0, x: -20 }}
					  animate={{ opacity: 1, x: 0 }}
					  transition={{ duration: 0.3, delay: index * 0.05 }}
					  className="p-4 border border-border rounded-lg bg-surface space-y-3"
					>
					  <div className="flex items-center justify-between">
						<Label className="text-sm font-medium text-muted-foreground">
						  Option {index + 1}
						</Label>
						{fields.length > 2 && (
						  <Button
							variant="ghost"
							size="icon"
							onClick={() => remove(index)}
							className="h-6 w-6 text-destructive hover:text-destructive"
						  >
							<X className="w-4 h-4" />
						  </Button>
						)}
					  </div>

					  <div className="space-y-2">
						<Label htmlFor={`options.${index}.name`}>Option Name *</Label>
						<Input
						  id={`options.${index}.name`}
						  placeholder="Enter option name"
						  {...register(`options.${index}.name`)}
						  className="text-base"
						/>
						{errors.options?.[index]?.name && (
						  <p className="text-xs text-destructive mt-1">
							{errors.options[index]?.name?.message}
						  </p>
						)}
					  </div>

					  <div className="space-y-2">
						<Label htmlFor={`options.${index}.caption`}>Caption (Optional)</Label>
						<Input
						  id={`options.${index}.caption`}
						  placeholder="Add a short description"
						  {...register(`options.${index}.caption`)}
						  className="text-sm"
						/>
					  </div>

					<div className="space-y-2">
					  <div className="flex items-center gap-2 text-sm text-muted-foreground">
						<ImageIcon className="w-4 h-4" />
						<span>Image URL (Optional)</span>
					  </div>

					  <Input
						placeholder="https://example.com/image.jpg"
						{...register(`options.${index}.image`)}
					  />

					  <Label className="text-sm">Upload Image (Optional)</Label>
					  <Input
						type="file"
						accept="image/*"
						onChange={(e) => {
						  const file = e.target.files?.[0];
						  if (file) setValue(`options.${index}.imageFile`, file);
						}}
					  />

					  {/* Preview */}
					  {imageSrc && (
						<div className="mt-2 relative h-60 mx-auto w-fit rounded-md overflow-hidden border border-border">
						  <img
						  alt={"image option on Sui VS"}
							src={imageSrc}
							className="w-full h-full object-cover"
						  />
						</div>
					  )}
					</div>
					</motion.div>
					)
				  })}

				  <Button
					variant="outline"
					onClick={() =>
					  append({
						name: "",
						caption: "",
						image:
						  "https://res.cloudinary.com/dfxieiol1/image/upload/v1749093935/product_images/rvqzp5ezu8mhh9go1zkj.jpg",
						imageFile: undefined,
					  })
					}
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
				  <Controller
					name="config.weightedVotes"
					control={control}
					render={({ field }) => (
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
						  checked={field.value}
						  onCheckedChange={field.onChange}
						/>
					  </div>
					)}
				  />

				  <Controller
					name="config.multipleChoice"
					control={control}
					render={({ field }) => (
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
						  checked={field.value}
						  onCheckedChange={field.onChange}
						/>
					  </div>
					)}
				  />

				  <Controller
					name="config.requireWallet"
					control={control}
					render={({ field }) => (
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
						  checked={field.value}
						  onCheckedChange={field.onChange}
						/>
					  </div>
					)}
				  />

				  <Controller
					name="config.showResults"
					control={control}
					render={({ field }) => (
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
						  checked={field.value}
						  onCheckedChange={field.onChange}
						/>
					  </div>
					)}
				  />

				  <div className="space-y-2">
					<Label htmlFor="duration" className="text-sm font-medium">
					  Poll Duration
					</Label>
					<select
					  id="duration"
					  {...register("duration")}
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

			{/* Quick Tips */}
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