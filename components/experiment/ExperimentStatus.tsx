import { HugeiconsIcon } from "@hugeicons/react";
import CircleIcon from "@hugeicons/core-free-icons/CircleIcon";
import DiamondIcon from "@hugeicons/core-free-icons/DiamondIcon";
import Loading03Icon from "@hugeicons/core-free-icons/Loading03Icon";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

export enum ExperimentStatusEnum {
  IN_PROGRESS,
  BROKE,
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
    text: "text-blue-400",
    border: "border-blue-400",
    bg: "bg-blue-100",
    iconFill: "fill-blue-400",
  },
  [ExperimentStatusEnum.BROKE]: {
    label: "BROKE",
    icon: DiamondIcon,
    text: "text-destructive",
    border: "border-destructive",
    bg: "bg-destructive/10",
    iconFill: "fill-destructive",
  },
  [ExperimentStatusEnum.INCONCLUSIVE]: {
    label: "INCONCLUSIVE",
    icon: Loading03Icon,
    text: "text-gray-400",
    border: "border-gray-400",
    bg: "bg-gray-100",
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
