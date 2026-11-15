import Transcript from "@/components/transcript/Transcript";
import type { Turn } from "@/components/transcript/types";

type Props = {
  turns: Turn[];
  attackerModel: string;
  defenderModel: string;
};

export default function ChatContent({ turns, attackerModel, defenderModel }: Props) {
  return (
    <div className="col-span-6">
      <Transcript turns={turns} attackerModel={attackerModel} defenderModel={defenderModel} />
    </div>
  );
}
