import { useMutation, useQueryClient } from '@tanstack/vue-query';
import tasksService from '@/services/tasks.service';

export function useDeleteMultipleTasksMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids) => {
      for (const id of ids) {
        await tasksService.deleteTask(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    }
  });
} 