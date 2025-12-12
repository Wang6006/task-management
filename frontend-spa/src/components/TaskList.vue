<script setup>
defineProps({
  tasks: { type: Array, default: () => [] },
  selectedIndex: { type: Number, default: -1 },
});
const $emit = defineEmits(['update:selectedIndex']);


function progress(task) {
  // Nếu task có trường progress thì dùng, không thì mặc định 0
  return typeof task.progress === 'number' ? task.progress : 0;
}

function avatars(task) {
  // Nếu task có trường assignedUser và có avatar thì trả về mảng 1 phần tử, không thì trả về mảng rỗng
  if (task.assignedUser && task.assignedUser.avatar) {
    return [task.assignedUser.avatar];
  }
  // Nếu có nhiều người, bạn có thể trả về mảng nhiều avatar ở đây
  return [];
}
</script>

<template>
  <div class="task-list">
    <div v-for="(task, index) in tasks" :key="task.id" class="task-card card mb-3"
      :class="{ active: index === selectedIndex }" @click="$emit('update:selectedIndex', index)">
      <div class="card-body d-flex align-items-center">
        <div class="task-info flex-grow-1">
          <h6 class="mb-1">{{ task.title }}</h6>
          <small class="text-muted">{{ task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '' }}</small>
          <div class="progress mt-2" style="height: 6px;">
            <div class="progress-bar" role="progressbar" :style="{ width: progress(task) + '%' }"
              :aria-valuenow="progress(task)" aria-valuemin="0" aria-valuemax="100"></div>
          </div>
        </div>
        <div class="avatars d-flex ms-3">
          <img v-for="(avatar, idx) in avatars(task)" :key="idx" :src="avatar" alt="avatar" class="rounded-circle"
            width="30" height="30" :style="{ marginLeft: idx === 0 ? '0' : '-10px' }" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.task-list {
  max-width: 350px;
}

.task-card {
  cursor: pointer;
  transition: box-shadow 0.2s ease;
}

.task-card.active {
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.5);
}

.progress-bar {
  background-color: #3b82f6;
}

.avatars img {
  border: 2px solid white;
}
</style>
