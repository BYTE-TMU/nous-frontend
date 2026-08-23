# components/upload/

## Purpose

Export upload UX, including the long-running processing wait.

## What belongs here

`UploadDropzone.tsx`, `ProcessingStatus.tsx`.

## What does not

- Parsing or chunking logic — that's `nous-backend`. This directory only uploads a file and polls a job endpoint.

## Key files

| File | Purpose |
|---|---|
| `ProcessingStatus.tsx` | honest progress on a potentially many-minute job — never an indeterminate spinner |

## Rules

- Ingestion can take minutes. `ProcessingStatus` polls the job endpoint and shows real progress — see the "states that matter more than usual here" section in the root `README.md`.
