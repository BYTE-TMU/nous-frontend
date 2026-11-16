"use client";

import { useEffect, useState } from "react";
import { getModels, getPrompts, type ModelInfo, type PromptCatalog } from "../../lib/api";
import { getToken } from "../../lib/auth";
import type { ModelOption, PresetOption } from "./options";

export type Catalog = {
  models: ModelOption[];
  defenderPresets: PresetOption[];
  attackerPresets: PresetOption[];
};

const empty: Catalog = { models: [], defenderPresets: [], attackerPresets: [] };

function toModelOption(model: ModelInfo): ModelOption {
  return {
    id: model.id,
    label: model.id.split("/").pop() ?? model.id,
    description: `${model.provider} - ${model.size}`,
  };
}

function toPresets(catalog: PromptCatalog): Pick<Catalog, "defenderPresets" | "attackerPresets"> {
  return {
    defenderPresets: catalog.defenders.map((d) => ({ id: d.name, label: d.name, summary: d.summary })),
    attackerPresets: catalog.attackers.map((a) => ({ id: a.name, label: a.summary, summary: a.prompt })),
  };
}

/** Models and preset prompts for the form, fetched from the backend once per open. */
export function useCatalog(enabled: boolean) {
  const [catalog, setCatalog] = useState<Catalog>(empty);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setStatus("loading");
    const token = getToken();
    Promise.all([getModels(token), getPrompts(token)])
      .then(([models, prompts]) => {
        if (cancelled) return;
        setCatalog({ models: models.map(toModelOption), ...toPresets(prompts) });
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { catalog, status };
}
