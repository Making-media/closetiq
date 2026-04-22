import * as React from "react";
import { Suggestion } from "@/types";
import { ColorSwatch } from "@/components/ui/color-swatch";
import { Button } from "@/components/ui/button";

interface SuggestionCardProps {
  suggestion: Suggestion;
  onDismiss: (id: string) => void;
}

const TYPE_LABELS: Record<Suggestion["type"], string> = {
  gap_fill: "Gap Fill",
  trend: "Trend",
  versatility: "Versatility",
};

const TYPE_COLORS: Record<Suggestion["type"], string> = {
  gap_fill: "bg-blue-900/40 text-blue-300 border-blue-800",
  trend: "bg-purple-900/40 text-purple-300 border-purple-800",
  versatility: "bg-green-900/40 text-green-300 border-green-800",
};

export function SuggestionCard({ suggestion, onDismiss }: SuggestionCardProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span
            className={[
              "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
              TYPE_COLORS[suggestion.type],
            ].join(" ")}
          >
            {TYPE_LABELS[suggestion.type]}
          </span>
          <h3 className="text-base font-semibold text-white capitalize">{suggestion.garment_type}</h3>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-sm font-medium text-white">+{suggestion.outfits_unlocked} new outfits</p>
          <p className="text-xs text-zinc-500">unlocked</p>
        </div>
      </div>

      {/* Reason */}
      <p className="text-sm text-zinc-300 leading-relaxed">{suggestion.reason}</p>

      {/* Recommended colors */}
      {suggestion.recommended_colors.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Recommended colors</p>
          <div className="flex flex-wrap gap-2">
            {suggestion.recommended_colors.map((hex, i) => (
              <ColorSwatch key={i} hex={hex} size="md" />
            ))}
          </div>
        </div>
      )}

      {/* Not interested */}
      <div className="pt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDismiss(suggestion.id)}
          className="text-zinc-400 border-zinc-700 hover:text-white hover:border-zinc-500"
        >
          Not interested
        </Button>
      </div>
    </div>
  );
}
