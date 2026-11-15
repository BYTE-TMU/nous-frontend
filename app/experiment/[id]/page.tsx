import ExperimentPage from "@/components/experiment/ExperimentPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ExperimentPage runId={id} />;
}
