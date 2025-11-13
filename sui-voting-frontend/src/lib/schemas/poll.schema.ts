import { z } from "zod";

export const pollSchema = z.object({
  title: z.string().min(3, "Poll title is required").max(80),
  thumbnail: z.string().max(1024),
  description: z.string().max(250).optional(),
  duration: z.string(),
  options: z
    .array(
      z.object({
        name: z.string().min(1, "Option name is required"),
        image: z.string().url(),
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
});
