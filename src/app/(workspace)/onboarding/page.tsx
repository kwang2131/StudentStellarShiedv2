import { OnboardingForm } from "@/components/onboarding-form";
import { PageIntro } from "@/components/page-intro";

export default function OnboardingPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        description="Pick a role, connect Freighter or Rabet, confirm testnet state, and persist the minimal profile required for a StudyBond workflow."
        eyebrow="Onboarding"
        title="Start with a real Stellar wallet"
      />
      <OnboardingForm />
    </div>
  );
}
