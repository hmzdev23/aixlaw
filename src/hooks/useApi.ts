"use client";

import useSWR, { type SWRConfiguration } from "swr";
import { apiGetJson } from "@/lib/api/client";

export function useApi<T>(path: string | null, config?: SWRConfiguration<T>) {
  return useSWR<T>(path, path ? apiGetJson<T> : null, {
    revalidateOnFocus: false,
    ...config,
  });
}
