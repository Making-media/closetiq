import { create } from "zustand";
import { Garment, GarmentType, Season } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface ClosetFilters {
  type: GarmentType | null;
  season: Season | null;
  color: string | null;
  formality: number | null;
  search: string;
}

interface ClosetState {
  garments: Garment[];
  filters: ClosetFilters;
  viewMode: "grid" | "3d";
  loading: boolean;
  fetchGarments: () => Promise<void>;
  addGarment: (garment: Garment) => void;
  removeGarment: (id: string) => Promise<void>;
  updateGarment: (id: string, updates: Partial<Garment>) => Promise<void>;
  setFilter: (key: keyof ClosetFilters, value: string | number | null) => void;
  clearFilters: () => void;
  setViewMode: (mode: "grid" | "3d") => void;
  filteredGarments: () => Garment[];
}

const defaultFilters: ClosetFilters = {
  type: null,
  season: null,
  color: null,
  formality: null,
  search: "",
};

export const useClosetStore = create<ClosetState>((set, get) => ({
  garments: [],
  filters: { ...defaultFilters },
  viewMode: "grid",
  loading: false,

  fetchGarments: async () => {
    set({ loading: true });
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("garments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        set({ loading: false });
        return;
      }

      set({ garments: (data as Garment[]) ?? [], loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addGarment: (garment: Garment) => {
    set((state) => ({ garments: [garment, ...state.garments] }));
  },

  removeGarment: async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("garments").delete().eq("id", id);

    if (!error) {
      set((state) => ({
        garments: state.garments.filter((g) => g.id !== id),
      }));
    }
  },

  updateGarment: async (id: string, updates: Partial<Garment>) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("garments")
      .update(updates)
      .eq("id", id);

    if (!error) {
      set((state) => ({
        garments: state.garments.map((g) =>
          g.id === id ? { ...g, ...updates } : g
        ),
      }));
    }
  },

  setFilter: (key: keyof ClosetFilters, value: string | number | null) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    }));
  },

  clearFilters: () => {
    set({ filters: { ...defaultFilters } });
  },

  setViewMode: (mode: "grid" | "3d") => {
    set({ viewMode: mode });
  },

  filteredGarments: () => {
    const { garments, filters } = get();
    return garments.filter((garment) => {
      if (filters.type && garment.type !== filters.type) return false;
      if (filters.season && !garment.season.includes(filters.season))
        return false;
      if (filters.color) {
        const hasColor = garment.colors.some((c) =>
          c.hex.toLowerCase().includes(filters.color!.toLowerCase())
        );
        if (!hasColor) return false;
      }
      if (filters.formality !== null && garment.formality !== filters.formality)
        return false;
      if (
        filters.search &&
        !garment.name.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      return true;
    });
  },
}));
