import { create } from "zustand";
import { User, StyleGoal } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface UserState {
  user: User | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
  updateStyleGoals: (goals: StyleGoal[]) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: false,

  fetchUser: async () => {
    set({ loading: true });
    const supabase = createClient();
    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        set({ user: null, loading: false });
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (profileError) {
        set({ user: null, loading: false });
        return;
      }

      set({ user: profile as User, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  updateStyleGoals: async (goals: StyleGoal[]) => {
    const { user } = get();
    if (!user) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ style_goals: goals })
      .eq("id", user.id);

    if (!error) {
      set({ user: { ...user, style_goals: goals } });
    }
  },

  completeOnboarding: async () => {
    const { user } = get();
    if (!user) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ onboarding_complete: true })
      .eq("id", user.id);

    if (!error) {
      set({ user: { ...user, onboarding_complete: true } });
    }
  },

  logout: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null });
  },
}));
