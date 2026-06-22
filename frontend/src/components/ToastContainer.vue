<template>
  <div class="toast-container">
    <transition-group name="toast">
      <div 
        v-for="toast in toasts" 
        :key="toast.id" 
        :class="['toast', `toast-${toast.type}`]"
      >
        <span class="toast-icon">
          <template v-if="toast.type === 'success'">✅</template>
          <template v-else-if="toast.type === 'error'">🚨</template>
          <template v-else>ℹ️</template>
        </span>
        <span class="toast-msg">{{ toast.message }}</span>
        <button class="toast-close" @click="removeToast(toast.id)">✕</button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToast } from '../composables/useToast';
const { toasts, removeToast } = useToast();
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  z-index: 9999;
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  background: #1a2a3d;
  color: #eceae1;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  border-left: 4px solid transparent;
  min-width: 250px;
  max-width: 350px;
}

.toast-success {
  border-color: #2ecc71;
  background: linear-gradient(90deg, rgba(46, 204, 113, 0.1) 0%, rgba(26, 42, 61, 1) 20%);
}

.toast-error {
  border-color: #e74c3c;
  background: linear-gradient(90deg, rgba(231, 76, 60, 0.1) 0%, rgba(26, 42, 61, 1) 20%);
}

.toast-info {
  border-color: #3498db;
}

.toast-icon {
  font-size: 1.25rem;
}

.toast-msg {
  flex: 1;
  font-size: 0.95rem;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  color: #6e7e92;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0;
  margin-left: 0.5rem;
}

.toast-close:hover {
  color: #fff;
}

/* Animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}
</style>
