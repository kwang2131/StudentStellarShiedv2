import { CreateBondForm } from "@/components/create-bond-form";
import { PageIntro } from "@/components/page-intro";

export default function NewBondPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        description="Create the off-chain case first. Once the global Soroban contract id is configured, initialize and fund the on-chain case from the detail page."
        eyebrow="Create"
        title="Open a new StudyBond case"
      />
      <section className="surface-panel rounded-[1.75rem] p-5">
        <CreateBondForm />
      </section>
    </div>
  );
}
