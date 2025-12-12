<script setup>
import { ref, onMounted } from 'vue';
import { Form as VeeForm, Field as VeeField, ErrorMessage } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import usersService from '@/services/users.service';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const props = defineProps({
  task: { type: Object, required: true },
  loading: { type: Boolean, default: false }
});

const $emit = defineEmits(['submit:task', 'delete:task']);

const users = ref([]);
const loadingUsers = ref(false);
const attachedFile = ref(null);

const validationSchema = toTypedSchema(
  z.object({
    title: z.string()
      .min(3, { message: 'Tiêu đề phải ít nhất 3 ký tự.' })
      .max(100, { message: 'Tiêu đề có nhiều nhất 100 ký tự.' }),
    description: z.string()
      .max(500, { message: 'Mô tả tối đa 500 ký tự.' }).optional(),
    dueDate: z.string().min(1, { message: 'Vui lòng chọn ngày hoàn thành.' }),
    assignedTo: z.string().optional(),
    file: z.any().optional()
  })
);

async function loadUsers() {
  loadingUsers.value = true;
  try {
    users.value = await usersService.fetchUsers();
  } catch {
    users.value = [];
  } finally {
    loadingUsers.value = false;
  }
}

function submitTask(values) {
  // Đính kèm file vào dữ liệu gửi đi
  values.file = attachedFile.value;
  $emit('submit:task', values);
}

function deleteTask() {
  $emit('delete:task', props.task.id);
}

function handleFileChange(e) {
  attachedFile.value = e.target.files[0] || null;
}

onMounted(loadUsers);
</script>

<template>
  <div class="task-form-card">
    <LoadingSpinner v-if="loadingUsers" message="Đang tải danh sách users..." />
    <VeeForm
      v-else
      :initial-values="task"
      :validation-schema="validationSchema"
      @submit="submitTask"
      class="task-form"
    >
      <div class="form-group">
        <label for="title" class="form-label">Tiêu đề</label>
        <VeeField
          name="title"
          type="text"
          class="form-input"
          :disabled="loading"
          id="title"
          placeholder="Nhập tiêu đề công việc"
        />
        <ErrorMessage name="title" class="error-feedback" />
      </div>

      <div class="form-group">
        <label for="description" class="form-label">Mô tả</label>
        <VeeField
          name="description"
          as="textarea"
          class="form-textarea"
          rows="3"
          :disabled="loading"
          id="description"
          placeholder="Nhập mô tả công việc"
        />
        <ErrorMessage name="description" class="error-feedback" />
      </div>

      <div class="form-group">
        <label for="dueDate" class="form-label">Ngày hoàn thành</label>
        <VeeField
          name="dueDate"
          type="date"
          class="form-input"
          :disabled="loading"
          id="dueDate"
        />
        <ErrorMessage name="dueDate" class="error-feedback" />
      </div>

      <div
        v-if="users.length > 0"
        class="form-group"
      >
        <label for="assignedTo" class="form-label">Phân công cho</label>
        <VeeField
          name="assignedTo"
          as="select"
          class="form-select"
          :disabled="loading"
          id="assignedTo"
        >
          <option value="">Chọn người thực hiện</option>
          <option v-for="user in users" :key="user.userId" :value="user.userId + ''">
            {{ user.username }}
          </option>
        </VeeField>
        <ErrorMessage name="assignedTo" class="error-feedback" />
      </div>

      <div class="form-group">
        <label for="file" class="form-label">Đính kèm tài liệu</label>
        <input
          type="file"
          id="file"
          class="form-input"
          @change="handleFileChange"
          :disabled="loading"
        />
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <i v-else class="fas fa-save"></i>
          {{ loading ? 'Đang lưu...' : 'Lưu' }}
        </button>
        <button
          v-if="task.id"
          type="button"
          class="btn-danger"
          :disabled="loading"
          @click="deleteTask"
        >
          <i class="fas fa-trash"></i> Xóa
        </button>
      </div>
    </VeeForm>
  </div>
</template>

<style scoped>
.task-form-card {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: 0;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333333;
}
.task-form {
  width: 100%;
}
.form-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
}
.form-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 1.08rem;
  color: #347ae2;
}
.form-input,
.form-textarea,
.form-select {
  padding: 0.6rem 1rem;
  font-size: 1rem;
  border: 2px solid #eaf2fb;
  border-radius: 8px;
  background-color: #f7fbff;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  font-family: inherit;
  color: #347ae2;
  outline-offset: 2px;
}
.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  border-color: #347ae2;
  box-shadow: 0 0 8px #347ae220;
  background-color: #fff;
  outline: none;
}
.form-textarea {
  resize: vertical;
  min-height: 80px;
}
.error-feedback {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 0.3rem;
  font-weight: 600;
}
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-start;
  margin-top: 2rem;
}
.btn-primary,
.btn-danger {
  cursor: pointer;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  padding: 0.6rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  font-family: inherit;
}
.btn-primary {
  background-color: #347ae2;
  color: white;
}
.btn-primary:hover:not(:disabled) {
  background-color: #2563c3;
  box-shadow: 0 4px 12px #347ae220;
}
.btn-primary:disabled {
  background-color: #a0c4f7;
  cursor: not-allowed;
}
.btn-danger {
  background-color: #e74c3c;
  color: white;
}
.btn-danger:hover:not(:disabled) {
  background-color: #c0392b;
  box-shadow: 0 4px 12px rgba(192, 57, 43, 0.12);
}
.btn-danger:disabled {
  background-color: #f5a6a3;
  cursor: not-allowed;
}
.spinner {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #fff;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
