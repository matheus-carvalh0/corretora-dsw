import { reactive } from 'vue';

const state = reactive({
  toasts: []
});

let toastId = 0;

export function useToast() {
  const addToast = (message, type = 'info', duration = 3000) => {
    const id = toastId++;
    state.toasts.push({ id, message, type });
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    const index = state.toasts.findIndex(t => t.id === id);
    if (index !== -1) state.toasts.splice(index, 1);
  };

  const success = (message, duration) => addToast(message, 'success', duration);
  const error = (message, duration) => addToast(message, 'error', duration);
  const info = (message, duration) => addToast(message, 'info', duration);

  return {
    toasts: state.toasts,
    success,
    error,
    info,
    removeToast
  };
}
