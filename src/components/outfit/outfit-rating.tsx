import * as React from "react";
import { Outfit } from "@/types";
import { ScoreBadge } from "@/components/ui/score-badge";

interface OutfitRatingProps {
  outfit: Outfit;
}

export function OutfitRating({ outfit }: OutfitRatingProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 space-y-4">
      <div className="flex items-start gap-4">
        <ScoreBadge score={outfit.ai_score} size="lg" label="AI Score" />
        <div className="flex-1">
          {outfit.ai_comment ? (
            <p className="text-sm text-zinc-300 leading-relaxed">{outfit.ai_comment}</p>
          ) : (
            <p className="text-sm text-zinc-500 italic">No AI comment available</p>
          )}
        </div>
      </div>

      {/* Sub-scores */}
      <div className="border-t border-zinc-800 pt-4 flex items-center gap-6">
        <ScoreBadge score={outfit.color_harmony_score} size="sm" label="Color harmony" />
        <ScoreBadge score={outfit.style_match_score} size="sm" label="Style match" />
        <ScoreBadge score={outfit.proportion_score} size="sm" label="Proportion" />
      </div>
    </div>
  );
}
