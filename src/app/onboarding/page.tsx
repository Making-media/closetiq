"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/user-store";
import { StyleGoal } from "@/types";
import { StepGoals } from "@/components/onboarding/step-goals";
import { StepScan } from "@/components/onboarding/step-scan";
import { StepFirstOutfit } from "@/components/onboarding/step-first-outfit";

type Step = 1 | 2 | 3;

const TOTAL_STEPS = 3;

export default function OnboardingPage() {
  const router = useRouter();
  const { updateStyleGoals, completeOnboarding } = useUserStore();
  const [step, setStep] = React.useState<Step>(1);

  const handleGoalsComplete = async (goals: StyleGoal[]) => {
    await updateStyleGoals(goals);
    setStep(2);
  };

  const handleScanComplete = () => {
    setStep(3);
  };

  const handleFirstOutfitComplete = async () => {
    await completeOnboarding();
    router.push("/closet");
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-start py-12 px-6">
      <div className="w-full max-w-2xl space-y-8">
        {/* Logo */}
        <div className="text-center">
          <span className="text-white font-semibold text-lg tracking-tight">ClosetIQ</span>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={[
                "flex-1 h-1 rounded-full transition-colors",
                i + 1 <= step ? "bg-white" : "bg-zinc-800",
              ].join(" ")}
            />
          ))}
        </div>

        {/* Step label */}
        <p className="text-xs text-zinc-500 text-center">
          Step {step} of {TOTAL_STEPS}
        </p>

        {/* Step content */}
        <div>
          {step === 1 && <StepGoals onComplete={handleGoalsComplete} />}
          {step === 2 && <StepScan onComplete={handleScanComplete} />}
          {step === 3 && <StepFirstOutfit onComplete={handleFirstOutfitComplete} />}
        </div>
      </div>
    </div>
  );
}
