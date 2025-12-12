<script setup>
import { ref, computed, watch } from 'vue';
import { useUsersQuery } from '@/composables/useUsersQuery';
import { useRouter } from 'vue-router';
import MainPagination from '@/components/MainPagination.vue';

const router = useRouter();
const searchText = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);

const { data: usersData, isLoading, error, refetch } = useUsersQuery(currentPage, itemsPerPage, searchText);
const users = computed(() => usersData.value?.users || []);
const totalPages = computed(() => usersData.value?.pagination?.totalPages || 1);

function goToAddUser() {
  router.push({ name: 'user.add' });
}
function goToEditUser(userId) {
  router.push({ name: 'user.edit', params: { id: userId } });
}
function changePage(page) {
  currentPage.value = page;
}

function onRefresh() {
  searchText.value = '';
  currentPage.value = 1;
  refetch();
}

watch([currentPage, itemsPerPage, searchText], () => refetch(), { immediate: true });
</script>

<template>
  <div class="user-management-layout">
    <div class="user-header">
      <h2 class="user-title">
        <i class="fas fa-users me-2"></i> Quản lý người dùng
      </h2>
      <button class="btn btn-primary" @click="goToAddUser">
        <i class="fas fa-plus"></i> Thêm người dùng
      </button>
    </div>
    <div class="user-search-bar">
      <input v-model="searchText" class="form-control" placeholder="Tìm kiếm theo tên, email, vai trò..." />
      <button class="btn btn-outline-primary ms-2" @click="onRefresh">
        <i class="fas fa-sync-alt"></i> Làm mới
      </button>
    </div>
    <div v-if="isLoading" class="text-center py-5">Đang tải danh sách người dùng...</div>
    <div v-else-if="error" class="text-center py-5 text-danger">Lỗi tải dữ liệu người dùng!</div>
    <div v-else>
      <table class="table table-hover user-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Tên đăng nhập</th>
            <th>Email</th>
            <th>Vai trò</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, idx) in users" :key="user.userId">
            <td>{{ (currentPage - 1) * itemsPerPage + idx + 1 }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>
              <button class="btn btn-sm btn-outline-primary me-2" @click="goToEditUser(user.userId)">
                <i class="fas fa-edit"></i> Sửa
              </button>
              <!-- <button class="btn btn-sm btn-outline-danger"><i class="fas fa-trash"></i> Xóa</button> -->
            </td>
          </tr>
        </tbody>
      </table>
      <MainPagination :total-pages="totalPages" :current-page="currentPage" @update:current-page="changePage" />
    </div>
  </div>
</template>

<style scoped>
.user-management-layout {
  max-width: 900px;
  margin: 40px auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 16px #0001;
  padding: 32px 32px 24px 32px;
}

.user-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.user-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--blue-pastel, #2563eb);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
}

.user-search-bar .form-control {
  flex: 1;
  min-width: 200px;
}

.user-table {
  margin-bottom: 0;
  background: #f9fafb;
  border-radius: 8px;
  overflow: hidden;
}

.user-table th,
.user-table td {
  vertical-align: middle;
  text-align: left;
}

.user-table th {
  background: #f1f5f9;
  font-weight: 600;
}

.user-table tr {
  transition: background 0.2s;
}

.user-table tr:hover {
  background: #e0e7ef;
}

.btn-primary {
  background: #2563eb;
  border: none;
  color: #fff;
  font-weight: 600;
  border-radius: 8px;
  padding: 8px 18px;
  box-shadow: 0 2px 8px #3b82f610;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-outline-primary {
  border: 1px solid #2563eb;
  color: #2563eb;
  background: #fff;
  border-radius: 8px;
  font-weight: 600;
  transition: background 0.2s, color 0.2s;
}

.btn-outline-primary:hover {
  background: #2563eb;
  color: #fff;
}

.btn-outline-secondary {
  border: 1px solid #cbd5e1;
  color: #64748b;
  background: #fff;
  border-radius: 8px;
  font-weight: 600;
  transition: background 0.2s, color 0.2s;
}

.btn-outline-secondary:hover {
  background: #e0e7ef;
  color: #2563eb;
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

@media (max-width: 700px) {
  .user-management-layout {
    padding: 16px 4px;
  }

  .user-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .user-title {
    font-size: 1.1rem;
  }
}
</style>
