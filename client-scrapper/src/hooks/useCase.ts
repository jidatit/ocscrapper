import { useQuery } from "@tanstack/react-query";
import { getCase } from "@/api/apiClient";

export function useCase(caseNumber: string) {
  return useQuery({
    queryKey: ["case", caseNumber],
    queryFn: () => getCase(caseNumber),
    enabled: !!caseNumber,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
