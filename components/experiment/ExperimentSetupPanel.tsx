import { Card, CardContent, CardDescription, CardHeader } from "../ui/card";
import type { ExperimentSetup } from "./types";

type Props = {
  setup: ExperimentSetup;
};

const FIELDS: { label: string; key: keyof ExperimentSetup }[] = [
  { label: "Defender persona", key: "defenderPersona" },
  { label: "Attack strategy", key: "attackStrategy" },
  { label: "Attacker model", key: "attackerModel" },
  { label: "Defender model", key: "defenderModel" },
];

/** Read-only: the setup is fixed once the conversation starts. */
export default function ExperimentSetupPanel({ setup }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>Locked when the conversation started.</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col gap-4 border-t pt-4">
          {FIELDS.map(({ label, key }) => (
            <div key={key} className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {label}
              </dt>
              <dd className="text-sm">{setup[key]}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
