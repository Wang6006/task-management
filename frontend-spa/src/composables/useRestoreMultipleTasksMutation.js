import { useMutation, useQueryClient } from '@tanstack/vue-query';
import tasksService from '@/services/tasks.service';

export function useRestoreMultipleTasksMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids) => {
      for (const id of ids) {
        await tasksService.updateTask(id, { status: 'pending' });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    }
  });
} 