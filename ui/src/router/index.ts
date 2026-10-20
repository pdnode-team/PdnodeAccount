import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import TerraView from '@/views/TerraView.vue'
import RegisterView from '@/views/RegisterView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/terra', name: 'terra', component: TerraView },
    { path: '/register', name: 'register', component: RegisterView },
  ],
})

export default router
