import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import SignIn from '../components/SignIn.vue';
import SignUp from '../components/SignUp.vue';

const routes = [
  { path: '/', component: Home, meta: { requiresAuth: true } },
  { path: '/signin', component: SignIn },
  { path: '/signup', component: SignUp },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const token = localStorage.getItem('token');
    if (!token) {
      next('/signin');
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
