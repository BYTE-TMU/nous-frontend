import BarGraphPage from "@/components/graph/BarGraphPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <main><BarGraphPage runId={id} /></main>;
}
