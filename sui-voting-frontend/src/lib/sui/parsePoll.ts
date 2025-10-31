import { SuiObjectResponse } from '@mysten/sui/client'; // or your fetch type

export type PollPreview = {
  id: string;
  pollId: number;
  title: string;
  description?: string;
  thumbnailUrl: string;
  creator: string;
  isActive: boolean;
  startTime: number;
  closeTime: number;
  optionCount: number;
  totalVotes: number;
};

export function parsePollPreview(obj: SuiObjectResponse): PollPreview | null {
  // Adjust the path to your Move struct fields as needed
  const fields = obj.data?.content?.fields;
  if (!fields) return null;

  // Compute total votes from the votes table if available
  let totalVotes = 0;
  if (fields.votes && Array.isArray(fields.votes.fields.contents)) {
    totalVotes = fields.votes.fields.contents.reduce(
      (sum: number, entry: any) => sum + Number(entry.value),
      0
    );
  }

  return {
    id: obj.data?.objectId,
    pollId: Number(fields.poll_id),
    title: fields.title,
    description: fields.description?.fields?.some || undefined,
    thumbnailUrl: fields.thumbnail_url,
    creator: fields.creator,
    isActive: fields.is_active,
    startTime: Number(fields.start_time),
    closeTime: Number(fields.close_time),
    optionCount: Array.isArray(fields.options) ? fields.options.length : 0,
    totalVotes,
  };
}