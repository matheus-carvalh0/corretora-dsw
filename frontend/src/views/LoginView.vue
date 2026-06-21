<template>
  <div class="auth-page">
    <div class="auth-card">
      <BrandMark class="brand-lg" />
      <h2>Entrar</h2>
      <form @submit.prevent="handleLogin">
        <label>E-mail
          <input v-model="form.email" type="email" required placeholder="seu@email.com" />
        </label>
        <label>Senha
          <input v-model="form.password" type="password" required placeholder="••••••" />
        </label>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
      <p>Não tem conta? <RouterLink to="/register">Cadastre-se</RouterLink></p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import BrandMark from '../components/BrandMark.vue';

const router = useRouter();
const auth   = useAuthStore();

const form    = reactive({ email: '', password: '' });
const loading = ref(false);
const error   = ref('');

const handleLogin = async () => {
  loading.value = true;
  error.value   = '';
  try {
    await auth.login(form);
    router.push({ name: 'Market' });
  } catch (err) {
    error.value = err.response?.data?.message || 'Erro ao fazer login.';
  } finally {
    loading.value = false;
  }
};
</script>
