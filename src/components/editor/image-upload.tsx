"use client";

import { useState, useRef, useCallback } from "react";

interface ImageUploadProps {
  currentUrl?: string | null;
  onUpload: (url: string) => void;
  label?: string;
  className?: string;
}

export function ImageUpload({
  currentUrl,
  onUpload,
  label = "Upload Image",
  className = "",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Instant preview
      setPreview(URL.createObjectURL(file));
      setIsUploading(true);

      try {
        // Upload via FormData to server-side processing route
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload/image", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          alert(data.error || "Upload failed");
          setPreview(null);
          return;
        }

        // Return the public URL
        onUpload(data.url);
      } catch {
        alert("Upload failed. Please try again.");
        setPreview(null);
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload],
  );

  const displayUrl = preview || currentUrl;

  return (
    <div className={className}>
      {displayUrl && (
        <div className="mb-2 h-20 w-20 overflow-hidden rounded-full border border-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayUrl}
            alt="Preview"
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        onChange={handleFileSelect}
        className="hidden"
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-50 disabled:opacity-50"
      >
        {isUploading ? "Uploading..." : label}
      </button>
    </div>
  );
}
