import { Marker, MarkerContent } from "@/components/ui/marker";

type Props = {
  number: number;
};

/** Divider between turns. One turn = an attacker message plus the defender's reply. */
export default function TurnMarker({ number }: Props) {
  return (
    <Marker
      variant="separator"
      role="separator"
      aria-label={`Turn ${number}`}
      className="gap-6 text-foreground before:h-0.5 before:bg-signal-lime after:h-0.5 after:bg-signal-lime"
    >
      <MarkerContent className="text-[17px] font-medium">TURN {number}</MarkerContent>
    </Marker>
  );
}
