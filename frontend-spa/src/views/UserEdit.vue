<script setup>
import { ref, onMounted } from 'vue';
import usersService from '@/services/users.service';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const userId = route.params.id;
const form = ref({
  username: '',
  email: '',
  role: 'user',
});
const loading = ref(false);
const error = ref('');
const success = ref('');

onMounted(async () => {
  loading.value = true;
  error.value = '';
  try {
    const user = await usersService.fetchUser(userId);
    form.value.username = user.username;
    form.value.email = user.email;
    form.value.role = user.role || 'user';
  } catch {
    error.value = 'Không tìm thấy người dùng!';
  } finally {
    loading.value = false;
  }
});

async function submit() {
  error.value = '';
  success.value = '';
  if (!form.value.email) {
    error.value = 'Vui lòng nhập email.';
    return;
  }
  loading.value = true;
  try {
    await usersService.updateUser(userId, {
      username: form.value.username,
      email: form.value.email,
      role: form.value.role,
    });
    success.value = 'Cập nhật người dùng thành công!';
    setTimeout(() => router.push({ name: 'taskboard' }), 1000);
  } catch (e) {
    error.value = e.message || 'Cập nhật thất bại!';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="user-edit-form">
    <h2 class="mb-4">Chỉnh sửa người dùng</h2>
    <form @submit.prevent="submit" class="form" v-if="!loading">
      <div class="mb-3">
        <label class="form-label">Tên đăng nhập</label>
        <input v-model="form.username" class="form-control" />
      </div>
      <div class="mb-3">
        <label class="form-label">Email</label>
        <input v-model="form.email" class="form-control" type="email" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Vai trò</label>
        <select v-model="form.role" class="form-select">
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
        </select>
      </div>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div v-if="success" class="alert alert-success">{{ success }}</div>
      <button class="btn btn-primary" :disabled="loading">{{ loading ? 'Đang lưu...' : 'Lưu thay đổi' }}</button>
    </form>
    <div v-else class="text-center py-5">Đang tải dữ liệu người dùng...</div>
  </div>
</template>

<style scoped>
.user-edit-form {
  max-width: 420px;
  margin: 48px auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px #0002;
  padding: 40px 32px 32px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.user-edit-form h2 {
  color: var(--blue-pastel, #2563eb);
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 24px;
}
.form {
  width: 100%;
}
.form-label {
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}
.form-control, .form-select {
  border-radius: 8px;
  border: 1px solid #e3f0ff;
  padding: 10px 14px;
  font-size: 1rem;
  margin-bottom: 8px;
  transition: border-color 0.2s;
}
.form-control:focus, .form-select:focus {
  border-color: #2563eb;
  outline: none;
}
.btn-primary {
  background: #2563eb;
  color: #fff;
  font-weight: 600;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 1rem;
  margin-top: 8px;
  box-shadow: 0 2px 8px #3b82f610;
  transition: background 0.2s;
}
.btn-primary:hover {
  background: #1d4ed8;
}
.alert {
  width: 100%;
  border-radius: 8px;
  margin-bottom: 10px;
  font-size: 0.98rem;
  padding: 10px 14px;
}
.alert-danger {
  background: #fff2f0;
  color: #dc3545;
  border: 1px solid #f5c6cb;
}
.alert-success {
  background: #f6ffed;
  color: #28a745;
  border: 1px solid #c3e6cb;
}
@media (max-width: 600px) {
  .user-edit-form {
    padding: 18px 4px;
  }
  .form {
    padding: 0;
  }
}
</style> 