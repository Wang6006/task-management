<script setup>
import { ref, onMounted, computed } from 'vue';
import tasksService from '@/services/tasks.service';

defineOptions({ name: 'AppRoadmap' });

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const tasks = ref([]);
const loading = ref(true);
const tasksData = ref({});

async function loadTasks() {
  try {
    const userId = localStorage.getItem('userId');
    console.log('🔍 Fetching tasks for user ID:', userId);
    if (!userId) throw new Error('User ID not found in localStorage');

    const res = await tasksService.fetchTasks(1); // or pass userId to the API if needed
    console.log('🧾 Full response from fetchTasks:', res);

    // res.tasks is already the array
    tasks.value = res.tasks || [];
    tasksData.value = res.pagination || {};

    console.log('✅ Loaded tasks:', tasks.value);
    console.log('📦 Pagination info:', tasksData.value);
  } catch (error) {
    console.error('❌ Failed to load tasks:', error);
  } finally {
    loading.value = false;
  }
}
console.log('✅ Loaded tasks:', tasks.value);
onMounted(loadTasks);

function getMonthIndex(dateString) {
  const d = new Date(dateString);
  return d.getMonth(); // 0–11
}

const roadmapItems = computed(() => {
  if (!Array.isArray(tasks.value)) return [];

  console.log('📦 Raw task data:', tasks.value); // 🔍 log full array

  return tasks.value.map(task => {
    if (!task?.due_date) {
      console.warn('⛔ Missing due_date in task:', task);
      return null;
    }

    const monthIndex = getMonthIndex(task.due_date);
    console.log(`📅 Task "${task.title}" is due in month index:`, monthIndex);

    return {
      name: task.title,
      bars: [
        {
          label: task.status_name ?? 'Task',
          start: monthIndex,
          end: monthIndex + 1,
          color:
            task.TASK_Status === 1 ? '#22c55e' :
              task.TASK_Status === 2 ? '#facc15' :
                '#ef4444'
        }
      ]
    };
  }).filter(Boolean); // filter out null values
});
function barStyle(bar) {
  return {
    left: `${bar.start * 80}px`, // assuming each month column = 80px width
    width: `${(bar.end - bar.start) * 80}px`,
    backgroundColor: bar.color,
  };
}
</script>

<template>
  <div class="roadmap">
    <h3 class="roadmap-title mb-4">
      <i class="fas fa-route me-2"></i> Task Roadmap
    </h3>

    <div v-if="loading" class="roadmap-empty">Đang tải dữ liệu...</div>

    <div v-else-if="roadmapItems && roadmapItems.length === 0" class="roadmap-empty">
      Không có dữ liệu task để vẽ biểu đồ.
    </div>

    <div v-else class="roadmap-table">
      <div class="roadmap-header">
        <div class="roadmap-task-col"></div>
        <div class="roadmap-month" v-for="month in months" :key="month">{{ month }}</div>
      </div>

      <div class="roadmap-row" v-for="item in roadmapItems" :key="item.name">
        <div class="roadmap-task-col">{{ item.name }}</div>
        <div class="roadmap-bars">
          <div v-for="bar in item.bars" :key="bar.label" class="roadmap-bar" :style="barStyle(bar)">
            {{ bar.label }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.roadmap {
  width: 100%;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 2px 16px #347ae220;
  padding: 24px 32px 32px 32px;
  min-width: 500px;
  min-height: 500px;
}

.roadmap-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #347ae2;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.roadmap-empty {
  color: #b0b8c9;
  font-size: 1.1rem;
  text-align: center;
  margin-top: 32px;
}

.roadmap-table {
  width: 100%;
}

.roadmap-header {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #7b8ca5;
  margin-bottom: 12px;
}

.roadmap-task-col {
  width: 180px;
  min-width: 120px;
  font-size: 1.08rem;
  color: #222;
  font-weight: 500;
  padding-right: 12px;
}

.roadmap-month {
  width: 80px;
  text-align: center;
  font-size: 1.05rem;
  color: #7b8ca5;
}

.roadmap-row {
  display: flex;
  align-items: center;
  min-height: 38px;
  margin-bottom: 10px;
}

.roadmap-bars {
  position: relative;
  flex: 1;
  height: 32px;
}

.roadmap-bar {
  position: absolute;
  top: 4px;
  height: 24px;
  border-radius: 16px;
  color: #7b8ca5;
  font-size: xx-small !important;
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  background-image: linear-gradient(to right, rgba(255, 255, 255, 0.1), rgba(0, 0, 0, 0.05));
  background-blend-mode: overlay;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  letter-spacing: 0.4px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.3s ease;
}

.roadmap-bar:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
}
</style>
