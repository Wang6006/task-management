import { useQuery } from '@tanstack/vue-query';
import tasksService from '@/services/tasks.service';

export function useTasksQuery(page, limit) {
  return useQuery([
    'tasks',
    page,
    limit
  ], () => tasksService.fetchTasks(page.value, limit.value), {
    keepPreviousData: true,
  });
} 