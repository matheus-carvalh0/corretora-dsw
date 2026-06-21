<template>
  <div class="page">
    <header class="topbar">
      <BrandMark />
      <nav>
        <RouterLink to="/market">Mercado</RouterLink>
        <RouterLink to="/portfolio">Carteira</RouterLink>
        <RouterLink to="/account">Conta</RouterLink>
      </nav>
      <button class="btn-logout" @click="handleLogout">Sair</button>
    </header>

    <main class="container">
      <div class="clock-bar">
        <span class="clock">🕑 {{ simulationTime }}</span>
        <button class="btn-clock" @click="advance(1)" :disabled="loading">+1 min</button>
        <button class="btn-clock" @click="advance(5)" :disabled="loading">+5 min</button>
        <button class="btn-add" @click="showAddModal = true">+ Adicionar ação</button>
      </div>

      <p v-if="error" class="error">{{ error }}</p>

      <div class="table-wrap" v-if="market.length">
      <table>
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Preço (R$)</th>
            <th>Variação R$</th>
            <th>Variação %</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in market" :key="item.ticker">
            <td><strong>{{ item.ticker }}</strong></td>
            <td>{{ fmt(item.current) }}</td>
            <td :class="item.nominalChange >= 0 ? 'pos' : 'neg'">
              {{ item.nominalChange >= 0 ? '+' : '' }}{{ fmt(item.nominalChange) }}
            </td>
            <td :class="item.percentChange >= 0 ? 'pos' : 'neg'">
              {{ item.percentChange >= 0 ? '+' : '' }}{{ item.percentChange.toFixed(2) }}%
            </td>
            <td>
              <button class="btn-sm btn-buy" @click="openBuy(item)">Comprar</button>
              <button class="btn-sm btn-del" @click="removeStock(item.ticker)">✕</button>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
      <p v-else-if="!loading">Nenhuma ação na sua lista.</p>

      <!-- Modal: adicionar ação -->
      <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
        <div class="modal">
          <h3>Adicionar ação</h3>
          <select v-model="selectedTicker">
            <option value="">Selecione...</option>
            <option v-for="t in availableTickers" :key="t.ticker" :value="t.ticker">
              {{ t.ticker }} — fechamento R$ {{ fmt(t.fechamento) }}
            </option>
          </select>
          <div class="modal-actions">
            <button @click="addStock" :disabled="!selectedTicker">Adicionar</button>
            <button class="btn-secondary" @click="showAddModal = false">Cancelar</button>
          </div>
        </div>
      </div>

      <!-- Modal: comprar ação -->
      <div v-if="buyModal.open" class="modal-overlay" @click.self="buyModal.open = false">
        <div class="modal">
          <h3>Comprar {{ buyModal.ticker }}</h3>
          <p>Preço atual: <strong>R$ {{ fmt(buyModal.price) }}</strong></p>
          <label>Quantidade
            <input v-model.number="buyModal.quantity" type="number" min="1" />
          </label>
          <label>Tipo de ordem
            <select v-model="buyModal.orderType">
              <option value="market">A preço de mercado</option>
              <option value="limit">Abaixo de (limite)</option>
            </select>
          </label>
          <label v-if="buyModal.orderType === 'limit'">Preço limite (R$)
            <input v-model.number="buyModal.limitPrice" type="number" step="0.01" min="0.01" />
          </label>
          <p v-if="buyModal.orderType === 'market'">
            Total estimado: <strong>R$ {{ fmt(buyModal.quantity * buyModal.price) }}</strong>
          </p>
          <div class="modal-actions">
            <button @click="confirmBuy">Confirmar compra</button>
            <button class="btn-secondary" @click="buyModal.open = false">Cancelar</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';
import BrandMark from '../components/BrandMark.vue';

const router = useRouter();
const auth   = useAuthStore();

const market         = ref([]);
const simulationTime = ref('14:00');
const loading        = ref(false);
const error          = ref('');
const showAddModal   = ref(false);
const allTickers     = ref([]);
const selectedTicker = ref('');

const buyModal = reactive({ open: false, ticker: '', price: 0, quantity: 1, orderType: 'market', limitPrice: null });

// Tickers não presentes na watchlist atual
const availableTickers = computed(() =>
  allTickers.value.filter((t) => !market.value.find((m) => m.ticker === t.ticker))
);

const fmt = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fetchMarket = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/market');
    market.value         = data.data.market;
    simulationTime.value = data.data.simulationTime;
  } catch (err) {
    error.value = err.response?.data?.message || 'Erro ao carregar mercado.';
  } finally {
    loading.value = false;
  }
};

const fetchTickers = async () => {
  const { data } = await api.get('/market/tickers');
  allTickers.value = data.data.tickers;
};

const advance = async (minutes) => {
  loading.value = true;
  try {
    const endpoint = minutes === 1 ? '/market/advance-minute' : '/market/advance-five-minutes';
    const { data } = await api.post(endpoint);
    market.value         = data.data.market;
    simulationTime.value = data.data.simulationTime;
  } catch (err) {
    error.value = err.response?.data?.message || 'Erro ao avançar relógio.';
  } finally {
    loading.value = false;
  }
};

const addStock = async () => {
  try {
    await api.post('/stocks', { ticker: selectedTicker.value });
    showAddModal.value   = false;
    selectedTicker.value = '';
    await fetchMarket();
  } catch (err) {
    alert(err.response?.data?.message || 'Erro ao adicionar ação.');
  }
};

const removeStock = async (ticker) => {
  if (!confirm(`Remover ${ticker} da lista?`)) return;
  try {
    await api.delete(`/stocks/${ticker}`);
    await fetchMarket();
  } catch (err) {
    alert(err.response?.data?.message || 'Erro ao remover ação.');
  }
};

const openBuy = (item) => {
  Object.assign(buyModal, { open: true, ticker: item.ticker, price: item.current, quantity: 1, orderType: 'market', limitPrice: null });
};

const confirmBuy = async () => {
  try {
    await api.post('/portfolio/buy', {
      ticker: buyModal.ticker,
      quantity: buyModal.quantity,
      limitPrice: buyModal.orderType === 'limit' ? buyModal.limitPrice : null,
    });
    buyModal.open = false;
    alert('Ordem de compra enviada!');
  } catch (err) {
    alert(err.response?.data?.message || 'Erro na compra.');
  }
};

const handleLogout = async () => {
  await auth.logout();
  router.push({ name: 'Login' });
};

onMounted(async () => {
  await fetchMarket();
  await fetchTickers();
});
</script>
