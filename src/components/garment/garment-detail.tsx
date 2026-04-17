"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Garment } from "@/types";
import { ColorSwatch } from "@/components/ui/color-swatch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useClosetStore } from "@/store/closet-store";

interface GarmentDetailProps {
  garment: Garment;
}

const FORMALITY_LABELS = ["Very Casual", "Casual", "Smart Casual", "Semi-Formal", "Formal"];

export function GarmentDetail({ garment }: GarmentDetailProps) {
  const router = useRouter();
  const removeGarment = useClosetStore((s) => s.removeGarment);
  const [deleting, setDeleting] = React.useState(false);

  const imageUrl = garment.processed_image_url || garment.image_url;

  const handleDelete = async () => {
    if (!confirm("Delete this garment? This cannot be undone.")) return;
    setDeleting(true);
    await removeGarment(garment.id);
    router.push("/closet");
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={garment.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
              No image
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-white">{garment.name}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="default">{garment.type}</Badge>
              <Badge variant="outline">{garment.subtype}</Badge>
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">Colors</h2>
            <div className="space-y-2">
              {garment.colors.map((color, i) => (
                <ColorSwatch
                  key={i}
                  hex={color.hex}
                  role={color.role}
                  percentage={color.percentage}
                  size="lg"
                />
              ))}
            </div>
          </div>

          {/* Pattern & Material */}
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">Details</h2>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{garment.pattern}</Badge>
              <Badge variant="default">{garment.material}</Badge>
            </div>
          </div>

          {/* Formality */}
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">Formality</h2>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={[
                      "h-2 w-8 rounded-full",
                      i < garment.formality ? "bg-white" : "bg-zinc-700",
                    ].join(" ")}
                  />
                ))}
              </div>
              <span className="text-xs text-zinc-400">
                {FORMALITY_LABELS[Math.min(garment.formality - 1, 4)] ?? ""}
              </span>
            </div>
          </div>

          {/* Seasons */}
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">Seasons</h2>
            <div className="flex flex-wrap gap-2">
              {garment.season.map((s) => (
                <Badge key={s} variant="success">
                  {s}
                </Badge>
              ))}
            </div>
          </div>

          {/* Delete */}
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="border-red-800 text-red-400 hover:bg-red-950 hover:text-red-300"
            >
              {deleting ? "Deleting..." : "Delete garment"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
