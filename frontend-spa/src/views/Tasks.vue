<script setup>
import { ref, computed, defineOptions } from 'vue'
import { useTasksQuery } from '@/composables/useTasksQuery'
import messagesService from '@/services/messages.service'
import MainPagination from '@/components/MainPagination.vue'

defineOptions({
  name: 'TasksPage'
})

const currentPage = ref(1)
const itemsPerPage = ref(9)

// Comments state
const taskComments = ref({})
const showCommentModal = ref(false)
const selectedTask = ref(null)
const newComment = ref('')
const userId = Number(localStorage.getItem('userId'))
const username = localStorage.getItem('username') || 'Người dùng'

const { data: tasksData, isLoading, error } = useTasksQuery(currentPage, itemsPerPage)
const tasks = computed(() => tasksData.value?.tasks || [])
const totalPages = computed(() => tasksData.value?.pagination?.lastPage || 1)

function changePage(page) {
  currentPage.value = page
}

async function openCommentModal(task) {
  selectedTask.value = task
  showCommentModal.value = true
  newComment.value = ''

  const taskId = task.id || task.taskId

  try {
    const comments = await messagesService.getMessagesByTaskId(taskId)
    taskComments.value[taskId] = comments.map(c => ({
      id: c.MESSAGE_ID,
      text: c.MESSAGE_Content,
      author: c.sender_username || 'Ẩn danh',
      timestamp: c.messages_createdate
        ? new Date(c.messages_createdate).toLocaleString('vi-VN')
        : 'Thời gian không xác định'
    }))
  } catch (err) {
    console.error('Lỗi khi tải bình luận:', err.message)
    taskComments.value[taskId] = []
  }
}

function closeCommentModal() {
  showCommentModal.value = false
  selectedTask.value = null
  newComment.value = ''
}

async function addComment() {
  if (!newComment.value.trim() || !selectedTask.value) return

  const taskId = selectedTask.value.id || selectedTask.value.taskId
  const receiverId = selectedTask.value.assigned_by || 1 // fallback receiver

  const messageData = {
    sender_id: userId,
    receiver_id: receiverId,
    content: newComment.value.trim(),
    task_id: taskId
  }

  try {
    const result = await messagesService.sendMessage(messageData)

    const comment = {
      id: result.MESSAGE_ID,
      text: result.MESSAGE_Content,
      author: username,
      timestamp: new Date(result.MESSAGE_Time).toLocaleString('vi-VN')
    }

    if (!taskComments.value[taskId]) {
      taskComments.value[taskId] = []
    }

    taskComments.value[taskId].push(comment)
    newComment.value = ''
  } catch (error) {
    console.error('Không thể gửi bình luận:', error.message)
    alert('Không thể gửi bình luận. Vui lòng thử lại.')
  }
}


function getTaskComments(task) {
  const taskId = task.id || task.taskId
  return taskComments.value[taskId] || []
}

function getStatusClass(statusName) {
  switch (statusName?.toLowerCase()) {
    case 'đang thực hiện':
    case 'in progress':
      return 'status-warning'
    case 'hoàn thành':
    case 'completed':
      return 'status-success'
    case 'quá hạn':
    case 'overdue':
      return 'status-danger'
    case 'chờ xử lý':
    case 'pending':
      return 'status-neutral'
    default:
      return 'status-default'
  }
}
</script>

<template>
  <div class="tasks-container">
    <!-- Header -->
    <div class="tasks-header">
      <h2 class="tasks-title">
        <i class="fas fa-tasks"></i>
        Quản lý Tasks
      </h2>
      <!-- Xóa nút Thêm task ở đây -->
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Đang tải danh sách task...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <p>Lỗi tải dữ liệu task!</p>
    </div>

    <!-- Tasks Grid -->
    <div v-else class="tasks-content">
      <div class="tasks-grid">
        <div v-for="(task, idx) in tasks" :key="task.id || task.taskId" class="task-card">
          <!-- Card Header -->
          <div class="task-header">
            <div class="task-number">
              #{{ (currentPage - 1) * itemsPerPage + idx + 1 }}
            </div>
            <span class="task-status" :class="getStatusClass(task.status_name)">{{ task.status_name }}</span>
          </div>

          <!-- Task Content -->
          <div class="task-content">
            <h3 class="task-title" :title="task.title">
              {{ task.title }}
            </h3>

            <div class="task-assignee">
              <i class="fas fa-user"></i>
              <span>{{ task.assignee_name || 'Chưa phân công' }}</span>
            </div>

            <div class="task-comments-info">
              <i class="fas fa-comments"></i>
              <span>{{ getTaskComments(task).length }} bình luận</span>
            </div>
          </div>

          <!-- Card Actions -->
          <div class="task-actions">
            <button class="btn-comment" @click="openCommentModal(task)"
              :title="`Xem bình luận (${getTaskComments(task).length})`">
              <i class="fas fa-comment-dots"></i>
              Bình luận
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <MainPagination :total-pages="totalPages" :current-page="currentPage" @update:current-page="changePage" />
    </div>

    <!-- Comment Modal -->
    <div v-if="showCommentModal" class="modal-overlay" @click="closeCommentModal">
      <div class="comment-modal" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fas fa-comments"></i>
            Bình luận - {{ selectedTask?.title }}
          </h3>
          <button class="btn-close" @click="closeCommentModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <!-- Comments List -->
          <div class="comments-list">
            <div v-for="comment in getTaskComments(selectedTask)" :key="comment.id" class="comment-item">
              <div class="comment-header">
                <strong>{{ comment.author }}</strong>
                <span class="comment-time">{{ comment.timestamp }}</span>
              </div>
              <p class="comment-text">{{ comment.text }}</p>
            </div>

            <div v-if="getTaskComments(selectedTask).length === 0" class="no-comments">
              <i class="fas fa-comment-slash"></i>
              <p>Chưa có bình luận nào</p>
            </div>
          </div>

          <!-- Add Comment Form -->
          <div class="add-comment-form">
            <textarea v-model="newComment" placeholder="Nhập bình luận của bạn..." class="comment-input" rows="3"
              @keydown.ctrl.enter="addComment"></textarea>
            <div class="comment-actions">
              <small class="text-muted">Nhấn Ctrl+Enter để gửi</small>
              <button class="btn-send-comment" @click="addComment" :disabled="!newComment.trim()">
                <i class="fas fa-paper-plane"></i>
                Gửi bình luận
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tasks-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.tasks-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  padding: 24px 0;
  border-bottom: 2px solid #e2e8f0;
}

.tasks-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.tasks-title i {
  color: #3b82f6;
}

.btn-add-task {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-add-task:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.error-state {
  text-align: center;
  padding: 60px 20px;
  color: #ef4444;
}

.error-state i {
  font-size: 3rem;
  margin-bottom: 16px;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.task-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  cursor: pointer;
}

.task-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.task-number {
  background: #f1f5f9;
  color: #475569;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.875rem;
}

.task-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.875rem;
}

.status-success {
  background: #dcfce7;
  color: #166534;
}

.status-warning {
  background: #fef3c7;
  color: #92400e;
}

.status-danger {
  background: #fee2e2;
  color: #991b1b;
}

.status-neutral {
  background: #e0f2fe;
  color: #0369a1;
}

.status-default {
  background: #e5e7eb;
  color: #374151;
}

.task-content {
  margin-bottom: 20px;
}

.task-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-assignee,
.task-comments-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 8px;
}

.task-assignee i,
.task-comments-info i {
  color: #94a3b8;
  width: 16px;
}

.task-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-comment {
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-comment:hover {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

/* Modal Styles */
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
  backdrop-filter: blur(4px);
}

.comment-modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-close {
  background: none;
  border: none;
  color: #64748b;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s;
}

.btn-close:hover {
  color: #ef4444;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.comments-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 24px;
}

.comment-item {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border-left: 4px solid #3b82f6;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-header strong {
  color: #1e293b;
  font-size: 0.875rem;
}

.comment-time {
  color: #64748b;
  font-size: 0.75rem;
}

.comment-text {
  color: #475569;
  margin: 0;
  line-height: 1.5;
}

.no-comments {
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
}

.no-comments i {
  font-size: 2rem;
  margin-bottom: 12px;
}

.add-comment-form {
  border-top: 1px solid #e2e8f0;
  padding-top: 24px;
}

.comment-input {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 12px 16px;
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 80px;
  margin-bottom: 12px;
  transition: border-color 0.2s;
}

.comment-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.comment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text-muted {
  color: #94a3b8;
  font-size: 0.75rem;
}

.btn-send-comment {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-send-comment:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-send-comment:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .tasks-container {
    padding: 16px;
  }

  .tasks-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .tasks-title {
    font-size: 1.5rem;
  }

  .tasks-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .comment-modal {
    width: 95%;
    margin: 20px;
  }

  .modal-body {
    padding: 16px;
  }
}
</style>