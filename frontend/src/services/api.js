import axios from 'axios';

// URL base da API:
// 1. VITE_API_URL (definida em .env.production ou no painel da Vercel) tem prioridade.
// 2. Em build de produção sem a variável definida, cai para a API publicada no Render.
// 3. Em desenvolvimento, usa '/api', que o Vite encaminha para http://localhost:3000 (vite.config.js).
const FALLBACK_PROD_API_URL = 'https://corretora-dsw-api.onrender.com/api';

const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? FALLBACK_PROD_API_URL : '/api');

const api = axios.create({
  baseURL,
  timeout: 30000, // Render free tier "dorme" após inatividade; o primeiro request pode demorar.
  headers: { 'Content-Type': 'application/json' },
});

// Injeta o token JWT em todas as requisições autenticadas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redireciona para /login se o token expirar (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
