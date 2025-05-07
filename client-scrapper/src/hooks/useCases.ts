// hooks/useCases.ts
import { useQuery } from "@tanstack/react-query";
import { getCases } from "@/api/apiClient";

export function useCases(
  page: number,
  limit: number,
  search: string,
  startFiled?: string,
  endFiled?: string,
  startUpdated?: string,
  endUpdated?: string
) {
  return useQuery({
    queryKey: [
      "cases",
      page,
      limit,
      search,
      startFiled,
      endFiled,
      startUpdated,
      endUpdated,
    ],
    queryFn: () =>
      getCases(
        page,
        limit,
        search,
        startFiled,
        endFiled,
        startUpdated,
        endUpdated
      ),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  });
}
