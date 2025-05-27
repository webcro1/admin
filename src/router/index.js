// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase.js'
import SignIn from '../views/SignIn.vue'
import Dashboard from '../views/Dashboard.vue'  // votre composant dashboard
import DashboardLayout from '@/components/DashboardLayout.vue'
import Session from '@/views/Session.vue'
import Preferences from '@/views/Preferences.vue'
const routes = [
  {
    path: '/',
    name: 'SignIn',
    component: SignIn,
  },
  {
    path: '/',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', name: 'Dashboard', component: Dashboard },
      { path: 'session', name: 'Session', component: Session },
      { path: 'preferences', name: 'Preferences', component: Preferences }
      // Ajoute d'autres routes enfants ici
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, from, next) => {
  // Récupère la session actuelle
  const { data: { session } } = await supabase.auth.getSession()

  // Si utilisateur déjà connecté et qu'il tente d’aller sur '/', on le redirige
  if (session && to.path === '/') {
    return next({ name: 'Dashboard' })
  }

  // Si route protégée et pas de session, on renvoie vers SignIn
  if (to.meta.requiresAuth && !session) {
    return next({ name: 'SignIn' })
  }

  // Sinon, on laisse passer
  next()
})

export default router
