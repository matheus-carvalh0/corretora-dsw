<template>
  <div class="auth-page">
    <div class="auth-card">
      <BrandMark class="brand-lg" />
      <h2>Recuperar Senha</h2>

      <!-- Etapa 1: Solicitar e-mail -->
      <div v-if="step === 1">
        <p class="step-indicator">Etapa 1 de 2 — Informe seu e-mail</p>
        <form @submit.prevent="handleForgot">
          <label>E-mail
            <input v-model="emailForm.email" type="email" required placeholder="seu@email.com" />
          </label>
          <p v-if="error" class="error">{{ error }}</p>
          <button type="submit" :disabled="loading">
            {{ loading ? 'Enviando...' : 'Enviar código' }}
          </button>
        </form>
      </div>

      <!-- Etapa 2: Token + Nova senha -->
      <div v-if="step === 2">
        <p class="step-indicator">Etapa 2 de 2 — Redefina sua senha</p>
        <div class="success">
          Enviamos um código de recuperação para <strong>{{ emailForm.email }}</strong>. Verifique sua caixa de entrada (e spam).
        </div>
        <form @submit.prevent="handleReset">
          <label>Código de recuperação
            <input v-model="resetForm.resetToken" type="text" required placeholder="Cole o código recebido por e-mail" />
          </label>
          <label>Nova senha
            <input v-model="resetForm.newPassword" type="password" required placeholder="Mínimo 6 caracteres" minlength="6" />
          </label>
          <label>Confirmar nova senha
            <input v-model="resetForm.confirmPassword" type="password" required placeholder="Repita a nova senha" minlength="6" />
          </label>
          <p v-if="error" class="error">{{ error }}</p>
          <button type="submit" :disabled="loading">
            {{ loading ? 'Redefinindo...' : 'Redefinir senha' }}
          </button>
        </form>
      </div>

      <!-- Etapa 3: Sucesso -->
      <div v-if="step === 3">
        <div class="success">
          Senha redefinida com sucesso! Você já pode fazer login com a nova senha.
        </div>
        <RouterLink to="/login">
          <button type="button" style="width:100%">Ir para o Login</button>
        </RouterLink>
      </div>

      <p v-if="step !== 3">
        Lembrou a senha? <RouterLink to="/login">Voltar ao login</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import api from '../services/api';
import BrandMark from '../components/BrandMark.vue';

const step    = ref(1);
const loading = ref(false);
const error   = ref('');

const emailForm = reactive({ email: '' });
const resetForm = reactive({ resetToken: '', newPassword: '', confirmPassword: '' });

const handleForgot = async () => {
  loading.value = true;
  error.value   = '';
  try {
    await api.post('/auth/forgot-password', { email: emailForm.email });
    step.value = 2;
  } catch (err) {
    error.value = err.response?.data?.message || 'Erro ao solicitar recuperação.';
  } finally {
    loading.value = false;
  }
};

const handleReset = async () => {
  if (resetForm.newPassword !== resetForm.confirmPassword) {
    error.value = 'As senhas não coincidem.';
    return;
  }
  if (resetForm.newPassword.length < 6) {
    error.value = 'A nova senha deve ter no mínimo 6 caracteres.';
    return;
  }

  loading.value = true;
  error.value   = '';
  try {
    await api.post('/auth/reset-password', {
      resetToken: resetForm.resetToken,
      newPassword: resetForm.newPassword,
    });
    step.value = 3;
  } catch (err) {
    error.value = err.response?.data?.message || 'Erro ao redefinir senha.';
  } finally {
    loading.value = false;
  }
};
</script>
