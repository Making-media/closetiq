"use client";

import * as React from "react";
import Image from "next/image";
import { useClosetStore } from "@/store/closet-store";
import { Garment } from "@/types";

interface ScanUploadProps {
  onComplete?: (garment: Garment) => void;
}

export function ScanUpload({ onComplete }: ScanUploadProps) {
  const addGarment = useClosetStore((s) => s.addGarment);
  const [isDragging, setIsDragging] = React.useState(false);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    setError(null);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);
    setProgress("Uploading image...");

    const formData = new FormData();
    formData.append("image", file);

    try {
      setProgress("Scanning garment...");
      const res = await fetch("/api/garments/scan", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const message = body?.details ? `${body.error}: ${body.details}` : (body?.error ?? "Upload failed");
        throw new Error(message);
      }

      setProgress("Processing result...");
      const body = await res.json();
      const garment: Garment = body.garment ?? body;
      addGarment(garment);
      onComplete?.(garment);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPreview(null);
    } finally {
      setUploading(false);
      setProgress("");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleClick = () => {
    if (!uploading) inputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        onClick={handleClick}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={[
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors cursor-pointer min-h-48",
          isDragging
            ? "border-white bg-zinc-800"
            : "border-zinc-700 bg-zinc-900 hover:border-zinc-500 hover:bg-zinc-800/50",
          uploading ? "pointer-events-none" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {preview ? (
          <div className="relative w-full h-48">
            <Image
              src={preview}
              alt="Garment preview"
              fill
              className="object-contain rounded-xl"
              unoptimized
            />
            {uploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl">
                <p className="text-white text-sm font-medium">{progress}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-10 px-6 text-center">
            <div className="text-4xl text-zinc-500">&#8686;</div>
            <div>
              <p className="text-sm font-medium text-zinc-300">
                Drop a photo here, or click to upload
              </p>
              <p className="text-xs text-zinc-500 mt-1">JPG, PNG, WEBP supported</p>
            </div>
            {uploading && (
              <p className="text-xs text-zinc-400 mt-1 animate-pulse">{progress}</p>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}
