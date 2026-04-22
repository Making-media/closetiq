import * as React from "react";

type ScoreBadgeSize = "sm" | "md" | "lg";

interface ScoreBadgeProps {
  score: number;
  size?: ScoreBadgeSize;
  label?: string;
}

const sizeClasses: Record<ScoreBadgeSize, { circle: string; text: string; label: string }> = {
  sm: { circle: "w-8 h-8", text: "text-xs font-semibold", label: "text-xs" },
  md: { circle: "w-11 h-11", text: "text-sm font-semibold", label: "text-xs" },
  lg: { circle: "w-16 h-16", text: "text-xl font-bold", label: "text-sm" },
};

function getScoreColor(score: number): string {
  if (score >= 8) return "bg-green-900 text-green-300 border-green-700";
  if (score >= 6) return "bg-yellow-900 text-yellow-300 border-yellow-700";
  return "bg-red-900 text-red-300 border-red-700";
}

export function ScoreBadge({ score, size = "md", label }: ScoreBadgeProps) {
  const { circle, text, label: labelClass } = sizeClasses[size];
  const colorClass = getScoreColor(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={[
          "rounded-full border-2 flex items-center justify-center",
          circle,
          colorClass,
        ].join(" ")}
      >
        <span className={text}>{score}</span>
      </div>
      {label && (
        <span className={[labelClass, "text-zinc-400 text-center leading-tight"].join(" ")}>
          {label}
        </span>
      )}
    </div>
  );
}
