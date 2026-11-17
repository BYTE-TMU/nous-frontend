import { useQuery } from "@tanstack/react-query";
import { listRuns } from "./api";
import { getToken } from "./auth";

export function useRuns(params?: { q?: string; sort?: string }) {
  const token = getToken();
  return useQuery({
    queryKey: ["runs", params],
    queryFn: () => listRuns(token!, params),
    enabled: !!token,
  });
}
