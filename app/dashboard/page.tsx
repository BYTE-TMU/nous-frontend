import { NewExperimentButton } from "@/components/new-experiment/NewExperimentButton";

// Placeholder until the dashboard lands (see the dashboard PR). It only hosts the
// new-experiment trigger so the dialog can be tried out.
export default function Page() {
  return (
    <main className="p-6">
      <NewExperimentButton />
    </main>
  );
}
