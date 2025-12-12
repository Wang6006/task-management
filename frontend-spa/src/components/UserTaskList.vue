<script setup>
import tasksService from '@/services/tasks.service.js';
defineProps({
    tasks: { type: Array, default: () => [] },
    selectedIndex: { type: Number, default: -1 },
});
const $emit = defineEmits(['update:selectedIndex']);

// Tính % hoàn thành của task (ví dụ đơn giản: DONE = 100%)
function progress(task) {
    return task.status_name === 'DONE' ? 100 : 0;
}

function avatars(task) {
    if (task.assignedUser?.avatarUrl) {
        return [task.assignedUser.avatarUrl];
    }
    return ['/default-avatar.png']; // fallback
}
async function submitTask(task) {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "*/*";
    fileInput.click();

    fileInput.onchange = async () => {
        const file = fileInput.files?.[0];
        if (!file) return;

        const userId = Number(localStorage.getItem("userId"));
        if (!userId) {
            alert("User ID not found. Are you logged in?");
            return;
        }

        const response = await tasksService.submitTaskFile({
            userId,
            taskId: task.id,
            file,
        });

        if (response.success) {
            alert("Submitted successfully!");
            console.log(response.data);
        } else {
            alert("Submission failed.");
            console.error(response.error);
        }
    };
}
</script>

<template>
    <div class="task-list">
        <div v-for="(task, index) in tasks" :key="task.id" class="task-card card"
            :class="{ active: index === selectedIndex }" @click="$emit('update:selectedIndex', index)">
            <div class="card-body d-flex flex-column justify-content-between">
                <div class="d-flex align-items-center">
                    <div class="task-info flex-grow-1">
                        <h6 class="mb-1">{{ task.title }}</h6>
                        <p class="mb-1 text-muted">{{ task.description }}</p>
                        <small class="text-muted">
                            Due: {{ task.due_date ? new Date(task.due_date).toLocaleDateString('vi-VN') : 'No due date'
                            }}
                            | Status: {{ task.status_name || 'Unknown' }}
                        </small>
                        <div class="progress mt-2" style="height: 6px;">
                            <div class="progress-bar" role="progressbar" :style="{ width: progress(task) + '%' }"
                                :aria-valuenow="progress(task)" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                    </div>
                    <div class="avatars d-flex ms-3">
                        <img v-for="(avatar, idx) in avatars(task)" :key="idx" :src="avatar" alt="avatar"
                            class="rounded-circle" width="30" height="30"
                            :style="{ marginLeft: idx === 0 ? '0' : '-10px' }" />
                    </div>
                </div>

                <!-- Submit button -->
                <div class="mt-3 text-end">
                    <button class="btn btn-sm btn-primary" @click.stop="submitTask(task)">Nộp bài</button>
                </div>
            </div>
        </div>
    </div>
</template>


<style scoped>
.task-card .btn {
    border-radius: 6px;
    font-size: 0.875rem;
    padding: 0.4rem 0.8rem;
}

.task-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
    padding: 1rem 0;
}

.task-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.task-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.task-card.active {
    border: 2px solid #4c8bf5;
}

.card-body {
    padding: 1rem;
}

.task-info h6 {
    font-size: 1rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.3rem;
}

.task-info small {
    color: #888;
}

.progress {
    background-color: #e0e0e0;
    border-radius: 20px;
    overflow: hidden;
}

.progress-bar {
    background-color: #4caf50;
    transition: width 0.3s ease;
}

.avatars img {
    border: 2px solid #fff;
    box-shadow: 0 0 0 1px #ccc;
}
</style>
