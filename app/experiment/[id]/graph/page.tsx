import BarGraphPage from "@/components/graph/BarGraphPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BarGraphPage runId={id} />;
}
