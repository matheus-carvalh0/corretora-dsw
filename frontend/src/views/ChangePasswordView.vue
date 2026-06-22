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
      <div class="page-header">
        <RouterLink to="/account" class="back-link">← Voltar para Conta</RouterLink>
        <h2>Trocar Senha</h2>
      </div>

      <div class="section-card">
        <form @submit.prevent="handleChange">
          <label>Senha atual
            <input v-model="form.currentPassword" type="password" required placeholder="Digite sua senha atual" />
          </label>
          <label>Nova senha
            <input v-model="form.newPassword" type="password" required placeholder="Mínimo 6 caracteres" minlength="6" />
          </label>
          <label>Confirmar nova senha
            <input v-model="form.confirmPassword" type="password" required placeholder="Repita a nova senha" minlength="6" />
          </label>

          <p v-if="error" class="error">{{ error }}</p>
          <p v-if="successMsg" class="success">{{ successMsg }}</p>

          <div class="form-actions">
            <button type="submit" :disabled="loading">
              {{ loading ? 'Alterando...' : 'Alterar senha' }}
            </button>
            <RouterLink to="/account">
              <button type="button" class="btn-secondary">Cancelar</button>
            </RouterLink>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';
import BrandMark from '../components/BrandMark.vue';

const router = useRouter();
const auth   = useAuthStore();

const form       = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' });
const loading    = ref(false);
const error      = ref('');
const successMsg = ref('');

const handleChange = async () => {
  error.value      = '';
  successMsg.value = '';

  if (form.newPassword !== form.confirmPassword) {
    error.value = 'As senhas não coincidem.';
    return;
  }
  if (form.newPassword.length < 6) {
    error.value = 'A nova senha deve ter no mínimo 6 caracteres.';
    return;
  }

  loading.value = true;
  try {
    const { data } = await api.post('/auth/change-password', {
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    });
    successMsg.value = data.message || 'Senha alterada com sucesso!';
    form.currentPassword = '';
    form.newPassword     = '';
    form.confirmPassword = '';
  } catch (err) {
    error.value = err.response?.data?.message || 'Erro ao alterar senha.';
  } finally {
    loading.value = false;
  }
};

const handleLogout = async () => {
  await auth.logout();
  router.push({ name: 'Login' });
};
</script>
