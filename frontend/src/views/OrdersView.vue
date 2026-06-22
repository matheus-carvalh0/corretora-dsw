<template>
  <div class="page">
    <Topbar />

    <main class="container">
      <h2>Ordens</h2>
      
      <p v-if="error" class="error">{{ error }}</p>

      <div class="tabs">
        <button 
          :class="['tab-btn', { active: activeTab === 'pending' }]" 
          @click="activeTab = 'pending'">
          Pendentes
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'history' }]" 
          @click="activeTab = 'history'">
          Histórico
        </button>
      </div>

      <div v-if="activeTab === 'pending'">
        <h3>Ordens Condicionais Pendentes</h3>
        <div class="table-wrap" v-if="pendingOrders.length">
          <table>
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Tipo</th>
                <th>Quantidade</th>
                <th>Preço Limite</th>
                <th>Criado em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in pendingOrders" :key="order.id">
                <td><strong>{{ order.ticker }}</strong></td>
                <td :class="order.type === 'BUY' ? 'pos' : 'neg'">
                  {{ order.type === 'BUY' ? 'Compra' : 'Venda' }}
                </td>
                <td>{{ order.quantity }}</td>
                <td>R$ {{ fmt(order.limitPrice) }}</td>
                <td>{{ formatTime(order.createdAt) }}</td>
                <td>
                  <button class="btn-sm btn-del" @click="cancel(order.id)">Cancelar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else-if="!loading">Nenhuma ordem pendente.</p>
      </div>

      <div v-if="activeTab === 'history'">
        <h3>Histórico de Ordens</h3>
        <div class="table-wrap" v-if="historyOrders.length">
          <table>
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Quantidade</th>
                <th>Preço Executado</th>
                <th>Minuto Execução</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in historyOrders" :key="order.id">
                <td><strong>{{ order.ticker }}</strong></td>
                <td :class="order.type === 'BUY' ? 'pos' : 'neg'">
                  {{ order.type === 'BUY' ? 'Compra' : 'Venda' }}
                </td>
                <td>
                  <span :class="['badge', order.status.toLowerCase()]">
                    {{ order.status === 'EXECUTED' ? 'Executada' : 'Cancelada' }}
                  </span>
                </td>
                <td>{{ order.quantity }}</td>
                <td>{{ order.executedPrice ? 'R$ ' + fmt(order.executedPrice) : '-' }}</td>
                <td>{{ order.status === 'EXECUTED' ? order.simulationMinute : '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else-if="!loading">Nenhum histórico de ordens.</p>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import api from '../services/api';
import Topbar from '../components/Topbar.vue';

const activeTab = ref('pending');
const pendingOrders = ref([]);
const historyOrders = ref([]);
const loading = ref(false);
const error = ref('');

const fmt = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatTime = (isoString) => {
  const d = new Date(isoString);
  return d.toLocaleString('pt-BR');
};

const fetchOrders = async () => {
  loading.value = true;
  error.value = '';
  try {
    if (activeTab.value === 'pending') {
      const { data } = await api.get('/orders');
      pendingOrders.value = data.data.orders;
    } else {
      const { data } = await api.get('/orders/history');
      historyOrders.value = data.data.orders;
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Erro ao carregar ordens.';
  } finally {
    loading.value = false;
  }
};

const cancel = async (id) => {
  if (!confirm('Deseja realmente cancelar esta ordem?')) return;
  try {
    await api.delete(`/orders/${id}`);
    await fetchOrders();
  } catch (err) {
    alert(err.response?.data?.message || 'Erro ao cancelar ordem.');
  }
};

watch(activeTab, fetchOrders);
onMounted(fetchOrders);
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #333;
}
.tab-btn {
  background: none;
  border: none;
  color: #ccc;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}
.tab-btn:hover {
  color: #fff;
}
.tab-btn.active {
  color: #646cff;
  border-bottom-color: #646cff;
}
.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: bold;
}
.badge.executed {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
}
.badge.cancelled {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}
</style>
