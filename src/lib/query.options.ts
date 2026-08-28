import { queryOptions } from "@tanstack/react-query";
import { getCurrentUserFn } from "#/lib/auth/auth.function.ts";

export const currentUserQueryOptions = queryOptions({
  queryKey: ["auth", "me"] as const,
  queryFn: () => getCurrentUserFn(),
  staleTime: 60 * 1000,
});
