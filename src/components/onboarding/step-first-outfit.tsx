"use client";

import * as React from "react";
import Image from "next/image";
import { Outfit, Garment } from "@/types";
import { OutfitRating } from "@/components/outfit/outfit-rating";
import { Button } from "@/components/ui/button";

interface StepFirstOutfitProps {
  onComplete: () => void;
}

export function StepFirstOutfit({ onComplete }: StepFirstOutfitProps) {
  const [outfit, setOutfit] = React.useState<Outfit | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function generate() {
      try {
        const res = await fetch("/api/outfits/generate", { method: "POST" });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error ?? "Failed to generate outfit");
        }
        const data = await res.json();
        const first = data.outfits?.[0] ?? null;
        if (!cancelled) {
          setOutfit(first);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    generate();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-white">Your first outfit</h2>
        <p className="text-sm text-zinc-400">
          Here&#39;s what we put together from your closet.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-400">Generating your first outfit...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-8 text-center space-y-3">
          <p className="text-zinc-300 font-medium">{error}</p>
          <p className="text-sm text-zinc-500">You can still explore your closet and generate outfits later.</p>
        </div>
      ) : outfit ? (
        <div className="space-y-4">
          {/* Garment thumbnails */}
          {outfit.garments && outfit.garments.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {outfit.garments.map((garment: Garment) => {
                const imgUrl = garment.processed_image_url || garment.image_url;
                return (
                  <div
                    key={garment.id}
                    className="relative w-20 h-20 rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden flex-shrink-0"
                  >
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt={garment.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-xs">
                        No image
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Outfit name */}
          <p className="text-center text-base font-medium text-white">{outfit.name}</p>

          {/* Rating */}
          <OutfitRating outfit={outfit} />
        </div>
      ) : null}

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={onComplete}
        disabled={loading}
      >
        Go to my closet
      </Button>
    </div>
  );
}
