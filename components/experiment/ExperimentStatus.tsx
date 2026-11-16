import { HugeiconsIcon } from "@hugeicons/react";
import CircleIcon from "@hugeicons/core-free-icons/CircleIcon";
import DiamondIcon from "@hugeicons/core-free-icons/DiamondIcon";
import Loading03Icon from "@hugeicons/core-free-icons/Loading03Icon";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

export enum ExperimentStatusEnum {
  IN_PROGRESS,
  BROKE,
  /** The backend outcome `held`: the run completed without a break. */
  HELD,
  /** A run with no outcome (it failed). */
  INCONCLUSIVE,
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
