<template>
  <div class="clock-bar">
    <div class="clock-container">
      <div class="clock-display">{{ simulationTime }} hr</div>
      <button class="btn-clock" @click="advanceTime(1)" :disabled="loading">
        + 1 min
      </button>
      <button class="btn-clock" @click="advanceTime(5)" :disabled="loading">
        + 5 min
      </button>
      
      <!-- Opcional (input livre) -->
      <input 
        type="number" 
        v-model.number="customMinutes" 
        class="advance-input" 
        min="1" 
        placeholder="Minutos" 
      />
      <button class="btn-clock-alt" @click="advanceTime(customMinutes)" :disabled="loading || customMinutes < 1">
        Avançar
      </button>
    </div>
    <slot></slot>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '../services/api';

const props = defineProps({
  simulationTime: {
    type: String,
    required: true,
  }
});

const emit = defineEmits(['time-advanced', 'error']);

const customMinutes = ref(1);
const loading = ref(false);

const advanceTime = async (mins) => {
  if (mins < 1) return;
  
  loading.value = true;
  try {
    const { data } = await api.post('/market/advance-time', { minutes: mins });
    emit('time-advanced', data.data.simulationTime, data.data.executedCount);
  } catch (err) {
    emit('error', err.response?.data?.message || 'Erro ao avançar relógio.');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.clock-container {
  display: flex;
  align-items: center;
  background: #f0f0f0;
  border: 1px solid #000;
  border-radius: 4px;
  overflow: hidden;
  color: #000;
}
.clock-display {
  padding: 0.5rem 1rem;
  font-weight: bold;
  background: #fff;
  border-right: 1px solid #000;
  font-size: 1.1rem;
}
.btn-clock {
  background: #e0e0e0;
  color: #000;
  border: none;
  border-right: 1px solid #000;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  text-decoration: underline;
}
.btn-clock:hover:not(:disabled) {
  background: #d0d0d0;
}
.btn-clock:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  text-decoration: none;
}
.advance-input {
  width: 60px;
  padding: 0.4rem;
  border: none;
  border-right: 1px solid #000;
  background: #e0e0e0;
  color: #000;
  text-align: center;
}
.btn-clock-alt {
  background: #e0e0e0;
  color: #000;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
}
.btn-clock-alt:hover:not(:disabled) {
  background: #d0d0d0;
}
</style>
