import { useQuery } from '@tanstack/vue-query';
import usersService from '@/services/users.service';

function getVal(v, fallback) {
  if (v && typeof v === 'object' && 'value' in v) return v.value;
  if (v !== undefined) return v;
  return fallback;
}

export function useUsersQuery(page, pageSize, searchText) {
  return useQuery(
    ['users', getVal(page, 1), getVal(pageSize, 1000), getVal(searchText, '')],
    () => usersService.fetchUsers(getVal(page, 1), getVal(pageSize, 1000), getVal(searchText, ''))
  );
} 