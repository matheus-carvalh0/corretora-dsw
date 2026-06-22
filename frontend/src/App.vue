<template>
  <div id="app">
    <RouterView />
    <ToastContainer />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router';
import ToastContainer from './components/ToastContainer.vue';
</script>
