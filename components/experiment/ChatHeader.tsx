import { Button } from "@/components/ui/Button";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactNode } from "react";
import ExperimentMetadata from "./ChatMetadata";
import { ExperimentStatusEnum } from "./ExperimentStatus";
import Link from "next/link";

type Props = {
  name: string;
  status: ExperimentStatusEnum;
  attacker: string;
  defender: string;
  /** Run controls (pause, resume, stop). Absent once the run has ended. */
  controls?: ReactNode;
};

export default function ChatHeader({ name, status, attacker, defender, controls }: Props) {
  return (
    <div className="flex flex-row items-center justify-between w-full gap-4 border-b p-4">
      <Link href="/">
        <Button variant="default" size="lg">
          <HugeiconsIcon icon={ArrowLeft01Icon} size="lg" data-icon="inline-start" />
          Experiments
        </Button>
      </Link>
      <ExperimentMetadata name={name} status={status} attacker={attacker} defender={defender} />
      <div className="flex min-w-40 justify-end">{controls}</div>
    </div>
  );
}
