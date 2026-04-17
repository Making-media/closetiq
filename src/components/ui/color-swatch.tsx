import * as React from "react";

type SwatchSize = "sm" | "md" | "lg";

interface ColorSwatchProps {
  hex: string;
  role?: string;
  percentage?: number;
  size?: SwatchSize;
}

const sizeClasses: Record<SwatchSize, string> = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

export function ColorSwatch({ hex, role, percentage, size = "md" }: ColorSwatchProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`${sizeClasses[size]} rounded-full border border-zinc-700 flex-shrink-0`}
        style={{ backgroundColor: hex }}
        title={hex}
      />
      {(role || percentage !== undefined) && (
        <span className="text-xs text-zinc-400">
          {role && <span className="capitalize">{role}</span>}
          {role && percentage !== undefined && " "}
          {percentage !== undefined && <span>{percentage}%</span>}
        </span>
      )}
    </div>
  );
}
