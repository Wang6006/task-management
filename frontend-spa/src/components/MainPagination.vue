<script setup>
import { computed } from 'vue';

const props = defineProps({
  totalPages: { type: Number, required: true },
  length: { type: Number, default: 3 },
  currentPage: { type: Number, default: 1 },
});

const $emit = defineEmits(['update:currentPage']);

const pages = computed(() => {
  const pages = [];
  
  const half = Math.floor(props.length / 2);
  let start = props.currentPage - half;
  let end = props.currentPage + half;
  
  if (start <= 0) {
    start = 1;
    end = props.length;
  }
  
  if (end > props.totalPages) {
    end = props.totalPages;
    start = end - props.length + 1;
    if (start <= 0) start = 1;
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
});
</script>

<template>
  <nav class="d-flex justify-content-center my-4">
    <ul class="pagination pagination-modern shadow-sm rounded-4">
      <li class="page-item" :class="{ disabled: currentPage === 1 }">
        <a role="button" class="page-link" @click.prevent="$emit('update:currentPage', currentPage - 1)">
          <i class="fas fa-angle-left"></i>
        </a>
      </li>
      <li
        v-for="page in pages"
        :key="page"
        class="page-item"
        :class="{ active: currentPage === page }"
      >
        <a role="button" class="page-link" @click.prevent="$emit('update:currentPage', page)">
          {{ page }}
        </a>
      </li>
      <li class="page-item" :class="{ disabled: currentPage === totalPages }">
        <a role="button" class="page-link" @click.prevent="$emit('update:currentPage', currentPage + 1)">
          <i class="fas fa-angle-right"></i>
        </a>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.pagination-modern {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 8px 18px;
  gap: 4px;
}
.page-link {
  color: var(--blue-pastel);
  font-weight: 600;
  font-size: 1.1rem;
  border-radius: 8px !important;
  border: none;
  margin: 0 2px;
  transition: background 0.2s, color 0.2s;
}
.page-link:focus {
  box-shadow: 0 0 0 2px #b3d8fd;
}
.page-item.active .page-link {
  background: var(--blue-pastel);
  color: #fff;
  border: none;
}
.page-item.disabled .page-link {
  color: #b3d8fd;
  background: #f5faff;
  pointer-events: none;
}
</style>