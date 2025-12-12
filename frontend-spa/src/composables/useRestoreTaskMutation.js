import { useMutation, useQueryClient } from '@tanstack/vue-query';
import tasksService from '@/services/tasks.service';

export function useRestoreTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => tasksService.updateTask(id, { status: 'pending' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    }
  });
} 