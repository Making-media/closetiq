"use client";

import * as React from "react";
import { Garment } from "@/types";
import { ScanUpload } from "@/components/garment/scan-upload";
import { GarmentCard } from "@/components/garment/garment-card";
import { Button } from "@/components/ui/button";

const REQUIRED_COUNT = 3;

interface StepScanProps {
  onComplete: () => void;
}

export function StepScan({ onComplete }: StepScanProps) {
  const [scanned, setScanned] = React.useState<Garment[]>([]);

  const handleScanned = (garment: Garment) => {
    setScanned((prev) => {
      if (prev.find((g) => g.id === garment.id)) return prev;
      return [...prev, garment];
    });
  };

  const remaining = Math.max(0, REQUIRED_COUNT - scanned.length);
  const canContinue = scanned.length >= REQUIRED_COUNT;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-white">Scan your first 3 garments</h2>
        <p className="text-sm text-zinc-400">
          {canContinue
            ? "You're ready — see what outfits we can make."
            : `Scan ${remaining} more garment${remaining > 1 ? "s" : ""} to continue.`}
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: REQUIRED_COUNT }).map((_, i) => (
          <div
            key={i}
            className={[
              "w-3 h-3 rounded-full transition-colors",
              i < scanned.length ? "bg-white" : "bg-zinc-700",
            ].join(" ")}
          />
        ))}
      </div>

      {/* Upload area — hide when all 3 scanned */}
      {!canContinue && (
        <ScanUpload onComplete={handleScanned} />
      )}

      {/* Scanned garments */}
      {scanned.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">
            Scanned ({scanned.length}/{REQUIRED_COUNT})
          </p>
          <div className="grid grid-cols-3 gap-3">
            {scanned.map((garment) => (
              <GarmentCard key={garment.id} garment={garment} selectable={false} />
            ))}
          </div>
        </div>
      )}

      {/* Continue button */}
      {canContinue && (
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={onComplete}
        >
          See your first outfit
        </Button>
      )}
    </div>
  );
}
