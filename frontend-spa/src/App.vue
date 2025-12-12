<script setup>
import AppHeader from '@/components/AppHeader.vue'
import Sidebar from '@/components/Sidebar.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

</script>
<template>
  <div id="app" class="app-bg">
    <AppHeader v-if="route.path !== '/login'" />
    <div class="main-layout">
      <Sidebar v-if="!['/login', '/homepage'].includes(route.path)" />
      <div class="main-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style>
:root {
  --blue-pastel: #3b82f6;
  --blue-pastel-light: #e3f0ff;
  --blue-pastel-bg: #f5faff;
  --blue-pastel-accent: #b3d8fd;
  --sidebar-width: 250px;
  --radius: 18px;
  --shadow: 0 4px 24px rgba(59, 130, 246, 0.08);
  --font-main: 'Inter', 'Roboto', Arial, sans-serif;
}

body,
#app {
  font-family: var(--font-main);
  background: var(--blue-pastel-bg);
  min-height: 100vh;
  margin: 0;
}

.app-bg {
  min-height: 100vh;
  background: var(--blue-pastel-bg);
}

.main-layout {
  display: flex;
  min-height: calc(100vh - 64px);
}

.main-content {
  flex: 1;
  padding: 32px 32px 32px 0;
  background: var(--blue-pastel-bg);
  min-height: 100vh;
}

@media (max-width: 900px) {
  .main-layout {
    flex-direction: column;
  }

  .main-content {
    padding: 16px;
  }
}
</style>