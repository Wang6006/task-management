<template>
  <div class="app-container">
    <!-- Header -->
    <div class="app-header login-header">
      <div class="header-left">
        <span class="header-title">
          <i class="fas fa-seedling me-2"></i>
          Personal Growth
        </span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div class="login-container">
        <div class="login-card">
          <div class="welcome-section">
            <h1>{{ greeting }}</h1>
            <p class="subtitle">Đăng nhập để tiếp tục với task management</p>
          </div>

          <form @submit.prevent="handleLogin" class="login-form">
            <div class="input-group">
              <label for="username">Tên đăng nhập</label>
              <input id="username" v-model="username" type="text" placeholder="Nhập tên đăng nhập..." required />
            </div>

            <div class="input-group">
              <label for="password">Mật khẩu</label>
              <input id="password" v-model="password" type="password" placeholder="Nhập mật khẩu..." required />
            </div>

            <button type="submit" class="login-button">
              <span>Đăng nhập</span>
            </button>

            <AlertMessage v-if="error" :message="error" class="error-message" />
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AlertMessage from '@/components/AlertMessage.vue' // you already have this component
import usersService from '@/services/users.service.js' // adjust this if needed
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref('')
const greeting = ref('WELCOME BACK!')

const handleLogin = async () => {
  try {
    error.value = '';

    const res = await usersService.loginUser({
      username: username.value,
      password: password.value
    });


    localStorage.setItem('token', res.token);
    localStorage.setItem('role', res.role);
    localStorage.setItem('userId', res.userId);
    localStorage.setItem('username', res.username || username.value); // optional

    greeting.value = `Xin chào, ${res.username || username.value}!`;
    alert('Login successful');

    // Redirect by role
    if (res.role === 'admin') {
      router.push('/');
    } else {
      router.push('/homepage');
    }
  } catch (e) {
    error.value = 'Invalid credentials';
    console.error('Login failed:', e);
  }
};
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--blue-pastel) 0%, var(--blue-pastel-accent) 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app-header.login-header {
  display: flex;
  align-items: center;
  background: var(--blue-pastel);
  color: #fff;
  padding: 0 32px;
  height: 64px;
  border-radius: 0 0 var(--radius) var(--radius);
  box-shadow: var(--shadow);
  font-family: var(--font-main);
  margin-bottom: 0;
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

.main-content {
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px);
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 500px;
  width: 100%;
  margin: 0 auto;
}

.login-card {
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.welcome-section {
  margin-bottom: 2rem;
}

.welcome-section h1 {
  color: #2d3748;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #718096;
  font-size: 1rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  color: #4a5568;
  font-weight: 500;
  font-size: 0.9rem;
}

.input-group input {
  padding: 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.8);
}

.input-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: rgba(255, 255, 255, 1);
}

.input-group input::placeholder {
  color: #a0aec0;
}

.login-button {
  background: var(--blue-pastel);
  color: #fff;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
  box-shadow: 0 2px 8px #3b82f610;
}

.login-button:hover {
  background: var(--blue-pastel-accent);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px #3b82f620;
}

.login-button:active {
  background: var(--blue-pastel);
  color: #fff;
  transform: translateY(0);
}

.error-message {
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .login-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .login-card {
    padding: 2rem 1.5rem;
  }

  .welcome-section h1 {
    font-size: 1.5rem;
  }
}
</style>