<template>
  <div class="clock-bar">
    <span class="clock">🕑 {{ simulationTime }}</span>
    <input 
      type="number" 
      v-model.number="minutesToAdvance" 
      class="advance-input" 
      min="1" 
      placeholder="Minutos" 
      style="width: 80px; padding: 4px; border-radius: 4px; border: 1px solid #ccc; background: #242424; color: #fff;"
    />
    <button class="btn-clock" @click="advanceTime" :disabled="loading || minutesToAdvance < 1">
      Avançar
    </button>
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

const minutesToAdvance = ref(1);
const loading = ref(false);

const advanceTime = async () => {
  if (minutesToAdvance.value < 1) return;
  
  loading.value = true;
  try {
    const { data } = await api.post('/market/advance-time', { minutes: minutesToAdvance.value });
    emit('time-advanced', data.data.simulationTime);
  } catch (err) {
    emit('error', err.response?.data?.message || 'Erro ao avançar relógio.');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.advance-input {
  margin: 0 10px;
}
</style>
