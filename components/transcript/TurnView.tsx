import { MessageGroup } from "@/components/ui/message";
import TranscriptMessageView from "./TranscriptMessageView";
import TurnMarker from "./TurnMarker";
import type { Turn } from "./types";

type Props = {
  turn: Turn;
  attackerModel: string;
  defenderModel: string;
};

/** A turn marker followed by the attacker's message and the defender's reply. */
export default function TurnView({ turn, attackerModel, defenderModel }: Props) {
  return (
    <section aria-label={`Turn ${turn.number}`} className="flex flex-col gap-6">
      <TurnMarker number={turn.number} />
      <MessageGroup className="gap-6">
        <TranscriptMessageView role="attacker" model={attackerModel} message={turn.attacker}
          turnNumber={turn.number}
        />
        {turn.defender && (
          <TranscriptMessageView role="defender" model={defenderModel} message={turn.defender}
            turnNumber={turn.number}
          />
        )}
      </MessageGroup>
    </section>
  );
}
