<template>
  <div class="spinner-container">
    <div class="spinner"></div>
    <p class="spinner-message">{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({
  message: { type: String, default: 'Đang tải...' }
});
</script>

<style scoped>
.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120px;
}
.spinner {
  width: 48px;
  height: 48px;
  border: 5px solid #e3f0ff;
  border-top: 5px solid #5b9eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  box-shadow: 0 2px 12px 0 rgba(91, 158, 255, 0.15);
  background: white;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.spinner-message {
  margin-top: 16px;
  color: #5b9eff;
  font-size: 1.1rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  text-align: center;
}
</style>