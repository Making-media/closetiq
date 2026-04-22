"use client";

import * as React from "react";
import { StyleGoal } from "@/types";
import { Button } from "@/components/ui/button";

const GOAL_OPTIONS: { value: StyleGoal; label: string; description: string }[] = [
  { value: "look-taller", label: "Look taller", description: "Elongate your silhouette with vertical lines and proportions" },
  { value: "balance-frame", label: "Balance my frame", description: "Create visual balance between upper and lower body" },
  { value: "dress-polished", label: "Dress more polished", description: "Elevate your everyday look with smarter choices" },
  { value: "keep-casual", label: "Keep it casual", description: "Look put-together without trying too hard" },
  { value: "more-color", label: "More color variety", description: "Break out of safe neutrals and explore bolder palettes" },
  { value: "streamline-wardrobe", label: "Streamline my wardrobe", description: "Maximize outfits from fewer, versatile pieces" },
  { value: "stand-out", label: "Stand out more", description: "Make bold choices that get noticed" },
];

const MAX_SELECTIONS = 3;

interface StepGoalsProps {
  onComplete: (goals: StyleGoal[]) => void;
}

export function StepGoals({ onComplete }: StepGoalsProps) {
  const [selected, setSelected] = React.useState<StyleGoal[]>([]);

  const toggle = (goal: StyleGoal) => {
    setSelected((prev) => {
      if (prev.includes(goal)) {
        return prev.filter((g) => g !== goal);
      }
      if (prev.length >= MAX_SELECTIONS) {
        return prev;
      }
      return [...prev, goal];
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-white">What are your style goals?</h2>
        <p className="text-sm text-zinc-400">
          Pick up to {MAX_SELECTIONS} — we&#39;ll personalise your outfits around them.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {GOAL_OPTIONS.map((option) => {
          const isSelected = selected.includes(option.value);
          const isDisabled = !isSelected && selected.length >= MAX_SELECTIONS;

          return (
            <button
              key={option.value}
              onClick={() => toggle(option.value)}
              disabled={isDisabled}
              className={[
                "rounded-xl border p-4 text-left transition-all",
                isSelected
                  ? "border-white bg-zinc-800 ring-2 ring-white ring-offset-2 ring-offset-black"
                  : isDisabled
                  ? "border-zinc-800 bg-zinc-950 opacity-40 cursor-not-allowed"
                  : "border-zinc-800 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800/70",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <p className="text-sm font-medium text-white">{option.label}</p>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{option.description}</p>
            </button>
          );
        })}
      </div>

      <div className="pt-2">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          disabled={selected.length < 2}
          onClick={() => onComplete(selected)}
        >
          Continue{selected.length >= 2 ? ` with ${selected.length} goal${selected.length > 1 ? "s" : ""}` : ""}
        </Button>
        {selected.length < 2 && (
          <p className="text-center text-xs text-zinc-500 mt-2">Select at least 2 goals to continue</p>
        )}
      </div>
    </div>
  );
}
