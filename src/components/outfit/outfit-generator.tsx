"use client";

import * as React from "react";
import { Outfit } from "@/types";
import { Button } from "@/components/ui/button";
import { OutfitCard } from "@/components/outfit/outfit-card";

export function OutfitGenerator() {
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<Outfit[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/outfits/generate", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || "Failed to generate outfits");
        return;
      }

      setResults(data.outfits ?? []);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="primary"
          size="md"
          disabled={loading}
          onClick={handleGenerate}
        >
          {loading ? "Generating..." : "Generate outfits"}
        </Button>
        {loading && (
          <p className="text-sm text-zinc-400">
            AI is picking your best combinations...
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950 px-4 py-3">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {results.length > 0 && (
        <div>
          <p className="text-sm text-zinc-400 mb-4">
            {results.length} outfit{results.length !== 1 ? "s" : ""} generated
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((outfit) => (
              <OutfitCard key={outfit.id} outfit={outfit} />
            ))}
          </div>
        </div>
      )}

      {!loading && results.length === 0 && !error && (
        <p className="text-sm text-zinc-500 text-center py-12">
          Click Generate to get AI outfit suggestions from your closet
        </p>
      )}
    </div>
  );
}
