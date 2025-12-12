import { useMutation, useQueryClient } from '@tanstack/vue-query';
import tasksService from '@/services/tasks.service';

export function useDeleteAllTasksMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => tasksService.deleteAllTasks(),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    }
  });
} 