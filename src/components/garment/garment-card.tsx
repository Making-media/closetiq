import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Garment } from "@/types";
import { ColorSwatch } from "@/components/ui/color-swatch";
import { Badge } from "@/components/ui/badge";

interface GarmentCardProps {
  garment: Garment;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (garment: Garment) => void;
}

export function GarmentCard({
  garment,
  selectable = false,
  selected = false,
  onSelect,
}: GarmentCardProps) {
  const imageUrl = garment.processed_image_url || garment.image_url;
  const topColors = garment.colors.slice(0, 3);

  const cardContent = (
    <div
      className={[
        "rounded-xl border bg-zinc-900 overflow-hidden transition-all",
        selectable
          ? "cursor-pointer hover:border-zinc-500"
          : "hover:border-zinc-600",
        selected
          ? "border-white ring-2 ring-white ring-offset-2 ring-offset-black"
          : "border-zinc-800",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={selectable && onSelect ? () => onSelect(garment) : undefined}
    >
      <div className="relative aspect-square bg-zinc-800">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={garment.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-sm">
            No image
          </div>
        )}
      </div>

      <div className="p-3 space-y-2">
        <p className="text-sm font-medium text-white truncate">{garment.name}</p>

        {topColors.length > 0 && (
          <div className="flex items-center gap-1.5">
            {topColors.map((color, i) => (
              <ColorSwatch key={i} hex={color.hex} size="sm" />
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-1">
          <Badge variant="default">{garment.subtype}</Badge>
          <Badge variant="outline">{garment.pattern}</Badge>
        </div>
      </div>
    </div>
  );

  if (selectable) {
    return cardContent;
  }

  return (
    <Link href={`/closet/${garment.id}`} className="block">
      {cardContent}
    </Link>
  );
}
