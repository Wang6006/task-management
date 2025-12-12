<script setup>
import { ref, watch, nextTick } from 'vue'

// Simple debounce function
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Tìm kiếm task theo tên, mô tả, người thực hiện...'
  }
})

const emit = defineEmits(['update:modelValue'])

const input = ref(null)
const internalValue = ref(props.modelValue)
const isFocused = ref(false)

// Watch for external changes to modelValue
watch(() => props.modelValue, (newVal) => {
  internalValue.value = newVal
})

// Debounced input handler
const debouncedInput = debounce(() => {
  emit('update:modelValue', internalValue.value)
}, 300)

const handleInput = () => {
  debouncedInput()
}

const clearSearch = () => {
  internalValue.value = ''
  emit('update:modelValue', '')
  nextTick(() => {
    input.value?.focus()
  })
}
</script>

<template>
  <div class="search-container">
    <div class="search-input-wrapper">
      <input
        ref="input"
        v-model="internalValue"
        type="text"
        :placeholder="placeholder"
        @input="handleInput"
        @focus="isFocused = true"
        @blur="isFocused = false"
        class="search-input"
      />
      <span class="search-icon" :class="{ 'focused': isFocused }">
        <i class="fas fa-search"></i>
      </span>
      <button v-if="internalValue" @click="clearSearch" class="clear-btn">
        &times;
      </button>
    </div>
  </div>
</template>

<style scoped>
.search-container {
  position: relative;
  margin: 12px 0 18px 0;
}
.search-input-wrapper {
  position: relative;
  max-width: 350px;
}
.search-input {
  width: 100%;
  padding: 12px 44px 12px 16px;
  border: 1.5px solid #b3d8fd;
  border-radius: 12px;
  font-size: 1.08rem;
  background: #f5faff;
  color: #333;
  box-shadow: 0 2px 8px #3b82f610;
  transition: border 0.2s, box-shadow 0.2s;
}
.search-input:focus {
  outline: none;
  border-color: var(--blue-pastel);
  box-shadow: 0 4px 16px #3b82f620;
}
.search-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #b3d8fd;
  font-size: 1.2rem;
  transition: color 0.2s;
}
.search-icon.focused {
  color: var(--blue-pastel);
}
.clear-btn {
  position: absolute;
  right: 38px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #b3d8fd;
  font-size: 20px;
  cursor: pointer;
  transition: color 0.2s;
}
.clear-btn:hover {
  color: #ff4d4f;
}
</style>
