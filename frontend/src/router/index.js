import { createRouter, createWebHistory } from 'vue-router';

// Importações lazy — cada rota só é carregada quando necessário
const LoginView      = () => import('../views/LoginView.vue');
const RegisterView   = () => import('../views/RegisterView.vue');
const MarketView     = () => import('../views/MarketView.vue');
const PortfolioView  = () => import('../views/PortfolioView.vue');
const AccountView    = () => import('../views/AccountView.vue');
const NotFoundView   = () => import('../views/NotFoundView.vue');

const routes = [
  { path: '/',          redirect: '/market' },
  { path: '/login',     name: 'Login',     component: LoginView,     meta: { guest: true } },
  { path: '/register',  name: 'Register',  component: RegisterView,  meta: { guest: true } },
  { path: '/market',    name: 'Market',    component: MarketView,    meta: { requiresAuth: true } },
  { path: '/portfolio', name: 'Portfolio', component: PortfolioView, meta: { requiresAuth: true } },
  { path: '/account',   name: 'Account',   component: AccountView,   meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Guard de navegação — redireciona para /login se não autenticado
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token');

  if (to.meta.requiresAuth && !token) {
    return next({ name: 'Login' });
  }
  if (to.meta.guest && token) {
    return next({ name: 'Market' });
  }
  next();
});

export default router;
