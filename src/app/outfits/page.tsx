"use client";

import * as React from "react";
import { Nav } from "@/components/ui/nav";
import { OutfitGenerator } from "@/components/outfit/outfit-generator";
import { OutfitBuilder } from "@/components/outfit/outfit-builder";
import { OutfitCard } from "@/components/outfit/outfit-card";
import { useOutfitStore } from "@/store/outfit-store";
import { useClosetStore } from "@/store/closet-store";
import { Outfit } from "@/types";

type Tab = "ai" | "build";

export default function OutfitsPage() {
  const [activeTab, setActiveTab] = React.useState<Tab>("ai");
  const [detailedOutfits, setDetailedOutfits] = React.useState<Outfit[]>([]);

  const { outfits, fetchOutfits } = useOutfitStore();
  const { fetchGarments } = useClosetStore();

  React.useEffect(() => {
    fetchOutfits();
    fetchGarments();
  }, [fetchOutfits, fetchGarments]);

  // Fetch full detail (including garments) for each outfit in state
  React.useEffect(() => {
    if (outfits.length === 0) {
      setDetailedOutfits([]);
      return;
    }

    let cancelled = false;

    async function fetchDetails() {
      const results = await Promise.all(
        outfits.map(async (outfit) => {
          try {
            const res = await fetch(`/api/outfits/${outfit.id}`);
            if (!res.ok) return outfit;
            const data = await res.json();
            return data.outfit as Outfit;
          } catch {
            return outfit;
          }
        })
      );

      if (!cancelled) {
        setDetailedOutfits(results);
      }
    }

    fetchDetails();

    return () => {
      cancelled = true;
    };
  }, [outfits]);

  return (
    <div className="min-h-screen bg-black">
      <Nav />
      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Outfits</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            Generate AI suggestions or build your own combinations
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 mb-8">
          {(["ai", "build"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab === tab
                  ? "text-white border-white"
                  : "text-zinc-400 border-transparent hover:text-zinc-200",
              ].join(" ")}
            >
              {tab === "ai" ? "AI Suggestions" : "Build Your Own"}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="mb-12">
          {activeTab === "ai" ? <OutfitGenerator /> : <OutfitBuilder />}
        </div>

        {/* Previous outfits */}
        {detailedOutfits.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Previous Outfits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {detailedOutfits.map((outfit) => (
                <OutfitCard key={outfit.id} outfit={outfit} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
