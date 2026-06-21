import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null);
  const user  = ref(JSON.parse(localStorage.getItem('user') || 'null'));

  const isAuthenticated = computed(() => !!token.value);

  const setSession = (data) => {
    token.value = data.token;
    user.value  = data.user;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const clearSession = () => {
    token.value = null;
    user.value  = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    setSession(data.data);
    return data;
  };

  const login = async (payload) => {
    const { data } = await api.post('/auth/login', payload);
    setSession(data.data);
    return data;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch (_) {}
    clearSession();
  };

  const fetchMe = async () => {
    const { data } = await api.get('/user/me');
    user.value = data.data;
    localStorage.setItem('user', JSON.stringify(data.data));
    return data.data;
  };

  return { token, user, isAuthenticated, register, login, logout, fetchMe };
});
