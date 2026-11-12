"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NewExperimentDialog } from "./NewExperimentDialog";

// Drop-in trigger: owns the open state, so a page only has to render it.
export function NewExperimentButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        + New experiment
      </Button>
      <NewExperimentDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
