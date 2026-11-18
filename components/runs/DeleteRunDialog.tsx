"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApiError, deleteRun } from "@/lib/api";
import { getToken } from "@/lib/auth";

type Props = {
  /** The run to delete; null keeps the dialog closed. */
  run: { id: string; name: string; owner?: string } | null;
  onClose: () => void;
  onDeleted: () => void;
};

/** Asks "are you sure?" before permanently deleting a run. */
export default function DeleteRunDialog({ run, onClose, onDeleted }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string>();

  const close = () => {
    if (deleting) return;
    setError(undefined);
    onClose();
  };

  const confirm = async () => {
    if (!run) return;
    setDeleting(true);
    setError(undefined);
    try {
      await deleteRun(run.id, getToken());
      onDeleted();
    } catch (failure) {
      const status = failure instanceof ApiError ? failure.status : -1;
      setError(
        status === 409
          ? "This run is still going. Stop it before deleting."
          : status === 403
            ? "You don't have permission to delete runs."
            : status === 404
              ? "This run was already deleted."
              : "Couldn't delete. Try again.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={run !== null} onOpenChange={(open) => (open ? undefined : close())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete &ldquo;{run?.name}&rdquo;?</DialogTitle>
          <DialogDescription>
            {run?.owner ? `This run belongs to ${run.owner}. ` : ""}
            This permanently deletes the run, its transcript and its judge results. This
            can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={deleting}>
              Cancel
            </Button>
          </DialogClose>
          <Button variant="destructive" disabled={deleting} onClick={() => void confirm()}>
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}