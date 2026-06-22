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
                <th>Status</th>
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
                <td>
                  <span class="badge pending">Pendente</span>
                </td>
                <td>{{ order.quantity }}</td>
                <td>R$ {{ fmt(order.limitPrice) }}</td>
                <td>{{ formatTime(order.createdAt) }}</td>
                <td>
                  <button v-if="order.status === 'PENDING'" class="btn-sm btn-del" @click="confirmCancel(order)">Cancelar</button>
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

      <!-- Modal de Confirmação de Cancelamento -->
      <div v-if="orderToCancel" class="modal-overlay" @click.self="orderToCancel = null">
        <div class="modal">
          <h3>Cancelar Ordem</h3>
          <p>Deseja realmente cancelar a ordem de <strong>{{ orderToCancel.type === 'BUY' ? 'Compra' : 'Venda' }}</strong> de {{ orderToCancel.quantity }}x {{ orderToCancel.ticker }}?</p>
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="orderToCancel = null">Voltar</button>
            <button class="btn btn-del" @click="executeCancel" :disabled="loading">Sim, Cancelar</button>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import api from '../services/api';
import Topbar from '../components/Topbar.vue';
import { useToast } from '../composables/useToast';

const toast = useToast();

const activeTab = ref('pending');
const pendingOrders = ref([]);
const historyOrders = ref([]);
const loading = ref(false);
const error = ref('');

const orderToCancel = ref(null);

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
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
};

const confirmCancel = (order) => {
  orderToCancel.value = order;
};

const executeCancel = async () => {
  if (!orderToCancel.value) return;
  loading.value = true;
  try {
    await api.delete(`/orders/${orderToCancel.value.id}`);
    toast.success(`Ordem de ${orderToCancel.value.ticker} cancelada com sucesso.`);
    orderToCancel.value = null;
    await fetchOrders();
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erro ao cancelar ordem.');
  } finally {
    loading.value = false;
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
  padding: 0.35rem 0.6rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: bold;
}
.badge.pending {
  background: rgba(241, 196, 15, 0.2);
  color: #f1c40f;
  border: 1px solid rgba(241, 196, 15, 0.5);
}
.badge.executed {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
  border: 1px solid rgba(46, 204, 113, 0.5);
}
.badge.cancelled {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.5);
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}
.modal {
  background: #1a1a2e;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
}
.modal h3 {
  margin-top: 0;
  color: #fff;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
