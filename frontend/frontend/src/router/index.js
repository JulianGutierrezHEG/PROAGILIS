import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../components/MainLayout.vue';
import HomeView from '../views/HomeView.vue'
import OtherView from '../views/OtherView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'Home',
          component: HomeView
        },
        {
          path: 'other',
          name: 'Other',
          component: OtherView
        }
      ]
    }
  ]
})

export default router
