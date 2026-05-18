import { PollOption } from "@/components/explore/pollcard";

export function getPreviewImages(
  options: PollOption[],
  fallback: string
): { image: string ; text: string }[] {
  const withImages = options.filter(opt => opt.image_url);

  const mapped = withImages.map(opt => ({
    image: opt.image_url ?? fallback,
    text: opt.text ?? "Poll option",
  }));

  while (mapped.length < 3) {
    mapped.push({
      image: fallback,
      text: "Poll option",
    });
  }

  return mapped.slice(0, 3);
}

export function formatTimeRemaining(closeTime: number) {
  const diff = closeTime - Date.now();
  if (diff <= 0) return "Ended";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} left`;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  return `${hours}h left`;
}
