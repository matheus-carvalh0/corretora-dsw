<template>
  <div class="page">
    <Topbar />

    <main class="container">
      <ClockBar 
        :simulationTime="simulationTime" 
        @time-advanced="handleTimeAdvanced"
        @error="handleClockError"
      />

      <div class="summary">
        <span>Saldo disponível: <strong>R$ {{ fmt(balance) }}</strong></span>
        <span :class="totalPnl >= 0 ? 'pos' : 'neg'">
          P&amp;L total: <strong>{{ totalPnl >= 0 ? '+' : '' }}R$ {{ fmt(totalPnl) }}</strong>
        </span>
      </div>

      <p v-if="error" class="error">{{ error }}</p>

      <div class="table-wrap" v-if="items.length">
      <table>
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Qtd</th>
            <th>Preço médio</th>
            <th>Preço atual</th>
            <th>P&amp;L (R$)</th>
            <th>P&amp;L (%)</th>
            <th>Histórico P&amp;L</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.ticker">
            <td><strong>{{ item.ticker }}</strong></td>
            <td>{{ item.quantity }}</td>
            <td>R$ {{ fmt(item.avgBuyPrice) }}</td>
            <td>R$ {{ fmt(item.currentPrice) }}</td>
            <td :class="item.pnl >= 0 ? 'pos' : 'neg'">
              {{ item.pnl >= 0 ? '+' : '' }}R$ {{ fmt(item.pnl) }}
            </td>
            <td :class="item.pnlPercent >= 0 ? 'pos' : 'neg'">
              {{ item.pnlPercent >= 0 ? '+' : '' }}{{ fmt(item.pnlPercent) }}%
            </td>
            <td :class="item.realizedPnl >= 0 ? 'pos' : 'neg'">
              {{ item.realizedPnl >= 0 ? '+' : '' }}R$ {{ fmt(item.realizedPnl) }}
            </td>
            <td>
              <button class="btn-sm btn-sell" @click="openSell(item)">Vender</button>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
      <p v-else-if="!loading">Carteira vazia. Compre ações no mercado!</p>

      <!-- Modal: vender ação -->
      <div v-if="sellModal.open" class="modal-overlay" @click.self="sellModal.open = false">
        <div class="modal">
          <h3>Vender {{ sellModal.ticker }}</h3>
          <p>Preço atual: <strong>R$ {{ fmt(sellModal.price) }}</strong></p>
          <p>Em carteira: <strong>{{ sellModal.maxQty }} ações</strong></p>
          <label>Quantidade
            <input v-model.number="sellModal.quantity" type="number" :max="sellModal.maxQty" min="1" />
          </label>
          <label>Tipo de ordem
            <select v-model="sellModal.orderType">
              <option value="market">A preço de mercado</option>
              <option value="limit">Acima de (limite)</option>
            </select>
          </label>
          <label v-if="sellModal.orderType === 'limit'">Preço limite (R$)
            <input v-model.number="sellModal.limitPrice" type="number" step="0.01" min="0.01" />
          </label>
          <div class="modal-actions">
            <button @click="confirmSell">Confirmar venda</button>
            <button class="btn-secondary" @click="sellModal.open = false">Cancelar</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import Topbar from '../components/Topbar.vue';
import ClockBar from '../components/ClockBar.vue';

const router = useRouter();

const items          = ref([]);
const totalPnl       = ref(0);
const balance        = ref(0);
const simulationTime = ref('14:00');
const loading        = ref(false);
const error          = ref('');

const sellModal = reactive({ open: false, ticker: '', price: 0, maxQty: 0, quantity: 1, orderType: 'market', limitPrice: null });

const fmt = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fetchPortfolio = async () => {
  loading.value = true;
  try {
    const [portRes, userRes] = await Promise.all([api.get('/portfolio'), api.get('/user/me')]);
    items.value          = portRes.data.data.items;
    totalPnl.value       = portRes.data.data.totalPnl;
    simulationTime.value = userRes.data.data.simulationTime;
    balance.value        = userRes.data.data.balance;
  } catch (err) {
    error.value = err.response?.data?.message || 'Erro ao carregar carteira.';
  } finally {
    loading.value = false;
  }
};

const handleTimeAdvanced = async (newTime) => {
  simulationTime.value = newTime;
  await fetchPortfolio();
};

const handleClockError = (msg) => {
  error.value = msg;
};

const openSell = (item) => {
  Object.assign(sellModal, { open: true, ticker: item.ticker, price: item.currentPrice, maxQty: item.quantity, quantity: 1, orderType: 'market', limitPrice: null });
};

const confirmSell = async () => {
  try {
    await api.post('/portfolio/sell', {
      ticker: sellModal.ticker,
      quantity: sellModal.quantity,
      limitPrice: sellModal.orderType === 'limit' ? sellModal.limitPrice : null,
    });
    sellModal.open = false;
    alert('Ordem de venda enviada!');
    await fetchPortfolio();
  } catch (err) {
    alert(err.response?.data?.message || 'Erro na venda.');
  }
};

onMounted(fetchPortfolio);
</script>
