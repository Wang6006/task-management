<template>
  <transition name="fade">
    <div v-if="show" class="alert-message" :class="type">
      <span class="icon">
        <i v-if="type==='success'" class="fas fa-check-circle"></i>
        <i v-else-if="type==='error'" class="fas fa-exclamation-circle"></i>
        <i v-else-if="type==='warning'" class="fas fa-exclamation-triangle"></i>
        <i v-else class="fas fa-info-circle"></i>
      </span>
      <span class="msg-text">{{ message }}</span>
      <button @click="close" class="close-btn">&times;</button>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    message: String,
    type: {
      type: String,
      default: 'info', // 'success', 'warning', 'error'
      validator: value => ['info', 'success', 'warning', 'error'].includes(value)
    },
    duration: {
      type: Number,
      default: 4000
    }
  },
  data() {
    return {
      show: false
    }
  },
  mounted() {
    this.show = true
    if (this.duration > 0) {
      setTimeout(() => {
        this.close()
      }, this.duration)
    }
  },
  methods: {
    close() {
      this.show = false
      setTimeout(() => {
        this.$emit('close')
      }, 300)
    }
  }
}
</script>

<style scoped>
.alert-message {
  position: fixed;
  top: 32px;
  right: 32px;
  min-width: 320px;
  max-width: 400px;
  padding: 18px 24px;
  border-radius: 16px;
  box-shadow: 0 4px 24px #3b82f620;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 1.08rem;
  font-weight: 500;
  background: #e3f0ff;
  color: var(--blue-pastel);
  border-left: 6px solid var(--blue-pastel);
  transition: all 0.3s;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
.icon {
  font-size: 1.4rem;
  margin-right: 6px;
}
.close-btn {
  margin-left: auto;
  background: transparent;
  border: none;
  color: #b3d8fd;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.2s;
}
.close-btn:hover {
  color: #ff4d4f;
}
.success {
  background: #f6ffed;
  color: #389e0d;
  border-left-color: #52c41a;
}
.error {
  background: #fff2f0;
  color: #ff4d4f;
  border-left-color: #ff4d4f;
}
.warning {
  background: #fffbe6;
  color: #faad14;
  border-left-color: #faad14;
}
.info {
  background: #e6f7ff;
  color: #1890ff;
  border-left-color: #1890ff;
}
</style>