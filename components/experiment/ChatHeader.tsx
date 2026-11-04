import { Button } from "@/components/ui/button";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import PauseIcon from "@hugeicons/core-free-icons/PauseIcon";
import StopIcon from "@hugeicons/core-free-icons/StopIcon";
import { HugeiconsIcon } from "@hugeicons/react";
import ExperimentMetadata from "./ChatMetadata";
import { ExperimentStatusEnum } from "./ExperimentStatus";
import Link from "next/link";

export default function ChatHeader() {
  return (
    <div className="flex flex-row items-center justify-between w-full gap-4 border-b p-4">
        <Link href="/dashboard">
          <Button variant="default" size="lg">
            <HugeiconsIcon icon={ArrowLeft01Icon} size="lg" data-icon="inline-start" />
            Experiments
          </Button> 
        </Link>
        <ExperimentMetadata status={ExperimentStatusEnum.IN_PROGRESS} attacker="Attacker" defender="Defender" />
        <div className="flex flex-row gap-2">
          <Button variant="secondary" size="lg">
            <HugeiconsIcon icon={PauseIcon} size="lg" data-icon="inline-start" />
            Pause
          </Button>
          <Button variant="default" size="lg">
            <HugeiconsIcon icon={StopIcon} size="lg" data-icon="inline-start" />
            Stop
          </Button>
        </div>
      </div>
  )
}