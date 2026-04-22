"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useClosetStore } from "@/store/closet-store";
import { useUserStore } from "@/store/user-store";
import { GarmentType, Season } from "@/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { GarmentCard } from "@/components/garment/garment-card";
import { ScanUpload } from "@/components/garment/scan-upload";
import { SceneLoader } from "@/components/3d/scene-loader";

const GARMENT_TYPES: GarmentType[] = [
  "shirt",
  "pants",
  "jacket",
  "dress",
  "skirt",
  "shoes",
  "accessory",
  "outerwear",
  "shorts",
];

const SEASONS: Season[] = ["spring", "summer", "fall", "winter"];

const FREE_TIER_MAX = 20;

export default function ClosetPage() {
  const [scanOpen, setScanOpen] = React.useState(false);
  const router = useRouter();

  const { garments, filters, loading, fetchGarments, setFilter, clearFilters, filteredGarments, viewMode, setViewMode } =
    useClosetStore();
  const { user, fetchUser } = useUserStore();

  React.useEffect(() => {
    fetchUser();
    fetchGarments();
  }, [fetchUser, fetchGarments]);

  const displayed = filteredGarments();
  const isFreeTier = !user || user.purchase_tier === "free";
  const hasActiveFilters = filters.type !== null || filters.season !== null;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">My Closet</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            {garments.length} garment{garments.length !== 1 ? "s" : ""}
            {isFreeTier && (
              <span className="text-zinc-500"> / {FREE_TIER_MAX} max</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={[
                "px-3 py-1.5 text-sm font-medium transition-colors",
                viewMode === "grid"
                  ? "bg-white text-black"
                  : "text-zinc-400 hover:text-white",
              ].join(" ")}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("3d")}
              className={[
                "px-3 py-1.5 text-sm font-medium transition-colors",
                viewMode === "3d"
                  ? "bg-white text-black"
                  : "text-zinc-400 hover:text-white",
              ].join(" ")}
            >
              3D
            </button>
          </div>

          <Button variant="primary" size="md" onClick={() => setScanOpen(true)}>
            + Scan garment
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {GARMENT_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setFilter("type", filters.type === type ? null : type)}
            className={[
              "px-3 py-1 rounded-full text-xs font-medium border transition-colors capitalize",
              filters.type === type
                ? "bg-white text-black border-white"
                : "bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-zinc-200",
            ].join(" ")}
          >
            {type}
          </button>
        ))}

        <div className="w-px h-4 bg-zinc-700 mx-1" />

        {SEASONS.map((season) => (
          <button
            key={season}
            onClick={() =>
              setFilter("season", filters.season === season ? null : season)
            }
            className={[
              "px-3 py-1 rounded-full text-xs font-medium border transition-colors capitalize",
              filters.season === season
                ? "bg-white text-black border-white"
                : "bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-zinc-200",
            ].join(" ")}
          >
            {season}
          </button>
        ))}

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-1 rounded-full text-xs font-medium text-zinc-400 hover:text-white transition-colors underline underline-offset-2 ml-1"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <p className="text-zinc-500 text-sm">Loading your closet...</p>
        </div>
      ) : viewMode === "3d" ? (
        user?.purchase_tier === "free" ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-8 text-center">
            <p className="text-zinc-400">3D Closet View</p>
            <p className="text-sm text-zinc-600 mt-1">Upgrade to Lifetime to unlock 3D view</p>
          </div>
        ) : (
          <SceneLoader
            garments={displayed}
            onGarmentClick={(garment) => router.push(`/closet/${garment.id}`)}
          />
        )
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          {garments.length === 0 ? (
            <>
              <div className="text-5xl text-zinc-600">&#128248;</div>
              <p className="text-white font-medium">Your closet is empty</p>
              <p className="text-zinc-400 text-sm">
                Scan your first garment to get started.
              </p>
              <Button variant="primary" size="md" onClick={() => setScanOpen(true)}>
                + Scan garment
              </Button>
            </>
          ) : (
            <>
              <p className="text-white font-medium">No garments match your filters</p>
              <Button variant="outline" size="md" onClick={clearFilters}>
                Clear filters
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayed.map((garment) => (
            <GarmentCard key={garment.id} garment={garment} />
          ))}
        </div>
      )}

      {/* Scan Modal */}
      <Modal
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        title="Scan a garment"
      >
        <ScanUpload onComplete={() => setScanOpen(false)} />
      </Modal>
    </>
  );
}
