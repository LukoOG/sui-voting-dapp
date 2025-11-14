"use client";

import { useMemo } from "react";
import Image from "next/image";

interface ImagePreviewProps {
  file?: File | null;
  url?: string | null;
  className?: string;
  alt?: string;
}

export default function ImagePreview({
  file,
  url,
  className = "",
  alt = "Preview image",
}: ImagePreviewProps) {

  // Create a memoized preview URL for File input
  const previewUrl = useMemo(() => {
    if (file instanceof File) {
      return URL.createObjectURL(file);
    }
    return null;
  }, [file]);

  // Choose which src to render
  const src = previewUrl || url || "";

  if (!src) return null; // nothing to show

  return (
    <div className={`overflow-hidden rounded-md border border-border ${className}`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
      />
    </div>
  );
}