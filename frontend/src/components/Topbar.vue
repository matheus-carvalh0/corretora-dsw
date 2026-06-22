<template>
  <header class="topbar">
    <BrandMark />
    <nav>
      <RouterLink to="/market">Mercado</RouterLink>
      <RouterLink to="/portfolio">Carteira</RouterLink>
      <RouterLink to="/orders">Ordens</RouterLink>
      <RouterLink to="/account">Conta</RouterLink>
    </nav>
    <button class="btn-logout" @click="handleLogout">Sair</button>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import BrandMark from './BrandMark.vue';

const router = useRouter();
const auth = useAuthStore();

const handleLogout = async () => {
  await auth.logout();
  router.push({ name: 'Login' });
};
</script>
