import { create } from "zustand";
import { Outfit, Garment } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface OutfitState {
  outfits: Outfit[];
  builderGarments: Garment[];
  loading: boolean;
  fetchOutfits: () => Promise<void>;
  addToBuilder: (garment: Garment) => void;
  removeFromBuilder: (garmentId: string) => void;
  clearBuilder: () => void;
  saveOutfit: (outfit: Outfit) => void;
  rateOutfit: (id: string, rating: number) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
}

export const useOutfitStore = create<OutfitState>((set, get) => ({
  outfits: [],
  builderGarments: [],
  loading: false,

  fetchOutfits: async () => {
    set({ loading: true });
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("outfits")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        set({ loading: false });
        return;
      }

      set({ outfits: (data as Outfit[]) ?? [], loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addToBuilder: (garment: Garment) => {
    const { builderGarments } = get();
    const alreadyAdded = builderGarments.some((g) => g.id === garment.id);
    if (!alreadyAdded) {
      set({ builderGarments: [...builderGarments, garment] });
    }
  },

  removeFromBuilder: (garmentId: string) => {
    set((state) => ({
      builderGarments: state.builderGarments.filter((g) => g.id !== garmentId),
    }));
  },

  clearBuilder: () => {
    set({ builderGarments: [] });
  },

  saveOutfit: (outfit: Outfit) => {
    set((state) => ({ outfits: [outfit, ...state.outfits] }));
  },

  rateOutfit: async (id: string, rating: number) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("outfits")
      .update({ user_rating: rating })
      .eq("id", id);

    if (!error) {
      set((state) => ({
        outfits: state.outfits.map((o) =>
          o.id === id ? { ...o, user_rating: rating } : o
        ),
      }));
    }
  },

  toggleFavorite: async (id: string) => {
    const { outfits } = get();
    const outfit = outfits.find((o) => o.id === id);
    if (!outfit) return;

    const newFavorited = !outfit.favorited;
    const supabase = createClient();
    const { error } = await supabase
      .from("outfits")
      .update({ favorited: newFavorited })
      .eq("id", id);

    if (!error) {
      set((state) => ({
        outfits: state.outfits.map((o) =>
          o.id === id ? { ...o, favorited: newFavorited } : o
        ),
      }));
    }
  },
}));
