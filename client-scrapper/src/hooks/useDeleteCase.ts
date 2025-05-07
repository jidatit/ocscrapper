import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCase } from '@/api/apiClient';
import { toast } from 'sonner';

export function useDeleteCase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ caseNumber, deleteFile }: { caseNumber: string; deleteFile: boolean }) => 
      deleteCase(caseNumber, deleteFile),
    onSuccess: () => {
      // Invalidate cases query to refetch after deletion
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast.success('Case deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete case: ${error.message}`);
    },
  });
}