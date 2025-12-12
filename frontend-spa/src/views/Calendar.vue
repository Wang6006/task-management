<template>
  <div class="calendar-container">
    <!-- Header -->
    <div class="calendar-header">
      <button @click="previousMonth" class="nav-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15,18 9,12 15,6"></polyline>
        </svg>
      </button>
      <h2 class="month-year">{{ currentMonthYear }}</h2>
      <button @click="nextMonth" class="nav-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9,18 15,12 9,6"></polyline>
        </svg>
      </button>
      <button @click="goToday" class="today-btn">Hôm nay</button>
    </div>
    <!-- Filters -->
    <div class="calendar-filters">
      <div class="filter-group">
        <label>Trạng thái:</label>
        <select v-model="statusFilter" class="filter-select">
          <option value="">Tất cả</option>
          <option value="pending">Đang thực hiện</option>
          <option value="in-progress">Đang tiến hành</option>
          <option value="completed">Hoàn thành</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Người thực hiện:</label>
        <select v-model="assigneeFilter" class="filter-select">
          <option value="">Tất cả</option>
          <option v-for="user in assignees" :key="user" :value="user">{{ user }}</option>
        </select>
      </div>
    </div>
    <!-- Days of week -->
    <div class="weekdays">
      <div v-for="day in weekdays" :key="day" class="weekday">
        {{ day }}
      </div>
    </div>
    <!-- Calendar grid -->
    <div class="calendar-grid">
      <div 
        v-for="date in calendarDates" 
        :key="date.key"
        :class="['calendar-date', {
          'other-month': !date.isCurrentMonth,
          'today': date.isToday,
          'selected': date.isSelected,
          'drag-over': dragOverDate === date.key
        }]"
        @click="openDayModal(date)"
        @dragover.prevent="onDragOver(date.key)"
        @dragleave="onDragLeave"
        @drop="onDrop(date.key)"
      >
        <span class="date-number">{{ date.day }}</span>
        <!-- Badge số lượng task -->
        <span v-if="date.tasks && date.tasks.length > 0" class="task-badge">{{ date.tasks.length }}</span>
        <!-- Task indicators -->
        <div v-if="date.tasks && date.tasks.length > 0" class="events">
          <div 
            v-for="task in date.tasks.slice(0, 3)" 
            :key="task.id"
            :class="['event-dot', `event-${task.status}`]"
            :title="task.title"
            draggable="true"
            @dragstart="onDragStart(task)"
          ></div>
          <span v-if="date.tasks.length > 3" class="more-events">+{{ date.tasks.length - 3 }}</span>
        </div>
      </div>
    </div>
    <!-- Modal xem/tạo/sửa task trong ngày -->
    <div v-if="showDayModal" class="modal-overlay" @click.self="closeDayModal">
      <div class="modal-content" @click.stop>
        <h3>Công việc ngày {{ formatSelectedDate }}</h3>
        <div v-if="selectedDateTasks.length > 0" class="date-events">
          <div v-for="task in selectedDateTasks" :key="task.id" class="event-item" @click="openTaskModal(task)">
            <div :class="['event-indicator', `event-${task.status}`]"></div>
            <div class="event-details">
              <span class="event-title">{{ task.title }}</span>
              <span class="event-time">Người thực hiện: {{ task.assigneeName || 'Chưa phân công' }}</span>
              <span class="event-time">Trạng thái: {{ getStatusText(task.status) }}</span>
            </div>
          </div>
        </div>
        <div v-else class="no-events">Không có công việc nào trong ngày này</div>
        <button class="btn btn-primary mt-2" @click="openTaskModal(null)"><i class="fas fa-plus"></i> Thêm công việc</button>
      </div>
    </div>
    <!-- Modal tạo/sửa task -->
    <div v-if="showTaskModal" class="modal-overlay" @click.self="closeTaskModal">
      <div class="modal-content" @click.stop>
        <h3>{{ editingTask ? 'Chỉnh sửa công việc' : 'Tạo công việc mới' }}</h3>
        <form @submit.prevent="saveTask">
          <div class="form-group">
            <label>Tiêu đề:</label>
            <input v-model="taskForm.title" type="text" required class="form-input">
          </div>
          <div class="form-group">
            <label>Mô tả:</label>
            <textarea v-model="taskForm.description" class="form-input" rows="3"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Trạng thái:</label>
              <select v-model="taskForm.status" class="form-input">
                <option value="pending">Đang thực hiện</option>
                <option value="in-progress">Đang tiến hành</option>
                <option value="completed">Hoàn thành</option>
              </select>
            </div>
            <div class="form-group">
              <label>Người thực hiện:</label>
              <input v-model="taskForm.assigneeName" type="text" class="form-input">
            </div>
          </div>
          <div class="form-group">
            <label>Hạn hoàn thành:</label>
            <input v-model="taskForm.dueDate" type="date" class="form-input" required>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeTaskModal">Hủy</button>
            <button type="submit" class="btn btn-primary">{{ editingTask ? 'Cập nhật' : 'Tạo' }}</button>
          </div>
        </form>
      </div>
    </div>
    <!-- Selected date info (ẩn khi có modal) -->
    <div v-if="selectedDate && !showDayModal && !showTaskModal" class="selected-date-info">
      <h3>{{ formatSelectedDate }}</h3>
      <div v-if="selectedDateTasks.length > 0" class="date-events">
        <div v-for="task in selectedDateTasks" :key="task.id" class="event-item">
          <div :class="['event-indicator', `event-${task.status}`]"></div>
          <div class="event-details">
            <span class="event-title">{{ task.title }}</span>
            <span class="event-time">Người thực hiện: {{ task.assigneeName || 'Chưa phân công' }}</span>
            <span class="event-time">Trạng thái: {{ getStatusText(task.status) }}</span>
          </div>
        </div>
      </div>
      <div v-else class="no-events">Không có công việc nào trong ngày này</div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useTasksQuery } from '@/composables/useTasksQuery';
import { useCreateTaskMutation } from '@/composables/useCreateTaskMutation';
import { useUpdateTaskMutation } from '@/composables/useUpdateTaskMutation';

export default {
  name: 'CalendarPage',
  setup() {
    const currentDate = ref(new Date());
    const selectedDate = ref(null);
    const showDayModal = ref(false);
    const showTaskModal = ref(false);
    const editingTask = ref(null);
    const taskForm = ref({
      title: '',
      description: '',
      status: 'pending',
      dueDate: '',
      assigneeName: '',
    });
    const statusFilter = ref('');
    const assigneeFilter = ref('');
    const dragTask = ref(null);
    const dragOverDate = ref(null);
    // TanStack Query
    const { data: tasksData, isLoading, refetch } = useTasksQuery(ref(1), ref(1000));
    const createTaskMutation = useCreateTaskMutation();
    const updateTaskMutation = useUpdateTaskMutation();

    const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    const tasks = computed(() => (tasksData.value?.tasks || []).map(task => ({
      ...task,
      assigneeName: task.assignee_name || task.assigneeName || '',
      status: mapStatus(task.TASK_Status, task.status_name, task.status),
      dueDate: task.due_date || task.dueDate,
    })));

    const currentMonthYear = computed(() => {
      const months = [
        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
      ];
      return `${months[currentDate.value.getMonth()]} ${currentDate.value.getFullYear()}`;
    });

    const filteredTasks = computed(() => {
      let filtered = tasks.value;
      if (statusFilter.value) {
        filtered = filtered.filter(task => task.status === statusFilter.value);
      }
      if (assigneeFilter.value) {
        filtered = filtered.filter(task => task.assigneeName === assigneeFilter.value);
      }
      return filtered;
    });

    const tasksByDate = computed(() => {
      const map = {};
      for (const task of filteredTasks.value) {
        const date = formatDate(task.dueDate);
        if (!map[date]) map[date] = [];
        map[date].push(task);
      }
      return map;
    });

    const assignees = computed(() => {
      const names = new Set();
      for (const task of tasks.value) {
        if (task.assigneeName) names.add(task.assigneeName);
      }
      return Array.from(names);
    });

    const calendarDates = computed(() => {
      const year = currentDate.value.getFullYear();
      const month = currentDate.value.getMonth();
      const firstDay = new Date(year, month, 1);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());
      const dates = [];
      const today = new Date();
      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateString = formatDate(date);
        const dayTasks = tasksByDate.value[dateString] || [];
        dates.push({
          key: dateString,
          day: date.getDate(),
          date: date,
          isCurrentMonth: date.getMonth() === month,
          isToday: isSameDate(date, today),
          isSelected: selectedDate.value && isSameDate(date, selectedDate.value),
          tasks: dayTasks
        });
      }
      return dates;
    });

    const formatSelectedDate = computed(() => {
      if (!selectedDate.value) return '';
      return selectedDate.value.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    });

    const selectedDateTasks = computed(() => {
      if (!selectedDate.value) return [];
      const dateString = formatDate(selectedDate.value);
      return tasksByDate.value[dateString] || [];
    });

    function previousMonth() {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
    }
    function nextMonth() {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
    }
    function goToday() {
      currentDate.value = new Date();
    }
    function openDayModal(dateObj) {
      selectedDate.value = new Date(dateObj.date);
      showDayModal.value = true;
    }
    function closeDayModal() {
      showDayModal.value = false;
    }
    function openTaskModal(task) {
      if (task) {
        editingTask.value = task;
        taskForm.value = {
          title: task.title,
          description: task.description,
          status: task.status,
          dueDate: formatDate(task.dueDate),
          assigneeName: task.assigneeName || '',
        };
      } else {
        editingTask.value = null;
        taskForm.value = {
          title: '',
          description: '',
          status: 'pending',
          dueDate: formatDate(selectedDate.value),
          assigneeName: '',
        };
      }
      showTaskModal.value = true;
    }
    function closeTaskModal() {
      showTaskModal.value = false;
      editingTask.value = null;
    }
    function saveTask() {
      const payload = {
        title: taskForm.value.title,
        description: taskForm.value.description,
        dueDate: taskForm.value.dueDate,
        status: taskForm.value.status,
        // TODO: map assigneeName to assignedTo if backend cần userId
      };
      if (editingTask.value) {
        updateTaskMutation.mutate({ id: editingTask.value.id, payload }, {
          onSuccess: () => {
            showTaskModal.value = false;
            showDayModal.value = false;
            refetch();
          }
        });
      } else {
        createTaskMutation.mutate(payload, {
          onSuccess: () => {
            showTaskModal.value = false;
            showDayModal.value = false;
            refetch();
          }
        });
      }
    }
    function formatDate(date) {
      if (!date) return '';
      if (typeof date === 'string') return date.split('T')[0];
      return date.toISOString().split('T')[0];
    }
    function isSameDate(date1, date2) {
      return date1.getDate() === date2.getDate() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getFullYear() === date2.getFullYear();
    }
    function getStatusText(status) {
      const statusMap = {
        pending: 'Đang thực hiện',
        'in-progress': 'Đang tiến hành',
        completed: 'Hoàn thành',
      };
      return statusMap[status] || status;
    }
    function mapStatus(TASK_Status, status_name, status) {
      if (typeof TASK_Status === 'number') {
        if (TASK_Status === 1) return 'pending';
        if (TASK_Status === 2) return 'in-progress';
        if (TASK_Status === 3) return 'completed';
      }
      if (typeof status_name === 'string') {
        if (status_name.toLowerCase().includes('pending')) return 'pending';
        if (status_name.toLowerCase().includes('progress')) return 'in-progress';
        if (status_name.toLowerCase().includes('completed')) return 'completed';
      }
      if (typeof status === 'string') return status;
      return 'pending';
    }
    function onDragStart(task) {
      dragTask.value = task;
    }
    function onDragOver(dateKey) {
      dragOverDate.value = dateKey;
    }
    function onDragLeave() {
      dragOverDate.value = null;
    }
    function onDrop(dateKey) {
      if (!dragTask.value) return;
      const newDueDate = dateKey;
      updateTaskMutation.mutate({ id: dragTask.value.id, payload: { dueDate: newDueDate } }, {
        onSuccess: () => {
          refetch();
          dragTask.value = null;
          dragOverDate.value = null;
        }
      });
    }
    return {
      currentDate,
      selectedDate,
      weekdays,
      showDayModal,
      showTaskModal,
      editingTask,
      taskForm,
      statusFilter,
      assigneeFilter,
      dragTask,
      dragOverDate,
      currentMonthYear,
      filteredTasks,
      tasksByDate,
      assignees,
      calendarDates,
      formatSelectedDate,
      selectedDateTasks,
      previousMonth,
      nextMonth,
      goToday,
      openDayModal,
      closeDayModal,
      openTaskModal,
      closeTaskModal,
      saveTask,
      formatDate,
      isSameDate,
      getStatusText,
      mapStatus,
      onDragStart,
      onDragOver,
      onDragLeave,
      onDrop,
      isLoading
    };
  }
};
</script>

<style scoped>
.calendar-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  padding: 8px;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.today-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
  font-weight: 600;
}

.today-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.month-year {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.calendar-filters {
  display: flex;
  justify-content: space-around;
  padding: 16px 24px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-size: 0.9rem;
  color: #495057;
  font-weight: 500;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  background-color: white;
  font-size: 0.9rem;
  color: #495057;
  cursor: pointer;
  transition: border-color 0.2s;
}

.filter-select:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  outline: none;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.weekday {
  padding: 12px;
  text-align: center;
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: white;
}

.calendar-date {
  min-height: 80px;
  padding: 8px;
  border: 1px solid #e9ecef;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
  display: flex;
  flex-direction: column;
}

.calendar-date:hover {
  background: #f8f9fa;
}

.calendar-date.other-month {
  color: #adb5bd;
  background: #f8f9fa;
}

.calendar-date.today {
  background: #e3f2fd;
  font-weight: bold;
}

.calendar-date.today .date-number {
  color: #1976d2;
}

.calendar-date.selected {
  background: #667eea;
  color: white;
}

.calendar-date.drag-over {
  outline: 2px dashed #4f8cff;
  background: #e3f2fd;
}
.event-dot[draggable="true"] {
  cursor: grab;
}
.event-dot[draggable="true"]:active {
  cursor: grabbing;
}

.date-number {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 4px;
}

.task-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: #4CAF50;
  color: white;
  border-radius: 10px;
  padding: 4px 8px;
  font-size: 0.7rem;
  font-weight: bold;
  z-index: 1;
}

.events {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  margin-top: auto;
}

.event-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin: 1px;
}

.event-meeting {
  background: #4CAF50;
}

.event-deadline {
  background: #F44336;
}

.event-personal {
  background: #FF9800;
}

.event-work {
  background: #2196F3;
}

.more-events {
  font-size: 0.7rem;
  color: #666;
  margin-left: 4px;
}

.selected-date-info {
  padding: 24px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

.selected-date-info h3 {
  margin: 0 0 16px 0;
  color: #495057;
  font-size: 1.2rem;
}

.date-events {
  space-y: 8px;
}

.event-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.event-item:hover {
  background: #f8f9fa;
}

.event-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 12px;
  flex-shrink: 0;
}

.event-details {
  display: flex;
  flex-direction: column;
}

.event-title {
  font-weight: 500;
  color: #495057;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px; /* Adjust as needed */
}

.event-time {
  font-size: 0.9rem;
  color: #6c757d;
}

.no-events {
  color: #6c757d;
  font-style: italic;
  text-align: center;
  padding: 20px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-content h3 {
  padding: 20px 24px;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
}

.modal-content form {
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.modal-content .form-group {
  margin-bottom: 16px;
}

.modal-content .form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #495057;
  font-weight: 500;
}

.modal-content .form-input,
.modal-content .form-select {
  padding: 12px 16px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 1rem;
  color: #495057;
  transition: border-color 0.2s;
}

.modal-content .form-input:focus,
.modal-content .form-select:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  outline: none;
}

.modal-content .form-textarea {
  padding: 12px 16px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 1rem;
  color: #495057;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.2s;
}

.modal-content .form-textarea:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  outline: none;
}

.modal-content .form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.modal-content .form-group:last-child {
  margin-bottom: 0;
}

.modal-content .modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px 24px;
  border-top: 1px solid #e9ecef;
}

.modal-content .btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
}

.modal-content .btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.modal-content .btn-primary:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
}

.modal-content .btn-secondary {
  background: #e9ecef;
  color: #495057;
  border: 1px solid #ced4da;
}

.modal-content .btn-secondary:hover {
  background: #dee2e6;
}

@media (max-width: 768px) {
  .calendar-container {
    margin: 0;
    border-radius: 0;
  }
  
  .calendar-date {
    min-height: 60px;
    font-size: 0.9rem;
  }
  
  .month-year {
    font-size: 1.2rem;
  }
  
  .selected-date-info {
    padding: 16px;
  }

  .modal-content {
    width: 95%;
    max-width: 90%;
  }

  .modal-content .form-row {
    flex-direction: column;
    gap: 0;
  }

  .modal-content .form-group {
    margin-bottom: 12px;
  }

  .modal-content .modal-actions {
    flex-direction: column;
    gap: 10px;
  }
}
</style>