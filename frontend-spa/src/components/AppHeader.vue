<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('userId')
  router.push('/login')
}
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <span class="header-title">
        <i class="fas fa-seedling me-2"></i>
        Personal Growth
      </span>
    </div>
    <div class="header-right">
      <button class="header-btn logout-btn" @click="logout">
        <i class="fas fa-sign-out-alt"></i> Đăng xuất
      </button>
    </div>
  </header>
</template>

<style scoped>
:root {
  --main-bg: #f5faff;
  --main-text: #222;
  /* ... */
}

.dark {
  --main-bg: #181a20;
  --main-text: #f5faff;
  /* ... */
}

body,
#app {
  background: var(--main-bg);
  color: var(--main-text);
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--blue-pastel);
  color: #fff;
  padding: 0 32px;
  height: 64px;
  border-radius: 0 0 var(--radius) var(--radius);
  box-shadow: var(--shadow);
  font-family: var(--font-main);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 32px;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-nav {
  display: flex;
  gap: 18px;
}

.header-link {
  color: #e3f0ff;
  font-size: 1.08rem;
  font-weight: 500;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  transition: background 0.2s, color 0.2s;
  display: flex;
  align-items: center;
}

.header-link.router-link-active,
.header-link:hover {
  background: #fff;
  color: var(--blue-pastel);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 18px;
}

.header-search input {
  background: #fff;
  border: none;
  border-radius: 8px;
  padding: 7px 16px;
  font-size: 1rem;
  color: #333;
  min-width: 220px;
  box-shadow: 0 2px 8px #3b82f610;
  outline: none;
  transition: box-shadow 0.2s;
}

.header-search input:focus {
  box-shadow: 0 4px 16px #3b82f620;
}

.header-btn {
  background: #fff;
  color: var(--blue-pastel);
  border: none;
  border-radius: 8px;
  padding: 7px 14px;
  font-size: 1.1rem;
  margin-left: 4px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px #3b82f610;
}

.header-btn:hover {
  background: var(--blue-pastel-accent);
  color: #fff;
}

.user-menu {
  position: relative;
}

.user-btn {
  font-weight: 600;
  font-size: 1rem;
}

.logout-btn {
  background: #fff;
  color: var(--blue-pastel);
  border: none;
  border-radius: 8px;
  padding: 7px 14px;
  font-size: 1.1rem;
  margin-left: 4px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px #3b82f610;
}

.logout-btn:hover {
  background: var(--blue-pastel-accent);
  color: #fff;
}
</style>
