import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '@/components/general/MainLayout.vue';
import Home from '@/views/Home.vue';
import SignIn from '@/views/SignIn.vue';
import SignUp from '@/views/SignUp.vue';
import Dashboard from '@/views/Dashboard.vue';  
import Game from '@/views/Game.vue';
import userService from '@/services/usersService';
import sessionsService from '@/services/sessionsService';

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
      {
        path: 'game/:sessionId',
        name: 'Game',
        component: Game,
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

router.beforeEach(async (to, from, next) => {
  const token = sessionStorage.getItem('access');

  if (to.matched.some(record => record.meta.requiresAuth) && !token) {
    next('/signin');
  } else {
    if (to.path.startsWith('/game/')) {
      try {
        const user = await userService.getCurrentUser();
        const session = await sessionsService.getJoinedSession(user.id);

        if (session && session.id === parseInt(to.params.sessionId, 10)) {
          next();
        } else {
          next({ name: 'Home' });
        }
      } catch (error) {
        console.error('Erreur lors du route guard:', error);
        next({ name: 'Home' });
      }
    } else {
      next();
    }
  }
});

export default router;
