import { useMutation, useQueryClient } from '@tanstack/vue-query';
import tasksService from '@/services/tasks.service';

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => tasksService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    }
  });
} 