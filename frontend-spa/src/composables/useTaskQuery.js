import { useQuery } from '@tanstack/vue-query';
import tasksService from '@/services/tasks.service';

export function useTaskQuery(taskId) {
  return useQuery([
    'task',
    taskId
  ], () => tasksService.fetchTask(taskId.value || taskId));
} 