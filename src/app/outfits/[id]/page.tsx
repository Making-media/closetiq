"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Nav } from "@/components/ui/nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OutfitRating } from "@/components/outfit/outfit-rating";
import { useOutfitStore } from "@/store/outfit-store";
import { Outfit } from "@/types";

export default function OutfitDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { rateOutfit, toggleFavorite } = useOutfitStore();

  const [outfit, setOutfit] = React.useState<Outfit | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [ratingLoading, setRatingLoading] = React.useState(false);
  const [favoriteLoading, setFavoriteLoading] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/outfits/${id}`);
        if (!res.ok) {
          setError("Outfit not found");
          return;
        }
        const data = await res.json();
        setOutfit(data.outfit);
      } catch {
        setError("Failed to load outfit");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  async function handleRating(rating: number) {
    if (!outfit) return;
    setRatingLoading(true);
    await rateOutfit(outfit.id, rating);
    setOutfit((prev) => (prev ? { ...prev, user_rating: rating } : prev));
    setRatingLoading(false);
  }

  async function handleToggleFavorite() {
    if (!outfit) return;
    setFavoriteLoading(true);
    await toggleFavorite(outfit.id);
    setOutfit((prev) =>
      prev ? { ...prev, favorited: !prev.favorited } : prev
    );
    setFavoriteLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Nav />
        <main className="max-w-5xl mx-auto px-6 py-8">
          <p className="text-zinc-500 text-sm">Loading outfit...</p>
        </main>
      </div>
    );
  }

  if (error || !outfit) {
    return (
      <div className="min-h-screen bg-black">
        <Nav />
        <main className="max-w-5xl mx-auto px-6 py-8">
          <p className="text-red-400 text-sm">{error ?? "Outfit not found"}</p>
        </main>
      </div>
    );
  }

  const garments = outfit.garments ?? [];
  const sourceLabel = outfit.source === "ai_suggested" ? "AI suggested" : "Your creation";

  return (
    <div className="min-h-screen bg-black">
      <Nav />
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-white">{outfit.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="outline">{sourceLabel}</Badge>
              {outfit.occasion_tags.map((tag) => (
                <Badge key={tag} variant="default">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <Button
            variant={outfit.favorited ? "primary" : "outline"}
            size="md"
            disabled={favoriteLoading}
            onClick={handleToggleFavorite}
          >
            {outfit.favorited ? "Favorited" : "Favorite"}
          </Button>
        </div>

        {/* Garment grid */}
        {garments.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-zinc-400 mb-3">Garments</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {garments.map((garment) => {
                const imgUrl = garment.processed_image_url || garment.image_url;
                return (
                  <div
                    key={garment.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden"
                  >
                    <div className="relative aspect-square bg-zinc-800">
                      {imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={garment.name}
                          fill
                          className="object-cover"
                          sizes="25vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-xs">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-white truncate">{garment.name}</p>
                      <p className="text-xs text-zinc-500 capitalize">{garment.type}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* AI Rating */}
        <section>
          <h2 className="text-sm font-medium text-zinc-400 mb-3">AI Rating</h2>
          <OutfitRating outfit={outfit} />
        </section>

        {/* User rating */}
        <section>
          <h2 className="text-sm font-medium text-zinc-400 mb-3">Your Rating</h2>
          <div className="flex items-center gap-2 flex-wrap">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                disabled={ratingLoading}
                onClick={() => handleRating(n)}
                className={[
                  "w-10 h-10 rounded-lg text-sm font-medium border transition-colors",
                  outfit.user_rating === n
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-400 hover:text-white",
                  ratingLoading ? "opacity-50 cursor-not-allowed" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {n}
              </button>
            ))}
          </div>
          {outfit.user_rating && (
            <p className="text-xs text-zinc-500 mt-2">
              You rated this {outfit.user_rating}/10
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
