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
      <ExperimentStatus status={status} variant="icon" className="size-8" />
      <h1 className="max-w-full break-words text-center text-2xl leading-tight font-bold sm:text-[32px]">{name}</h1>
      <div className="flex max-w-full flex-wrap items-center justify-center gap-2 break-all text-center text-base text-muted-foreground sm:text-xl">
        <p>{attacker}</p>
        <HugeiconsIcon icon={ArrowRight02Icon} data-icon="inline-center" className="size-5" />
        <p>{defender}</p>
      </div>
    </div>
  );
}
