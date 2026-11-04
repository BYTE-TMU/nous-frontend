import TurnView from "./TurnView";
import { countCompletedTurns } from "./turns";
import type { Turn } from "./types";

type Props = {
  turns: Turn[];
  attackerModel: string;
  defenderModel: string;
};

export default function Transcript({ turns, attackerModel, defenderModel }: Props) {
  const completed = countCompletedTurns(turns);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row items-baseline justify-between gap-4">
        <h2 className="text-sm font-medium tracking-wide">
          TRANSCRIPT <span aria-hidden>•</span>{" "}
          <span className="text-muted-foreground">
            {completed} {completed === 1 ? "TURN" : "TURNS"} SO FAR
          </span>
        </h2>
        <p className="text-sm text-muted-foreground">1 turn = Attacker message + Defender reply</p>
      </div>

      {turns.map((turn) => (
        <TurnView
          key={turn.number}
          turn={turn}
          attackerModel={attackerModel}
          defenderModel={defenderModel}
        />
      ))}
    </div>
  );
}
