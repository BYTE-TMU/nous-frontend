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
    <div className="flex w-full flex-wrap items-center justify-between gap-4 border-b p-4 lg:flex-nowrap">
      <div className="order-1 flex justify-start lg:min-w-40">
        <Button
          asChild
          size="icon-lg"
          className="size-11 rounded-[13px] bg-black text-signal-lime hover:bg-signal-lime hover:text-night"
        >
          <Link href="/dashboard" aria-label="All experiments" title="All experiments">
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-6" />
          </Link>
        </Button>
      </div>
      <div className="order-3 min-w-0 w-full lg:order-2 lg:flex-1">
        <ExperimentMetadata name={name} status={status} attacker={attacker} defender={defender} />
      </div>
      <div className="order-2 flex max-w-full justify-end lg:order-3 lg:min-w-40">{controls}</div>
    </div>
  );
}
