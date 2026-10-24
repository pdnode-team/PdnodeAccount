import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import TerraView from '@/views/TerraView.vue'
import RegisterView from '@/views/RegisterView.vue'
import LoginView from '@/views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/terra', name: 'terra', component: TerraView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/login', name: 'login', component: LoginView },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/delete-account',
      name: 'delete-account',
      component: () => import('@/views/DeleteAccount.vue')
    },
  ],
})

export default router
