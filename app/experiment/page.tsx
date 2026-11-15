import { redirect } from "next/navigation";

// Experiments live at /experiment/{id}. Send the bare route (and old ?run= links) home.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ run?: string }>;
}) {
  const { run } = await searchParams;
  redirect(run ? `/experiment/${encodeURIComponent(run)}` : "/");
}
