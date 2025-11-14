import { z } from "zod";

export const pollSchema = z.object({
  title: z.string().min(3, "Poll title is required").max(80),
  thumbnail: z.string().optional(),
  thumbnailFile: z.instanceof(File).optional(),
  description: z.string().max(250).optional(),
  duration: z.string(),
  options: z
    .array(
      z.object({
        name: z.string().min(1, "Option name is required"),
        image: z.string().optional(),
        imageFile: z.instanceof(File).optional(),
        caption: z.string(),
      })
    )
    .min(2, "At least two options required"),
  config: z.object({
    weightedVotes: z.boolean(),
    multipleChoice: z.boolean(),
    requireWallet: z.boolean(),
    showResults: z.boolean(),
  }),
}).refine(data => data.thumbnail || data.thumbnailFile, { message: "Provide either an image file or a URL", path: ["thumbnail"] });
