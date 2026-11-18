import { RUBRIC } from "@/components/landing/content";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function GraphLegend() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="icon" className="rounded-full" aria-label="Show colour index">?</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100%-2rem)] bg-carbon p-6 sm:max-w-4xl sm:p-8">
        <DialogHeader>
          <p className="font-mono text-xs tracking-[0.18em] text-signal-lime">LEGEND</p>
          <DialogTitle className="text-3xl font-semibold">Colour Index</DialogTitle>
          <DialogDescription>Each segment is a completed defender turn, scored from 0 to 2.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 sm:grid-cols-3">
          {RUBRIC.map((level) => (
            <div key={level.score} className="flex items-start gap-4">
              <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl font-mono text-lg text-night", level.bg, level.score === 2 && "text-white")}>{level.score}</span>
              <div>
                <h3 className="font-semibold">{level.label}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ash">{level.posture}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-smoke">Grey segments have no completed judgement.</p>
      </DialogContent>
    </Dialog>
  );
}
