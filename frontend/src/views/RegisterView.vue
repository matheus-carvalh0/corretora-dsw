<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>📈 Corretora DSW</h1>
      <h2>Cadastro</h2>
      <form @submit.prevent="handleRegister">
        <label>Nome
          <input v-model="form.name" type="text" required placeholder="Seu nome" />
        </label>
        <label>E-mail
          <input v-model="form.email" type="email" required placeholder="seu@email.com" />
        </label>
        <label>Senha
          <input v-model="form.password" type="password" required placeholder="Mínimo 6 caracteres" />
        </label>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" :disabled="loading">
          {{ loading ? 'Cadastrando...' : 'Cadastrar' }}
        </button>
      </form>
      <p>Já tem conta? <RouterLink to="/login">Entrar</RouterLink></p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth   = useAuthStore();

const form    = reactive({ name: '', email: '', password: '' });
const loading = ref(false);
const error   = ref('');

const handleRegister = async () => {
  loading.value = true;
  error.value   = '';
  try {
    await auth.register(form);
    router.push({ name: 'Market' });
  } catch (err) {
    error.value = err.response?.data?.message || 'Erro ao cadastrar.';
  } finally {
    loading.value = false;
  }
};
</script>
