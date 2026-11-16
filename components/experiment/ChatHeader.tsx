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
  /** Run controls while the run is live, or "View result" once it has ended. */
  controls?: ReactNode;
};

export default function ChatHeader({ name, status, attacker, defender, controls }: Props) {
  return (
    <div className="flex flex-row items-center justify-between w-full gap-4 border-b p-4">
      <div className="flex min-w-40 justify-start">
        <Button
          asChild
          size="icon-lg"
          className="size-11 rounded-[13px] bg-black text-signal-lime hover:bg-signal-lime hover:text-night"
        >
          <Link href="/" aria-label="All experiments" title="All experiments">
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-6" />
          </Link>
        </Button>
      </div>
      <ExperimentMetadata name={name} status={status} attacker={attacker} defender={defender} />
      <div className="flex min-w-40 justify-end">{controls}</div>
    </div>
  );
}
