import { Card, CardContent, CardDescription, CardHeader } from "../ui/Card";
import type { ExperimentSetup } from "./types";

type Props = {
  setup: ExperimentSetup;
};

const FIELDS: { label: string; key: keyof ExperimentSetup }[] = [
  { label: "Defender persona", key: "defenderPersona" },
  { label: "Rule", key: "rule" },
  { label: "Attack strategy", key: "attackStrategy" },
  { label: "Attacker model", key: "attackerModel" },
  { label: "Defender model", key: "defenderModel" },
];

/** Read-only: the setup is fixed once the conversation starts. */
export default function ExperimentSetupPanel({ setup }: Props) {
  return (
    <Card className="rounded-[13px] border-[1.5px] border-signal-lime ring-0 [--card-spacing:--spacing(7)]">
      <CardHeader>
        <CardDescription className="text-sm text-foreground">Locked when the conversation started.</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col gap-4 border-t border-dashed border-signal-lime pt-5">
          {FIELDS.map(({ label, key }) => (
            <div key={key} className="flex flex-col gap-0.5">
              <dt className="text-[13px] font-semibold text-foreground uppercase">
                {label}
              </dt>
              <dd className="text-sm whitespace-pre-wrap break-words">{setup[key]}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
