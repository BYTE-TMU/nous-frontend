"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ApiError, renameRun } from "@/lib/api";
import { getToken } from "@/lib/auth";

type Props = {
  runId: string;
  name: string;
  onRenamed: () => void;
};

/** Admin-only: rename the experiment from the header. */
export default function RenameRun({ runId, name, onRenamed }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const open = () => {
    setValue(name);
    setError(undefined);
    setEditing(true);
  };

  const save = async () => {
    const next = value.trim();
    if (!next) return;
    if (next === name) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await renameRun(runId, next, getToken());
      setEditing(false);
      onRenamed();
    } catch (failure) {
      setError(
        failure instanceof ApiError && failure.status === 403
          ? "Only admins can rename."
          : "Couldn't rename. Try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <Button variant="outline" onClick={open}>
        Rename
      </Button>
    );
  }
  return (
    <form
      className="flex flex-col items-end gap-1"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <div className="flex items-center gap-2">
        <input
          aria-label="Experiment name"
          autoFocus
          maxLength={200}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="h-9 w-56 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <Button type="submit" disabled={saving || !value.trim()}>
          Save
        </Button>
        <Button type="button" variant="outline" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
    </form>
  );
}
