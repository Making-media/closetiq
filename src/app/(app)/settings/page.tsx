"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUserStore } from "@/store/user-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StyleGoal } from "@/types";

const GOAL_LABELS: Record<StyleGoal, string> = {
  "look-taller": "Look taller",
  "balance-frame": "Balance my frame",
  "dress-polished": "Dress more polished",
  "keep-casual": "Keep it casual",
  "more-color": "More color variety",
  "streamline-wardrobe": "Streamline my wardrobe",
  "stand-out": "Stand out more",
};

function SettingsContent() {
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get("payment");
  const { user, fetchUser } = useUserStore();
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  async function handleUpgrade() {
    setUpgrading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setUpgrading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-10">
      {paymentStatus === "success" && (
        <div className="rounded-lg bg-green-900/40 border border-green-700 px-5 py-4 text-green-200 text-sm">
          Payment successful! Your account has been upgraded to Lifetime Access.
        </div>
      )}

      {paymentStatus === "cancelled" && (
        <div className="rounded-lg bg-zinc-800 border border-zinc-700 px-5 py-4 text-zinc-300 text-sm">
          Payment cancelled. You can upgrade anytime from this page.
        </div>
      )}

      {/* Profile */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Profile</h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-3">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Name</p>
            <p className="text-sm text-zinc-100">{user?.name ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Email</p>
            <p className="text-sm text-zinc-100">{user?.email ?? "—"}</p>
          </div>
        </div>
      </section>

      {/* Plan */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Plan</h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Current Plan</p>
              {user?.purchase_tier === "lifetime" ? (
                <Badge variant="success">Lifetime Access</Badge>
              ) : (
                <Badge variant="default">Free</Badge>
              )}
            </div>

            {user?.purchase_tier !== "lifetime" && (
              <Button
                variant="primary"
                size="md"
                onClick={handleUpgrade}
                disabled={upgrading}
              >
                {upgrading ? "Redirecting…" : "Upgrade — $49.99"}
              </Button>
            )}
          </div>

          {user?.purchase_tier !== "lifetime" && (
            <p className="mt-4 text-xs text-zinc-500">
              One-time payment. Lifetime access to all features including 3D Closet and AI Stylist.
            </p>
          )}
        </div>
      </section>

      {/* Style Goals */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Style Goals</h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          {user?.style_goals && user.style_goals.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.style_goals.map((goal) => (
                <Badge key={goal} variant="outline">
                  {GOAL_LABELS[goal]}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No style goals set yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}
