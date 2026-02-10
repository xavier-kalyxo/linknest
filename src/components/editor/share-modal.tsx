"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getPublicPageUrl } from "@/lib/slugs";

interface ShareModalProps {
  slug: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ slug, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${getPublicPageUrl(slug)}`
      : getPublicPageUrl(slug);

  // Generate QR code lazily
  useEffect(() => {
    if (!isOpen) return;
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(publicUrl, {
        width: 200,
        margin: 2,
        color: { dark: "#000000", light: "#FFFFFF" },
      }).then(setQrDataUrl);
    });
  }, [isOpen, publicUrl]);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [publicUrl]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed inset-0 z-50 rounded-2xl border border-gray-200 bg-white p-0 shadow-xl backdrop:bg-black/50"
    >
      <div className="w-[360px] p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Share your page</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        {/* QR Code */}
        {qrDataUrl && (
          <div className="mb-6 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="QR Code" className="h-40 w-40" />
          </div>
        )}

        {/* Copy link */}
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <span className="flex-1 truncate text-sm text-gray-600">
            {publicUrl}
          </span>
          <button
            onClick={handleCopy}
            className="shrink-0 rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-800"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Social share links */}
        <div className="grid grid-cols-2 gap-2">
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(publicUrl)}&text=Check%20out%20my%20links!`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-gray-200 px-3 py-2 text-center text-xs font-medium transition-colors hover:bg-gray-50"
          >
            Share on X
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-gray-200 px-3 py-2 text-center text-xs font-medium transition-colors hover:bg-gray-50"
          >
            Share on LinkedIn
          </a>
        </div>
      </div>
    </dialog>
  );
}
