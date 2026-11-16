import RuleBanner from "./RuleBanner";
import TurnView from "./TurnView";
import { countCompletedTurns } from "./turns";
import type { Turn } from "./types";

type Props = {
  turns: Turn[];
  attackerModel: string;
  defenderModel: string;
  /** The rule under test, pinned above the first turn. */
  rule?: string;
};

export default function Transcript({ turns, attackerModel, defenderModel, rule }: Props) {
  const completed = countCompletedTurns(turns);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5">
        <div className="flex flex-row items-baseline justify-between gap-4">
          <h2 className="text-[17px] font-medium">
            TRANSCRIPT <span aria-hidden>•</span>{" "}
            <span>
              {completed} {completed === 1 ? "TURN" : "TURNS"} SO FAR
            </span>
          </h2>
          <p className="text-sm text-muted-foreground">1 turn = Attacker message + Defender reply</p>
        </div>
        {rule && <RuleBanner rule={rule} />}
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
