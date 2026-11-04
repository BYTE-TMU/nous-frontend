import ChatBody from "@/components/experiment/ChatBody";
import ChatHeader from "@/components/experiment/ChatHeader";
import ExperimentOverview from "@/components/experiment/ExperimentOverview";

export default function Page() {
  return (
    <main className="flex h-full flex-col items-center justify-between">
      <ChatHeader />
      <ChatBody />
    </main>
  );
}