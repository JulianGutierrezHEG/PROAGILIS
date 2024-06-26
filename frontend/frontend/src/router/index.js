import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '@/components/general/MainLayout.vue';
import Home from '@/views/Home.vue';
import SignIn from '@/views/SignIn.vue';
import SignUp from '@/views/SignUp.vue';
import Dashboard from '@/views/Dashboard.vue';  

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: Home,
        meta: { requiresAuth: true }
      },
      {
        path: 'signin',
        name: 'SignIn',
        component: SignIn,
      },
      {
        path: 'signup',
        name: 'SignUp',
        component: SignUp,
      },
      {
        path: 'dashboard',  
        name: 'Dashboard',
        component: Dashboard,
        meta: { requiresAuth: true }
      },
    ],
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem('access');

  if (to.matched.some(record => record.meta.requiresAuth) && !token) {
    next('/signin');
  } else {
    next();
  }
});

export default router;