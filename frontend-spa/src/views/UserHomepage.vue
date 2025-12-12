<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import InputSearch from '@/components/InputSearch.vue';
import TaskList from '@/components/UserTaskList.vue';
import MainPagination from '@/components/MainPagination.vue';
import AppRoadmap from '@/components/Roadmap.vue';
import messagesService from '@/services/messages.service';
import { useTasksQuery } from '@/composables/useTasksQuery';

const router = useRouter();
const route = useRoute();

const searchText = ref('');
const selectedIndex = ref(-1);
const showCommentSection = ref(true);
const newComment = ref('');

const itemsPerPage = ref(10);
const currentPage = computed(() => {
    const page = Number(route.query.page);
    return Number.isNaN(page) || page < 1 ? 1 : page;
});

const userId = localStorage.getItem('userId');
const username = localStorage.getItem('username') || 'Người dùng';

const { data: tasksData, refetch } = useTasksQuery(currentPage, itemsPerPage);

const tasks = computed(() =>
    (tasksData.value?.tasks || [])
        .filter((task) => Number(task.assigned_to) === Number(userId))
        .sort((a, b) => a.title.localeCompare(b.title))
);
const totalPages = computed(() =>
    tasksData.value?.pagination?.lastPage || 1
);

const searchableTasks = computed(() =>
    tasks.value.map((task) => {
        const { title, description, assignee_name } = task;
        return [title, description, assignee_name || ''].join('');
    })
);

const filteredTasks = computed(() => {
    if (!searchText.value) return tasks.value;
    return tasks.value.filter((task, index) =>
        searchableTasks.value[index]
            .toLowerCase()
            .includes(searchText.value.toLowerCase())
    );
});

const selectedTask = computed(() => {
    if (selectedIndex.value < 0 || selectedIndex.value >= filteredTasks.value.length) return null;
    return filteredTasks.value[selectedIndex.value];
});

watch(searchText, () => (selectedIndex.value = -1));
watch(selectedTask, async (newVal) => {
    if (newVal) {
        showCommentSection.value = true;
        try {
            const comments = await messagesService.getMessagesByTaskId(newVal.id);
            console.log('Comments loaded:', comments);
            selectedTask.value.comments = comments;
        } catch (err) {
            console.error('Lỗi khi tải bình luận:', err.message);
        }
    }
});

function changeCurrentPage(page) {
    router.push({ name: 'user.home', query: { page } });
}

async function submitComment() {
    if (!newComment.value.trim()) {
        alert('Bình luận không được để trống!');
        return;
    }

    if (!selectedTask.value) {
        alert('Vui lòng chọn một task để bình luận.');
        return;
    }

    const messageData = {
        sender_id: Number(userId),
        receiver_id: Number(selectedTask.value.assigned_by),
        content: newComment.value.trim(),
        task_id: selectedTask.value.id,
    };

    try {
        const result = await messagesService.sendMessage(messageData);

        const taskIndex = tasks.value.findIndex(task => task.id === selectedTask.value.id);
        if (taskIndex !== -1) {
            if (!Array.isArray(tasks.value[taskIndex].comments)) {
                tasks.value[taskIndex].comments = [];
            }
            tasks.value[taskIndex].comments.push(result);
        }

        newComment.value = '';
    } catch (error) {
        alert('Không thể gửi bình luận. Vui lòng thử lại.');
        console.error('Lỗi khi gửi bình luận:', error.message);
    }
}
</script>


<template>
    <div class="taskboard-layout">
        <div class="taskboard-left">
            <div class="taskboard-header">
                <h2 class="taskboard-title">
                    <i class="fas fa-user-circle me-2"></i> Xin chào, {{ username }}!
                </h2>
            </div>

            <InputSearch v-model="searchText" placeholder="Tìm task theo tên, mô tả..." />

            <div class="taskboard-list">
                <TaskList v-if="filteredTasks.length > 0" :tasks="filteredTasks" v-model:selected-index="selectedIndex"
                    @reselect="showCommentSection = true" />
                <p v-else class="text-muted mt-4">Bạn chưa có task nào.</p>
            </div>
            <!-- Comment section for selected task -->
            <div v-if="selectedTask && showCommentSection" class="taskboard-right mt-4 ms-4 comment-section">
                <div class="d-flex justify-content-between align-items-center w-100 mb-2">
                    <h5 class="mb-0">Bình luận cho: {{ selectedTask.title }}</h5>
                    <button @click="showCommentSection = false" class="btn btn-sm btn-danger ms-2">✕</button>
                </div>

                <p class="text-muted">{{ selectedTask.description }}</p>

                <textarea v-model="newComment" class="form-control mb-2" rows="3"
                    placeholder="Nhập bình luận..."></textarea>

                <button class="btn btn-primary btn-sm" @click="submitComment">
                    Gửi bình luận
                </button>

                <div class="mt-3 comment-list">
                    <div v-for="comment in selectedTask.comments" :key="comment.MESSAGE_ID" class="comment-item">
                        <p class="mb-1">
                            <strong>Người gửi #{{ comment.sender_username }}:</strong>
                        </p>
                        <p class="mb-0">{{ comment.MESSAGE_Content }}</p>
                    </div>
                </div>
            </div>
            <div class="taskboard-pagination">
                <MainPagination :total-pages="totalPages" :current-page="currentPage"
                    @update:current-page="changeCurrentPage" />
                <button class="btn btn-outline-primary mt-2" @click="refetch()">
                    <i class="fas fa-sync-alt"></i> Làm mới
                </button>
            </div>
        </div>
        <div class="taskboard-right">
            <div class="roadmap-card">
                <AppRoadmap />
            </div>
        </div>
    </div>
</template>

<style scoped>
.taskboard-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
    padding: 1rem 0;
}

.task-list {
    width: 100%;
    height: 300px;
    overflow-y: auto;
    max-width: 1300px;
}

.taskboard-layout {
    display: flex;
    flex-direction: column;
    gap: 32px;
    min-height: 80vh;
}

.taskboard-left {
    background: #fff;
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 32px 24px 24px 24px;
    display: flex;
    flex-direction: column;
    min-height: 600px;
}

.taskboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
}

.taskboard-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--blue-pastel);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
}

.taskboard-list {
    flex: 1;
    margin-bottom: 18px;
    overflow-y: auto;
    display: flex;
    justify-content: center;
    max-width: 1500px;
}

.taskboard-pagination {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.taskboard-right {
    flex: 1;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    min-width: 400px;
    flex-direction: column;
}

.roadmap-card {
    background: #fff;
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 32px 32px 24px 32px;
    min-width: 500px;
    min-height: 700px;
    width: 100%;
}

.taskboard-layout {
    display: flex;
    flex-wrap: wrap;
}

.taskboard-left {
    flex: 1 1 60%;
}

.taskboard-right {
    flex: 1 1 35%;
}

.comment-section {
    background-color: #fdfdfd;
    padding: 1.5rem;
    border: 1px solid #dee2e6;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.03);
}

.comment-list {
    margin-top: 1rem;
    width: 70%;
    margin-left: 10%;
}

.comment-item {
    background-color: #f8f9fa;
    border: 1px solid #ced4da;
    border-radius: 8px;
    padding: 0.75rem;
    margin-bottom: 0.75rem;
    transition: all 0.2s ease-in-out;
    width: 90%;
}

.comment-item:hover {
    background-color: #e9ecef;
}

@media (max-width: 1100px) {
    .taskboard-layout {
        flex-direction: column;
        gap: 16px;
    }

    .taskboard-left,
    .roadmap-card {
        min-width: unset;
        width: 100%;
        padding: 18px;
    }
}
</style>
