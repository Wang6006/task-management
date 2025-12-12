<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import TaskForm from '@/components/TaskForm.vue';
import AlertMessage from '@/components/AlertMessage.vue';
import { useCreateTaskMutation } from '@/composables/useCreateTaskMutation';

const router = useRouter();
const message = ref('');
const messageType = ref('info');

// Empty task object for adding new task
const newTask = {
  title: '',
  description: '',
  status: 'pending',
  dueDate: '',
  assignedTo: ''
};

const createTaskMutation = useCreateTaskMutation();

function onCreateTask(taskData) {
  createTaskMutation.mutate(taskData, {
    onSuccess: () => {
      message.value = 'Task được tạo thành công.';
      messageType.value = 'success';
      setTimeout(() => {
        router.push({ name: 'taskboard' });
      }, 1500);
    },
    onError: () => {
      message.value = 'Có lỗi xảy ra khi tạo task.';
      messageType.value = 'error';
    }
  });
}

function closeMessage() {
  message.value = '';
}
</script>

<template>
  <div class="add-task-page">
    <h2 class="add-task-title">
      <i class="fas fa-plus"></i>
      Thêm Task Mới
    </h2>
    <AlertMessage 
      v-if="message" 
      :message="message" 
      :type="messageType"
      @close="closeMessage"
      class="add-task-alert"
    />
    <div class="add-task-form-wrapper">
      <TaskForm
        :task="newTask"
        :loading="createTaskMutation.isLoading"
        @submit:task="onCreateTask"
      />
    </div>
  </div>
</template>

<style scoped>
.add-task-page {
  width: 100%;
  min-height: 100vh;
  background: #f5f8fc;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 0 32px 0;
}
.add-task-title {
  color: #347ae2;
  font-size: 2.1rem;
  font-weight: 700;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.add-task-alert {
  width: 100%;
  max-width: 600px;
  margin-bottom: 24px;
}
.add-task-form-wrapper {
  width: 100%;
  max-width: 520px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 16px #347ae220;
  padding: 32px 28px 28px 28px;
}
</style>