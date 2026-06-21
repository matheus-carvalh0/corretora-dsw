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
      <h2>Conta Corrente</h2>
      <p class="balance-info">Saldo atual: <strong>R$ {{ fmt(balance) }}</strong></p>

      <p v-if="error" class="error">{{ error }}</p>

      <div class="table-wrap" v-if="transactions.length">
      <table>
        <thead>
          <tr>
            <th>Horário</th>
            <th>Tipo</th>
            <th>Descrição</th>
            <th>Valor (R$)</th>
            <th>Saldo (R$)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tx in transactions" :key="tx.id">
            <td>{{ tx.simulationTime }}</td>
            <td :class="tx.type === 'DEPOSIT' ? 'pos' : 'neg'">
              {{ tx.type === 'DEPOSIT' ? 'Crédito' : 'Débito' }}
            </td>
            <td>{{ tx.description }}</td>
            <td :class="tx.type === 'DEPOSIT' ? 'pos' : 'neg'">
              {{ tx.type === 'DEPOSIT' ? '+' : '-' }}{{ fmt(tx.amount) }}
            </td>
            <td>{{ fmt(tx.balanceAfter) }}</td>
          </tr>
        </tbody>
      </table>
      </div>
      <p v-else-if="!loading">Nenhum lançamento ainda.</p>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';
import BrandMark from '../components/BrandMark.vue';

const router = useRouter();
const auth   = useAuthStore();

const transactions = ref([]);
const balance      = ref(0);
const loading      = ref(false);
const error        = ref('');

const fmt = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fetchAccount = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/account');
    transactions.value = data.data.transactions;
    balance.value      = data.data.balance;
  } catch (err) {
    error.value = err.response?.data?.message || 'Erro ao carregar extrato.';
  } finally {
    loading.value = false;
  }
};

const handleLogout = async () => {
  await auth.logout();
  router.push({ name: 'Login' });
};

onMounted(fetchAccount);
</script>
