import { useMutation, useQueryClient } from '@tanstack/vue-query';
import tasksService from '@/services/tasks.service';

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => tasksService.createTask(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    }
  });
} 