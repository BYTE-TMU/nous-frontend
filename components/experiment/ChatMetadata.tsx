import { HugeiconsIcon } from "@hugeicons/react";
import ExperimentStatus, { ExperimentStatusEnum } from "./ExperimentStatus";
import ArrowRight02Icon from "@hugeicons/core-free-icons/ArrowRight02Icon";

type Props = {
  status: ExperimentStatusEnum;
  attacker: string;
  defender: string;
  name: string;
}
export default function ExperimentMetadata({ status, attacker, defender, name }: Props) {
  return (
    <div className="flex flex-col items-center justify-between w-full gap-0.5">
      <ExperimentStatus status={status} variant="icon" className="size-10" />
      <h3 className="text-lg font-semibold">{name}</h3>
      <div className="flex flex-row items-center gap-2">
        <p className="text-sm text-muted-foreground">{attacker}</p>
        <HugeiconsIcon icon={ArrowRight02Icon} data-icon="inline-center" className="size-4" />
        <p className="text-sm text-muted-foreground">{defender}</p>
      </div>
    </div>
  );
}