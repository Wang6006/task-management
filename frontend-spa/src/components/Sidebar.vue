<script setup>
import { useRouter, useRoute } from 'vue-router'

defineOptions({
  name: 'AppSidebar'
})

const router = useRouter()
const route = useRoute()

const isActive = (name) => route.name === name

function goTo(name) {
  router.push({ name })
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <span class="sidebar-logo">task<span class="dot">.</span></span>
    </div>
    <nav class="sidebar-menu">
      <ul>
        <li :class="{active: isActive('taskboard')}" @click="goTo('taskboard')">
          <i class="fas fa-compass"></i> Dashboard
        </li>
        <li :class="{active: isActive('schedule')}" @click="goTo('schedule')">
          <i class="fas fa-calendar-alt"></i> Schedule
        </li>
        <li :class="{active: isActive('tasks')}" @click="goTo('tasks')">
          <i class="fas fa-tasks"></i> Tasks
        </li>
        <li :class="{active: isActive('calendar')}" @click="goTo('calendar')">
          <i class="fas fa-calendar"></i> Calendar
        </li>
      </ul>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  border-radius: var(--radius);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08), 0 1px 8px rgba(0, 0, 0, 0.05);
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  min-height: 85vh;
  margin: 24px 24px 24px 0;
  border: 1px solid rgba(79, 140, 255, 0.08);
  position: relative;
}

.sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--blue-pastel), #4f8cff);
  border-radius: var(--radius) var(--radius) 0 0;
}

.sidebar-header {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--blue-pastel);
  margin-bottom: 48px;
  letter-spacing: 1.2px;
  text-align: center;
  padding: 16px 0;
  border-bottom: 2px solid rgba(79, 140, 255, 0.1);
}

.sidebar-logo {
  font-family: 'Inter', 'Roboto', Arial, sans-serif;
  color: var(--blue-pastel);
  background: linear-gradient(135deg, var(--blue-pastel), #4f8cff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(79, 140, 255, 0.1);
}

.dot {
  color: #4f8cff;
  font-weight: 900;
  text-shadow: 0 0 10px rgba(79, 140, 255, 0.3);
}

.sidebar-menu {
  flex: 1;
}

.sidebar-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-menu li {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 1.1rem;
  font-weight: 500;
  color: #4f5d75;
  padding: 16px 20px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(79, 140, 255, 0.05);
}

.sidebar-menu li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  background: linear-gradient(135deg, var(--blue-pastel), #4f8cff);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0 16px 16px 0;
}

.sidebar-menu li:hover::before {
  width: 4px;
}

.sidebar-menu li.active::before {
  width: 4px;
}

.sidebar-menu li:hover {
  background: linear-gradient(135deg, rgba(79, 140, 255, 0.08), rgba(79, 140, 255, 0.12));
  color: var(--blue-pastel);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(79, 140, 255, 0.15);
  border-color: rgba(79, 140, 255, 0.2);
}

.sidebar-menu li.active {
  background: linear-gradient(135deg, var(--blue-pastel-light), rgba(79, 140, 255, 0.15));
  color: var(--blue-pastel);
  font-weight: 600;
  transform: translateX(4px);
  box-shadow: 0 6px 16px rgba(79, 140, 255, 0.2);
  border-color: rgba(79, 140, 255, 0.3);
}

.sidebar-menu li i {
  font-size: 1.2rem;
  width: 20px;
  text-align: center;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-menu li:hover i,
.sidebar-menu li.active i {
  transform: scale(1.1);
}
</style>