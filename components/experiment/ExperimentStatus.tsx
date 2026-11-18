import { HugeiconsIcon } from "@hugeicons/react";
import CircleIcon from "@hugeicons/core-free-icons/CircleIcon";
import DiamondIcon from "@hugeicons/core-free-icons/DiamondIcon";
import Loading03Icon from "@hugeicons/core-free-icons/Loading03Icon";
import PauseIcon from "@hugeicons/core-free-icons/PauseIcon";
import Square01Icon from "@hugeicons/core-free-icons/Square01Icon";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import type { RunListItem } from "@/lib/api";

export enum ExperimentStatusEnum {
  IN_PROGRESS,
  BROKE,
  /** The backend outcome `held`: the run completed without a break. */
  HELD,
  /** A run with no outcome (it failed). */
  INCONCLUSIVE,
  PENDING,
  PAUSED,
}

/** Map backend run state (+ outcome when available) to a display status. */
export function deriveStatus(state: RunListItem["state"], outcome?: string | null): ExperimentStatusEnum {
  switch (state) {
    case "pending":
      return ExperimentStatusEnum.PENDING;
    case "running":
    case "stopping":
      return ExperimentStatusEnum.IN_PROGRESS;
    case "paused":
      return ExperimentStatusEnum.PAUSED;
    case "failed":
      return ExperimentStatusEnum.INCONCLUSIVE;
    case "completed":
      switch (outcome) {
        case "broke":
          return ExperimentStatusEnum.BROKE;
        case "held":
          return ExperimentStatusEnum.HELD;
        case "inconclusive":
        default:
          return ExperimentStatusEnum.INCONCLUSIVE;
      }
    default:
      return ExperimentStatusEnum.IN_PROGRESS;
  }
}

/**
 * - `badge`: pill with icon and label (default)
 * - `icon`: the bare icon, for a chat room header
 * - `text`: label alone, coloured
 */
export type ExperimentStatusVariant = "badge" | "icon" | "text";

type Props = {
  status: ExperimentStatusEnum;
  variant?: ExperimentStatusVariant;
  className?: string;
};

const STATUS_CONFIG = {
  [ExperimentStatusEnum.IN_PROGRESS]: {
    label: "IN PROGRESS",
    icon: CircleIcon,
    text: "text-status-in-progress",
    border: "border-status-in-progress",
    bg: "bg-status-in-progress/10",
    iconFill: "fill-status-in-progress",
  },
  [ExperimentStatusEnum.BROKE]: {
    label: "BROKE",
    icon: DiamondIcon,
    text: "text-destructive",
    border: "border-destructive",
    bg: "bg-destructive/10",
    iconFill: "fill-destructive",
  },
  [ExperimentStatusEnum.HELD]: {
    label: "HELD",
    icon: CircleIcon,
    text: "text-impact-green",
    border: "border-impact-green",
    bg: "bg-impact-green/25",
    iconFill: "fill-impact-green",
  },
  [ExperimentStatusEnum.INCONCLUSIVE]: {
    label: "INCONCLUSIVE",
    icon: Loading03Icon,
    text: "text-status-inconclusive",
    border: "border-status-inconclusive",
    bg: "bg-status-inconclusive/10",
    iconFill: "",
  },
  [ExperimentStatusEnum.PENDING]: {
    label: "PENDING",
    icon: Square01Icon,
    text: "text-status-inconclusive",
    border: "border-status-inconclusive",
    bg: "bg-status-inconclusive/10",
    iconFill: "",
  },
  [ExperimentStatusEnum.PAUSED]: {
    label: "PAUSED",
    icon: PauseIcon,
    text: "text-amber-400",
    border: "border-amber-400",
    bg: "bg-amber-400/10",
    iconFill: "",
  },
};

export default function ExperimentStatus({ status, variant = "badge", className }: Props) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  const icon = (
    <HugeiconsIcon
      icon={config.icon}
      size="sm"
      data-icon="inline-start"
      className={config.iconFill}
    />
  );

  switch (variant) {
    case "icon":
      return (
        <HugeiconsIcon
          icon={config.icon}
          role="img"
          aria-label={config.label}
          className={cn(config.text, config.iconFill, className)}
        />
      );
    case "text":
      return (
        <span className={cn("text-xs font-medium", config.text, className)}>{config.label}</span>
      );
    case "badge":
    default:
      return (
        <Badge
          className={cn(
            "flex flex-row items-center gap-2 px-4 py-2",
            config.border,
            config.bg,
            config.text,
            className,
          )}
        >
          {icon}
          {config.label}
        </Badge>
      );
  }
}
