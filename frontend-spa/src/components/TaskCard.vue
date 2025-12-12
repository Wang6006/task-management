<script setup>
defineProps({
  task: {
    type: Object,
    required: true,
    validator: task => {
      return ['title', 'description', 'status', 'dueDate'].every(prop => prop in task)
    }
  }
});

defineEmits(['edit', 'delete']);

function formatDate(dateString) {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}
</script>

<template>
  <div class="task-card-modern" :class="task.status">
    <div class="task-card-header">
      <h3 class="task-title">{{ task.title }}</h3>
      <div class="task-actions">
        <button @click="$emit('edit', task)" class="action-btn edit-btn">
          <i class="fas fa-pen"></i>
        </button>
        <button @click="$emit('delete', task.id)" class="action-btn delete-btn">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
    <p class="task-description">{{ task.description }}</p>
    <div class="task-footer">
      <span class="task-due-date">
        <i class="far fa-calendar-alt me-1"></i>
        {{ formatDate(task.dueDate) }}
      </span>
      <span class="task-priority">{{ task.priority }}</span>
    </div>
  </div>
</template>

<style scoped>
.task-card-modern {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 22px 24px 18px 24px;
  margin-bottom: 18px;
  transition: box-shadow 0.2s, transform 0.2s;
  border-left: 5px solid #e3f0ff;
  min-width: 260px;
}
.task-card-modern:hover {
  box-shadow: 0 8px 32px #3b82f620;
  transform: translateY(-2px) scale(1.01);
}
.task-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.task-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--blue-pastel);
}
.task-actions {
  display: flex;
  gap: 8px;
}
.action-btn {
  background: #e3f0ff;
  border: none;
  color: var(--blue-pastel);
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.action-btn:hover {
  background: var(--blue-pastel);
  color: #fff;
}
.edit-btn {
  color: var(--blue-pastel);
  background: #e3f0ff;
}
.delete-btn {
  color: #ff4d4f;
  background: #fff0f0;
}
.delete-btn:hover {
  background: #ff4d4f;
  color: #fff;
}
.task-description {
  margin: 8px 0 0 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
}
.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 14px;
  font-size: 13px;
}
.task-due-date {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #8c8c8c;
}
.task-priority {
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  background: #e3f0ff;
  color: var(--blue-pastel);
}
/* Status indicators */
.task-card-modern.pending {
  border-left-color: #faad14;
}
.task-card-modern.in-progress {
  border-left-color: #1890ff;
}
.task-card-modern.completed {
  border-left-color: #52c41a;
}
.task-card-modern.pending .task-priority {
  background: #fff7e6;
  color: #d48806;
}
.task-card-modern.in-progress .task-priority {
  background: #e6f7ff;
  color: #096dd9;
}
.task-card-modern.completed .task-priority {
  background: #f6ffed;
  color: #389e0d;
}
</style>
