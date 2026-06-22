<template>
  <div class="page">
    <Topbar />

    <main class="container">
      <h2>Conta Corrente</h2>
      <p class="balance-info">Saldo atual: <strong>R$ {{ fmt(balance) }}</strong></p>

      <div class="account-actions">
        <button class="btn-sm" @click="openDeposit">+ Depositar</button>
        <button class="btn-sm btn-del" @click="openWithdraw">- Sacar</button>
        <RouterLink to="/change-password">
          <button class="btn-secondary" style="margin-left: 1rem;">🔒 Trocar Senha</button>
        </RouterLink>
      </div>

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
      <!-- Modal: Depósito -->
      <div v-if="depositModal.open" class="modal-overlay" @click.self="depositModal.open = false">
        <div class="modal">
          <h3>Depósito</h3>
          <label>Valor (R$)
            <input v-model.number="depositModal.amount" type="number" step="0.01" min="0.01" />
          </label>
          <div class="modal-actions">
            <button @click="confirmDeposit" :disabled="depositModal.amount <= 0">Confirmar</button>
            <button class="btn-secondary" @click="depositModal.open = false">Cancelar</button>
          </div>
        </div>
      </div>

      <!-- Modal: Saque -->
      <div v-if="withdrawModal.open" class="modal-overlay" @click.self="withdrawModal.open = false">
        <div class="modal">
          <h3>Saque (Retirada)</h3>
          <p>Saldo disponível: <strong>R$ {{ fmt(balance) }}</strong></p>
          <label>Valor (R$)
            <input v-model.number="withdrawModal.amount" type="number" step="0.01" min="0.01" :max="balance" />
          </label>
          <div class="modal-actions">
            <button @click="confirmWithdraw" :disabled="withdrawModal.amount <= 0 || withdrawModal.amount > balance">Confirmar</button>
            <button class="btn-secondary" @click="withdrawModal.open = false">Cancelar</button>
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

const router = useRouter();

const transactions = ref([]);
const balance      = ref(0);
const loading      = ref(false);
const error        = ref('');

const depositModal = reactive({ open: false, amount: 0 });
const withdrawModal = reactive({ open: false, amount: 0 });

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

const openDeposit = () => {
  depositModal.amount = 0;
  depositModal.open = true;
};

const openWithdraw = () => {
  withdrawModal.amount = 0;
  withdrawModal.open = true;
};

const confirmDeposit = async () => {
  try {
    await api.post('/account/deposit', { amount: depositModal.amount, description: 'Depósito manual' });
    depositModal.open = false;
    await fetchAccount();
  } catch (err) {
    alert(err.response?.data?.message || 'Erro ao realizar depósito.');
  }
};

const confirmWithdraw = async () => {
  try {
    await api.post('/account/withdraw', { amount: withdrawModal.amount, description: 'Saque manual' });
    withdrawModal.open = false;
    await fetchAccount();
  } catch (err) {
    alert(err.response?.data?.message || 'Erro ao realizar saque.');
  }
};

onMounted(fetchAccount);
</script>
