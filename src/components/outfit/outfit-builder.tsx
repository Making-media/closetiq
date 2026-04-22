"use client";

import * as React from "react";
import Image from "next/image";
import { useOutfitStore } from "@/store/outfit-store";
import { useClosetStore } from "@/store/closet-store";
import { Garment } from "@/types";
import { Button } from "@/components/ui/button";
import { GarmentCard } from "@/components/garment/garment-card";

interface OutfitBuilderProps {
  onRated?: (outfit: unknown) => void;
}

export function OutfitBuilder({ onRated }: OutfitBuilderProps) {
  const { builderGarments, addToBuilder, removeFromBuilder, clearBuilder, saveOutfit } =
    useOutfitStore();
  const { garments } = useClosetStore();

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const canRate = builderGarments.length >= 2;

  async function handleRate() {
    if (!canRate) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/outfits/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ garment_ids: builderGarments.map((g) => g.id) }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || "Failed to rate outfit");
        return;
      }

      saveOutfit(data.outfit);
      clearBuilder();
      onRated?.(data.outfit);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const selectedIds = new Set(builderGarments.map((g) => g.id));

  function handleGarmentSelect(garment: Garment) {
    if (selectedIds.has(garment.id)) {
      removeFromBuilder(garment.id);
    } else {
      addToBuilder(garment);
    }
  }

  return (
    <div className="space-y-6">
      {/* Selected garments */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white">
            Selected ({builderGarments.length})
          </h3>
          {builderGarments.length > 0 && (
            <button
              onClick={clearBuilder}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {builderGarments.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-6">
            Select garments below to build an outfit
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {builderGarments.map((garment) => {
              const imgUrl = garment.processed_image_url || garment.image_url;
              return (
                <div key={garment.id} className="relative">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700">
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt={garment.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-xs">
                        ?
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromBuilder(garment.id)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-zinc-700 hover:bg-red-600 text-white text-xs flex items-center justify-center transition-colors leading-none"
                    aria-label={`Remove ${garment.name}`}
                  >
                    &times;
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {error && <p className="text-sm text-red-400 mt-3">{error}</p>}

        <div className="mt-4 flex gap-2">
          <Button
            variant="primary"
            size="md"
            disabled={!canRate || loading}
            onClick={handleRate}
          >
            {loading ? "Rating..." : "Rate this outfit"}
          </Button>
        </div>
      </div>

      {/* Garment picker */}
      <div>
        <h3 className="text-sm font-medium text-white mb-3">Your Closet</h3>
        {garments.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-12">
            No garments in your closet yet
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {garments.map((garment) => (
              <GarmentCard
                key={garment.id}
                garment={garment}
                selectable
                selected={selectedIds.has(garment.id)}
                onSelect={handleGarmentSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
