<script setup>
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import TaskForm from '@/components/TaskForm.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import AlertMessage from '@/components/AlertMessage.vue';
import { useTaskQuery } from '@/composables/useTaskQuery';
import { useUpdateTaskMutation } from '@/composables/useUpdateTaskMutation';
import { useDeleteTaskMutation } from '@/composables/useDeleteTaskMutation';

// Nhận props từ router
const props = defineProps({
  taskId: { type: String, required: true },
});

const router = useRouter();
const route = useRoute();

// Trạng thái thông báo
const message = ref('');
const messageType = ref('info');

// Lấy dữ liệu task từ API
const { data: task, isLoading, isError } = useTaskQuery(props.taskId);

// Khởi tạo mutation update & delete
const updateTaskMutation = useUpdateTaskMutation();
const deleteTaskMutation = useDeleteTaskMutation();

// Hàm cập nhật task
function onUpdateTask(taskData) {
  updateTaskMutation.mutate(
    { id: task.value.id, payload: taskData },
    {
      onSuccess: () => {
        message.value = '✅ Task được cập nhật thành công.';
        messageType.value = 'success';
      },
      onError: () => {
        message.value = '❌ Có lỗi xảy ra khi cập nhật task.';
        messageType.value = 'error';
      },
    }
  );
}

// Hàm xóa task
function onDeleteTask(id) {
  if (confirm('Bạn chắc chắn muốn xóa Task này?')) {
    deleteTaskMutation.mutate(id, {
      onSuccess: () => {
        router.push({ name: 'taskboard' });
      },
      onError: () => {
        message.value = '❌ Có lỗi xảy ra khi xóa task.';
        messageType.value = 'error';
      },
    });
  }
}

// Đóng thông báo
function closeMessage() {
  message.value = '';
}

// Nếu không tìm thấy task → chuyển sang trang notfound
watch(isError, (val) => {
  if (val) {
    router.push({
      name: 'notfound',
      params: { pathMatch: route.path.split('/').slice(1) },
      query: route.query,
      hash: route.hash,
    });
  }
});
</script>

<template>
  <div class="page">
    <h4>
      <i class="fas fa-edit"></i>
      Chỉnh sửa Task
    </h4>

    <!-- Thông báo -->
    <AlertMessage
      v-if="message"
      :message="message"
      :type="messageType"
      @close="closeMessage"
    />

    <!-- Đang tải -->
    <LoadingSpinner v-if="isLoading" message="Đang tải task..." />

    <!-- Form chỉnh sửa -->
    <TaskForm
      v-else-if="task"
      :task="task"
      :loading="updateTaskMutation.isLoading || deleteTaskMutation.isLoading"
      @submit:task="onUpdateTask"
      @delete:task="onDeleteTask"
    />
  </div>
</template>

<style scoped>
.page {
  max-width: 800px;
  margin: 0 auto;
}
</style>
