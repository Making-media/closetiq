"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Garment } from "@/types";

interface SceneLoaderProps {
  garments: Garment[];
  onGarmentClick?: (garment: Garment) => void;
}

const ClosetScene = dynamic(
  () => import("./closet-scene").then((mod) => mod.ClosetScene),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-center"
        style={{ height: "600px" }}
      >
        <p className="text-zinc-500 text-sm">Loading 3D view...</p>
      </div>
    ),
  }
);

export function SceneLoader({ garments, onGarmentClick }: SceneLoaderProps) {
  return <ClosetScene garments={garments} onGarmentClick={onGarmentClick} />;
}
