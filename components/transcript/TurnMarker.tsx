import { Marker, MarkerContent } from "@/components/ui/marker";

type Props = {
  number: number;
};

/** Divider between turns. One turn = an attacker message plus the defender's reply. */
export default function TurnMarker({ number }: Props) {
  return (
    <Marker variant="separator" role="separator" aria-label={`Turn ${number}`}>
      <MarkerContent className="text-xs font-medium tracking-wide">TURN {number}</MarkerContent>
    </Marker>
  );
}
