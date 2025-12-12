<template>
  <div class="schedule-page">
    <h1>Lịch trình (Admin)</h1>

    <!-- Dashboard Statistics -->
    <div class="dashboard-stats">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-tasks"></i>
        </div>
        <div class="stat-content">
          <h3>{{ totalTasks }}</h3>
          <p>Tổng Tasks</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon completed">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ completedTasks }}</h3>
          <p>Hoàn thành</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon pending">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <h3>{{ pendingTasks }}</h3>
          <p>Đang thực hiện</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon overdue">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ overdueTasks }}</h3>
          <p>Quá hạn</p>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <div class="chart-container">
        <h3>Phân bố trạng thái Tasks</h3>
        <div class="chart-wrapper">
          <canvas ref="statusChart"></canvas>
        </div>
      </div>
      <div class="chart-container">
        <h3>Tiến độ theo thời gian</h3>
        <div class="chart-wrapper">
          <canvas ref="progressChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Filters and Actions -->
    <div class="schedule-filters">
      <div class="filter-group">
        <label>Lọc theo trạng thái:</label>
        <select v-model="statusFilter" class="filter-select">
          <option value="">Tất cả</option>
          <option v-for="status in statusOptions" :key="status" :value="status">
            {{ getStatusText(status) }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label>Lọc theo độ ưu tiên:</label>
        <select v-model="priorityFilter" class="filter-select">
          <option value="">Tất cả</option>
          <option value="high">Cao</option>
          <option value="medium">Trung bình</option>
          <option value="low">Thấp</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Sắp xếp theo:</label>
        <select v-model="sortBy" class="filter-select">
          <option value="">Mặc định (Mới nhất)</option>
          <option value="title">Tên</option>
          <option value="dueDate">Hạn</option>
          <option value="priority">Độ ưu tiên</option>
          <option value="status">Trạng thái</option>
        </select>
      </div>
    </div>

    <div class="schedule-actions">
      <input
        v-model="searchText"
        placeholder="Tìm kiếm task theo tên, mô tả, người thực hiện..."
        class="search-input"
      />
      <button class="btn btn-primary" @click="openCreateModal">
        <i class="fas fa-plus"></i> Tạo Task
      </button>
      <button class="btn btn-outline-primary" @click="refreshTasks">
        <i class="fas fa-sync-alt"></i> Làm mới
      </button>
      <button class="btn btn-success" @click="exportExcel">
        <i class="fas fa-download"></i> Xuất Excel
      </button>
      <button class="btn btn-danger" @click="onDeleteAllTasks">
        <i class="fas fa-trash"></i> Xóa tất cả
      </button>
    </div>

    <!-- Task List -->
    <div class="schedule-list">
      <div v-if="paginatedTasks.length > 0" class="task-grid">
        <div
          v-for="(task, index) in paginatedTasks"
          :key="task.id"
          class="task-card"
          :class="{
            'selected': selectedIndex === index,
            'completed': task.status === 'completed',
            'overdue': isOverdue(task),
            'high-priority': task.priority === 'high'
          }"
          @click="selectTask(index)"
        >
          <div class="task-header">
            <h4>{{ task.title }}</h4>
            <div class="task-status">
              <span class="status-badge" :class="task.status?.toLowerCase()">{{ getStatusText(task.status) }}</span>
              <span class="priority-badge" :class="task.priority">
                {{ getPriorityText(task.priority) }}
              </span>
            </div>
          </div>
          <p class="task-description">{{ task.description }}</p>
          <div class="task-details">
            <div class="task-assignee">
              <i class="fas fa-user"></i>
              {{ task.assignedUser?.username || task.assignee_name || task.assigned_to || 'Chưa phân công' }}
            </div>
            <div class="task-due-date">
              <i class="fas fa-calendar"></i>
              {{ formatDate(task.dueDate) }}
            </div>
          </div>
          <div class="task-progress">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: task.progress + '%' }"
              ></div>
            </div>
            <span class="progress-text">{{ task.progress }}%</span>
          </div>
          <div class="task-actions">
            <button class="btn-icon" @click.stop="editTask(task)">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon" @click.stop="duplicateTask(task)">
              <i class="fas fa-copy"></i>
            </button>
            <button class="btn-icon danger" @click.stop="deleteTask(task.id)">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
      <p v-else class="text-muted mt-4">Không có task nào phù hợp với bộ lọc.</p>
    </div>

    <!-- Pagination -->
    <MainPagination
      :total-pages="totalPages"
      :current-page="currentPage"
      @update:current-page="changeCurrentPage"
    />

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <h3>{{ showEditModal ? 'Chỉnh sửa Task' : 'Tạo Task mới' }}</h3>
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
              <label>Độ ưu tiên:</label>
              <select v-model="taskForm.priority" class="form-input">
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
              </select>
            </div>
            <div class="form-group">
              <label>Trạng thái:</label>
              <select v-model="taskForm.status" class="form-input">
                <option value="pending">Đang thực hiện</option>
                <option value="in-progress">Đang tiến hành</option>
                <option value="completed">Hoàn thành</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Hạn hoàn thành:</label>
              <input v-model="taskForm.dueDate" type="date" class="form-input" required>
            </div>
            <div class="form-group">
              <label>Người thực hiện:</label>
              <select v-model="taskForm.assignedUser" class="form-input">
                <option value="">Chọn người thực hiện</option>
                <option v-for="user in users" :key="user.userId" :value="user.userId">
                  {{ user.username }}
                </option>
              </select>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeModals">Hủy</button>
            <button type="submit" class="btn btn-primary">{{ showEditModal ? 'Cập nhật' : 'Tạo' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import MainPagination from '@/components/MainPagination.vue';
import { useTasksQuery } from '@/composables/useTasksQuery';
import { useCreateTaskMutation } from '@/composables/useCreateTaskMutation';
import { useUpdateTaskMutation } from '@/composables/useUpdateTaskMutation';
import { useDeleteTaskMutation } from '@/composables/useDeleteTaskMutation';
import { useUsersQuery } from '@/composables/useUsersQuery';
import Chart from 'chart.js/auto';
import * as XLSX from 'xlsx';

const currentPage = ref(1);
const itemsPerPage = ref(9);
const selectedIndex = ref(-1);
const searchText = ref('');
const statusFilter = ref('');
const priorityFilter = ref('');
const sortBy = ref('');

const showCreateModal = ref(false);
const showEditModal = ref(false);
const editingTask = ref(null);

const taskForm = ref({
  title: '',
  description: '',
  priority: 'medium',
  status: 'pending',
  dueDate: '',
  progress: 0,
  assignedUser: '' // sẽ là userId
});

const statusChart = ref(null);
const progressChart = ref(null);
let statusChartInstance = null;
let progressChartInstance = null;

// TanStack Query composables
const { data: tasksData, refetch } = useTasksQuery(currentPage, itemsPerPage);
const createTaskMutation = useCreateTaskMutation();
const updateTaskMutation = useUpdateTaskMutation();
const deleteTaskMutation = useDeleteTaskMutation();
const { data: usersData } = useUsersQuery(1, 1000);
const users = computed(() => (usersData.value?.users || []));

const tasks = computed(() => {
  return (tasksData.value?.tasks || []).map(task => ({
    ...task,
    progress: task.progress ?? 0,
    priority: task.priority ?? 'medium',
    status: task.status || task.status_name || task.TASK_Status || 'pending',
    // nếu backend chắc chắn có status thì có thể bỏ 'pending'
    assignedUser: task.assignedUser || { userId: '', username: '' }
  }));
});

const totalTasks = computed(() => tasksData.value?.stats?.total ?? tasks.value.length);
const completedTasks = computed(() => tasksData.value?.stats?.completed ?? tasks.value.filter(task => task.status === 'completed').length);
const pendingTasks = computed(() => tasksData.value?.stats?.pending ?? tasks.value.filter(task => task.status === 'pending').length);
const overdueTasks = computed(() => tasksData.value?.stats?.overdue ?? tasks.value.filter(task => isOverdue(task)).length);

// Lấy danh sách trạng thái thực tế từ dữ liệu
const statusOptions = computed(() => {
  const set = new Set(tasks.value.map(t => t.status));
  return Array.from(set).filter(Boolean);
});

// Phân bố trạng thái cho biểu đồ
function getStatusDistribution() {
  const dist = {};
  tasks.value.forEach(task => {
    const key = task.status;
    dist[key] = (dist[key] || 0) + 1;
  });
  return dist;
}

// Sửa lại các computed, filter, search, sort để dùng đúng trường backend
const totalPages = computed(() => tasksData.value?.pagination?.lastPage || 1);

function isOverdue(task) {
  if (task.status === 'completed') return false;
  return new Date(task.dueDate) < new Date();
}

function getStatusText(status) {
  const statusMap = {
    pending: "Pending",
    "in-progress": "In Progress",
    completed: "Completed",
    review: "Review",
    overdue: "Overdue"
  };
  return statusMap[status] || status || "Unknown";
}

function getPriorityText(priority) {
  const priorityMap = {
    high: 'Cao',
    medium: 'Trung bình',
    low: 'Thấp'
  };
  return priorityMap[priority] || priority;
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return isNaN(date) ? '' : date.toLocaleDateString('vi-VN');
}

function selectTask(index) {
  selectedIndex.value = selectedIndex.value === index ? -1 : index;
}

function editTask(task) {
  editingTask.value = task;
  taskForm.value = {
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate,
    progress: task.progress,
    assignedUser: task.assignedUser?.userId || '' // userId
  };
  showEditModal.value = true;
}

function duplicateTask(task) {
  taskForm.value = {
    title: task.title + ' (Copy)',
    description: task.description,
    priority: task.priority,
    status: 'pending',
    dueDate: task.dueDate,
    progress: 0,
    assignedUser: task.assignedUser?.userId || '' // userId
  };
  showCreateModal.value = true;
}

async function saveTask() {
  // Kiểm tra description không được để trống
  if (!taskForm.value.description || taskForm.value.description.trim().length < 1) {
    alert('Vui lòng nhập mô tả cho task!');
    return;
  }
  try {
    const payload = {
      ...taskForm.value,
      assignedTo: String(taskForm.value.assignedUser), // gửi userId
    };
    console.log('Payload tạo task:', payload);
    if (showEditModal.value && editingTask.value) {
      await updateTaskMutation.mutateAsync({ id: editingTask.value.id, payload });
    } else {
      await createTaskMutation.mutateAsync(payload);
      closeModals();
      currentPage.value = 1;
      await nextTick();
      refetch();
      return;
    }
    closeModals();
    refetch();
  } catch (error) {
    console.log('Lỗi tạo task:', error);
    closeModals();
    refetch();
  }
}

function closeModals() {
  showCreateModal.value = false;
  showEditModal.value = false;
  editingTask.value = null;
  taskForm.value = {
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    dueDate: '',
    progress: 0,
    assignedUser: ''
  };
}

async function deleteTask(taskId) {
  if (confirm('Bạn có chắc muốn xóa task này?')) {
    try {
      await deleteTaskMutation.mutateAsync(taskId);
      refetch();
    } catch (error) {
      console.log(error);
    }
  }
}

// Button tạo task
function openCreateModal() {
  showCreateModal.value = true;
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;
  taskForm.value = {
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    dueDate: todayStr, // set mặc định là ngày hôm nay
    progress: 0,
    assignedUser: ''
  };
}

// Button làm mới
function refreshTasks() {
  refetch();
}

// Button xóa tất cả
function onDeleteAllTasks() {
  if (confirm('Bạn muốn xóa tất cả Tasks?')) {
    deleteTaskMutation.mutate(undefined, {
      onSuccess: () => {
        refetch();
        selectedIndex.value = -1;
        changeCurrentPage(1);
      }
    });
  }
}

// Button export
function exportExcel() {
  const data = (tasks.value || []).map(task => ({
    'Tiêu đề': task.title,
    'Mô tả': task.description,
    'Người thực hiện': task.assignedUser?.username || task.assignee_name || task.assigned_to || '',
    'Hạn hoàn thành': formatDate(task.dueDate || task.due_date),
    'Độ ưu tiên': getPriorityText(task.priority),
    'Trạng thái': getStatusText(task.status || task.status_name || task.TASK_Status),
    'Tiến độ': (task.progress || 0) + '%'
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tasks');
  XLSX.writeFile(wb, 'tasks_export.xlsx');
}

function changeCurrentPage(page) {
  currentPage.value = page;
}

// Phân trang
const paginatedTasks = computed(() => {
  let filtered = tasks.value;

  // Tìm kiếm theo tiêu đề, mô tả, người thực hiện
  if (searchText.value) {
    const keyword = searchText.value.toLowerCase();
    filtered = filtered.filter(task =>
      task.title?.toLowerCase().includes(keyword) ||
      task.description?.toLowerCase().includes(keyword) ||
      task.assignedUser?.username?.toLowerCase().includes(keyword)
    );
  }

  // Lọc theo trạng thái
  if (statusFilter.value) {
    filtered = filtered.filter(task => task.status === statusFilter.value);
  }

  // Lọc theo độ ưu tiên
  if (priorityFilter.value) {
    filtered = filtered.filter(task => task.priority === priorityFilter.value);
  }

  // Sắp xếp
  if (sortBy.value) {
    filtered = [...filtered].sort((a, b) => {
      if (sortBy.value === 'dueDate') {
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else {
        return String(a[sortBy.value] || '').localeCompare(String(b[sortBy.value] || ''));
      }
    });
  }

  return filtered;
});

function updateCharts() {
  updateStatusChart();
  updateProgressChart();
}

function updateStatusChart() {
  if (statusChartInstance) {
    statusChartInstance.destroy();
  }
  if (!statusChart.value) return;
  const ctx = statusChart.value.getContext('2d');
  const dist = getStatusDistribution();
  const labels = Object.keys(dist).map(getStatusText);
  const data = Object.values(dist);
  const statusData = {
    labels: labels,
    datasets: [{
      data: data,
      backgroundColor: ['#ffc107', '#28a745', '#dc3545'],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };
  statusChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: statusData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

function updateProgressChart() {
  if (progressChartInstance) {
    progressChartInstance.destroy();
  }
  if (!progressChart.value) return;
  const ctx = progressChart.value.getContext('2d');
  // Dữ liệu demo: số task hoàn thành mỗi ngày trong 7 ngày gần nhất
  const last7Days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    last7Days.push(date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }));
  }
  // Đếm số task completed theo ngày (nếu có trường completedDate thì dùng, nếu không thì random demo)
  const progressData = {
    labels: last7Days,
    datasets: [{
      label: 'Tasks hoàn thành',
      data: [2, 1, 3, 2, 4, 1, 2], // Mock data
      borderColor: '#4f8cff',
      backgroundColor: 'rgba(79, 140, 255, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };
  progressChartInstance = new Chart(ctx, {
    type: 'line',
    data: progressData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

watch([tasks, pendingTasks, completedTasks, overdueTasks], async () => {
  await nextTick();
  updateCharts();
});

watch([searchText, statusFilter, priorityFilter, sortBy], () => {
  currentPage.value = 1;
  selectedIndex.value = -1;
});

watch(usersData, () => {
  if (usersData.value && usersData.value.users) {
    console.log('Số lượng users lấy được:', usersData.value.users.length, usersData.value.pagination);
  }
});

onMounted(async () => {
  await nextTick();
  updateCharts();
});
onUnmounted(() => {
  if (statusChartInstance) statusChartInstance.destroy();
  if (progressChartInstance) progressChartInstance.destroy();
});
defineOptions({
  name: 'SchedulePage',
});
</script>

<style scoped>
.schedule-page {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: var(--blue-pastel, #4f8cff);
  margin-bottom: 24px;
  font-size: 2rem;
  font-weight: 600;
}

/* Dashboard Stats */
.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #4f8cff;
  color: white;
  font-size: 1.5rem;
}

.stat-icon.completed {
  background: #28a745;
}

.stat-icon.pending {
  background: #ffc107;
}

.stat-icon.overdue {
  background: #dc3545;
}

.stat-content h3 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
}

.stat-content p {
  margin: 4px 0 0 0;
  color: #666;
  font-size: 0.9rem;
}

/* Charts */
.charts-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.chart-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-container h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.2rem;
}

.chart-wrapper {
  height: 300px;
  position: relative;
}

/* Filters */
.schedule-filters {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-group label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.filter-select {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e3f0ff;
  font-size: 0.9rem;
  min-width: 120px;
}

/* Actions */
.schedule-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid #e3f0ff;
  font-size: 1rem;
  min-width: 200px;
}

.btn {
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-primary {
  background: #4f8cff;
  color: white;
}

.btn-primary:hover {
  background: #3a7ce8;
}

.btn-outline-primary {
  background: transparent;
  color: #4f8cff;
  border: 1px solid #4f8cff;
}

.btn-outline-primary:hover {
  background: #4f8cff;
  color: white;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

/* Task Grid */
.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.task-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  border-left: 4px solid #e9ecef;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.task-card.selected {
  border-left-color: #4f8cff;
  box-shadow: 0 4px 16px rgba(79, 140, 255, 0.2);
}

.task-card.completed {
  border-left-color: #28a745;
  opacity: 0.8;
}

.task-card.overdue {
  border-left-color: #dc3545;
}

.task-card.high-priority {
  border-left-color: #ff6b6b;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.task-header h4 {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
  flex: 1;
}

.task-status {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
}

.status-badge, .priority-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
  min-width: 60px;
}

.status-badge {
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.98rem;
  display: inline-block;
  margin-right: 8px;
}
.status-badge.pending, .status-badge[aria-label="pending"] {
  color: #faad14;
  background: #fffbe6;
}
.status-badge.in-progress {
  background: #e0f2fe;
  color: #0369a1;
}
.status-badge.completed, .status-badge[aria-label="completed"] {
  color: #52c41a;
  background: #f6ffed;
}
.status-badge.overdue, .status-badge[aria-label="overdue"] {
  color: #ff4d4f;
  background: #fff2f0;
}
.status-badge[aria-label="1"] {
  color: #faad14;
  background: #fffbe6;
}
.status-badge[aria-label="2"] {
  color: #1890ff;
  background: #e6f7ff;
}
.status-badge[aria-label="3"] {
  color: #52c41a;
  background: #f6ffed;
}

.priority-badge.high {
  background: #f8d7da;
  color: #721c24;
}

.priority-badge.medium {
  background: #fff3cd;
  color: #856404;
}

.priority-badge.low {
  background: #d1ecf1;
  color: #0c5460;
}

.task-description {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 0.85rem;
  color: #666;
}

.task-assignee, .task-due-date {
  display: flex;
  align-items: center;
  gap: 6px;
}

.task-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4f8cff, #28a745);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
  min-width: 35px;
}

.task-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #f8f9fa;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #e9ecef;
  color: #333;
}

.btn-icon.danger:hover {
  background: #dc3545;
  color: white;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin: 0 0 24px 0;
  color: #333;
  font-size: 1.4rem;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: #333;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e3f0ff;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #4f8cff;
  box-shadow: 0 0 0 3px rgba(79, 140, 255, 0.1);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

/* Responsive */
@media (max-width: 768px) {
  .schedule-page {
    padding: 16px;
  }

  .dashboard-stats {
    grid-template-columns: 1fr;
  }

  .charts-section {
    grid-template-columns: 1fr;
  }

  .schedule-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    width: 100%;
  }

  .filter-select {
    width: 100%;
  }

  .schedule-actions {
    flex-direction: column;
  }

  .search-input {
    width: 100%;
  }

  .task-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-content {
    padding: 24px;
    margin: 16px;
  }
}

@media (max-width: 480px) {
  .schedule-page {
    padding: 12px;
  }

  h1 {
    font-size: 1.5rem;
  }

  .stat-card {
    padding: 16px;
  }

  .chart-container {
    padding: 16px;
  }

  .task-card {
    padding: 16px;
  }

  .task-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .task-status {
    flex-direction: row;
    gap: 8px;
  }

  .task-details {
    flex-direction: column;
    gap: 8px;
  }
}

/* Utilities */
.text-muted {
  color: #6c757d;
  text-align: center;
  font-style: italic;
}

.mt-4 {
  margin-top: 1.5rem;
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.task-card {
  animation: fadeIn 0.3s ease-out;
}

/* Custom scrollbar for modal */
.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Print styles */
@media print {
  .schedule-actions,
  .modal-overlay,
  .task-actions,
  .btn {
    display: none !important;
  }

  .task-card {
    break-inside: avoid;
    margin-bottom: 16px;
  }

  .charts-section {
    display: none;
  }
}
</style>
