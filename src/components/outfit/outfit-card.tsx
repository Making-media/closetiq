import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Outfit } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "@/components/ui/score-badge";

interface OutfitCardProps {
  outfit: Outfit;
}

export function OutfitCard({ outfit }: OutfitCardProps) {
  const previewGarments = (outfit.garments ?? []).slice(0, 4);
  const sourceLabel = outfit.source === "ai_suggested" ? "AI suggested" : "Your creation";

  return (
    <Link href={`/outfits/${outfit.id}`} className="block">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden hover:border-zinc-600 transition-colors">
        {/* Garment thumbnails */}
        <div className="flex border-b border-zinc-800">
          {previewGarments.length > 0 ? (
            previewGarments.map((garment) => {
              const imgUrl = garment.processed_image_url || garment.image_url;
              return (
                <div
                  key={garment.id}
                  className="relative flex-1 aspect-square bg-zinc-800"
                  style={{ maxWidth: `${100 / previewGarments.length}%` }}
                >
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
                      ?
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex-1 aspect-[4/1] bg-zinc-800 flex items-center justify-center">
              <span className="text-zinc-600 text-xs">No garments</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">{outfit.name}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{sourceLabel}</p>
            </div>
            <ScoreBadge score={outfit.ai_score} size="sm" />
          </div>

          {outfit.ai_comment && (
            <p className="text-xs text-zinc-400 line-clamp-2">{outfit.ai_comment}</p>
          )}

          {outfit.occasion_tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {outfit.occasion_tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
