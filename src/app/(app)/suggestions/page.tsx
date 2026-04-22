"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { SuggestionCard } from "@/components/suggestions/suggestion-card";
import { Suggestion } from "@/types";

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchSuggestions = React.useCallback(async () => {
    try {
      const res = await fetch("/api/suggestions");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Failed to load suggestions");
      }
      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }, []);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      await fetchSuggestions();
      setLoading(false);
    }
    load();
  }, [fetchSuggestions]);

  const handleDismiss = async (id: string) => {
    // Optimistically remove from list
    setSuggestions((prev) => prev.filter((s) => s.id !== id));

    try {
      await fetch(`/api/suggestions/${id}/dismiss`, { method: "POST" });
    } catch {
      // Best effort — already removed from UI
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);

    try {
      // Dismiss all current active suggestions first
      await Promise.all(
        suggestions.map((s) =>
          fetch(`/api/suggestions/${s.id}/dismiss`, { method: "POST" }).catch(() => {})
        )
      );
      setSuggestions([]);

      // Fetch new suggestions
      await fetchSuggestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Shop Smart</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            AI-powered recommendations based on gaps in your wardrobe
          </p>
        </div>

        <Button
          variant="outline"
          size="md"
          onClick={handleRefresh}
          disabled={refreshing || loading}
        >
          {refreshing ? "Refreshing..." : "Refresh suggestions"}
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <p className="text-zinc-500 text-sm">Analyzing your wardrobe...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-8 text-center">
          <p className="text-zinc-300 font-medium">{error}</p>
          {error.includes("Lifetime") && (
            <p className="text-sm text-zinc-500 mt-2">
              Upgrade to Lifetime access to unlock personalized shopping suggestions.
            </p>
          )}
        </div>
      ) : suggestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <p className="text-white font-medium">No suggestions right now</p>
          <p className="text-zinc-400 text-sm text-center max-w-sm">
            Add more garments to your closet and we&#39;ll find the pieces that unlock the most new outfits.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onDismiss={handleDismiss}
            />
          ))}
        </div>
      )}
    </>
  );
}
