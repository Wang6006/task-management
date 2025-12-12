import { useMutation, useQueryClient } from '@tanstack/vue-query';
import tasksService from '@/services/tasks.service';

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => tasksService.updateTask(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    }
  });
} 