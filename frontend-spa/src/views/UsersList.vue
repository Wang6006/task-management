<script setup>
import { ref, onMounted } from 'vue';
import usersService from '@/services/users.service'

const users = ref([]);
const selectedUser = ref(null);

async function loadUsers() {
  try {
    users.value = await usersService.fetchUsers();
  } catch (error) {
    console.log(error);
  }
}

function selectUser(user) {
  selectedUser.value = user;
}
async function generateAccount() {
  try {
    const newUser = await usersService.createUser({
      username: `user${Date.now()}`,
      email: `user${Date.now()}@example.com`,
      password: 'default123',
      role: 'user',
    });
    users.value.push(newUser);
    selectedUser.value = newUser;
  } catch (error) {
    console.error('Failed to generate user:', error);
  }
}
onMounted(loadUsers);
</script>

<template>
  <div class="users-page">
    <div class="users-list-panel">
      <button class="generate-btn" @click="generateAccount">
        Tạo tài khoản mới
      </button>
      <h2 class="users-title">
        Danh sách Users
        <i class="fas fa-users"></i>
      </h2>
      <div class="users-list">
        <div v-for="user in users" :key="user.userId" class="user-row"
          :class="{ selected: selectedUser?.userId === user.userId }" @click="selectUser(user)">
          <i class="fas fa-user user-icon"></i>
          <span class="user-name">{{ user.username }}</span>
          <span class="user-email">{{ user.email }}</span>
          <span class="user-role">{{ user.role }}</span>
        </div>
      </div>
      <p v-if="users.length === 0" class="no-users">
        Không có user nào.
      </p>
    </div>
    <div class="user-detail-panel">
      <div v-if="selectedUser" class="user-detail-card">
        <h3 class="detail-title">
          Chi tiết User
          <i class="fas fa-user-circle"></i>
        </h3>
        <div class="detail-body">
          <div class="detail-row">
            <span class="detail-label">Tên:</span>
            <span class="detail-value">{{ selectedUser.username }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Email:</span>
            <span class="detail-value">{{ selectedUser.email }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Role:</span>
            <span class="detail-value user-role">{{ selectedUser.role }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.users-page {
  display: flex;
  gap: 0;
  justify-content: flex-start;
  align-items: flex-start;
  background: #f3f7fb;
  min-height: 100vh;
  padding: 0 0 0 0;
}

.users-list-panel {
  flex: 1 1 340px;
  min-width: 320px;
  padding: 48px 0 0 0;
}

.users-title {
  color: #347ae2;
  font-weight: 700;
  font-size: 2rem;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 12px 0;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  background: transparent;
}

.user-row.selected,
.user-row:hover {
  background: #eaf2fb;
}

.user-icon {
  color: #347ae2;
  font-size: 1.2rem;
}

.user-name {
  font-weight: 600;
  color: #347ae2;
  font-size: 1.08rem;
}

.user-email {
  color: #7b8ca6;
  font-size: 0.97rem;
}

.user-role {
  background: #5b9eff;
  color: #fff;
  border-radius: 8px;
  padding: 3px 12px;
  font-size: 0.95rem;
  font-weight: 500;
}

.no-users {
  color: #b0b8c9;
  margin-top: 18px;
  text-align: left;
  font-size: 1.1rem;
}

.user-detail-panel {
  flex: 1 1 340px;
  min-width: 320px;
  padding: 48px 0 0 0;
}

.user-detail-card {
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
}

.detail-title {
  color: #347ae2;
  font-weight: 700;
  font-size: 1.3rem;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detail-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.detail-label {
  color: #7b8ca6;
  font-weight: 500;
  min-width: 60px;
}

.detail-value {
  color: #347ae2;
  font-weight: 600;
}

.no-detail {
  color: #b0b8c9;
  margin-top: 32px;
  text-align: left;
  font-size: 1.1rem;
}

.generate-btn {
  background: #347ae2;
  color: #fff;
  padding: 10px 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 20px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.generate-btn:hover {
  background: #2a65c7;
}

@media (max-width: 900px) {
  .users-page {
    flex-direction: column;
    gap: 0;
    padding: 0;
  }

  .users-list-panel,
  .user-detail-panel {
    min-width: 0;
    width: 100%;
    padding: 24px 0 0 0;
  }

}
</style>