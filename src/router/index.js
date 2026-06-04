import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/HomePage.vue'),
    meta: { title: 'MENYA — Learn. Practice. Excel.' },
  },
  {
    path: '/books',
    name: 'books',
    component: () => import('@/pages/BooksPage.vue'),
    meta: { title: 'Curriculum Books — MENYA' },
  },
  {
    path: '/past-papers',
    name: 'past-papers',
    component: () => import('@/pages/PastPapersPage.vue'),
    meta: { title: 'Past Papers — MENYA' },
  },
  {
    path: '/exercises',
    name: 'exercises',
    component: () => import('@/pages/ExercisesPage.vue'),
    meta: { title: 'Interactive Exercises — MENYA' },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/pages/AboutPage.vue'),
    meta: { title: 'About — MENYA' },
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('@/pages/ContactPage.vue'),
    meta: { title: 'Contact — MENYA' },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/pages/DashboardPage.vue'),
    meta: { title: 'My Dashboard — MENYA' },
  },
  // --- Admin area (nested under a persistent shell with login gate) ---
  {
    path: '/admin',
    component: () => import('@/components/admin/AdminShell.vue'),
    meta: { admin: true },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('@/pages/admin/AdminDashboard.vue'),
        meta: { title: 'Admin — MENYA', admin: true },
      },
      {
        path: 'books',
        name: 'admin-books',
        component: () => import('@/pages/admin/AdminBooks.vue'),
        meta: { title: 'Manage Books — MENYA Admin', admin: true },
      },
      {
        path: 'past-papers',
        name: 'admin-past-papers',
        component: () => import('@/pages/admin/AdminPastPapers.vue'),
        meta: { title: 'Manage Past Papers — MENYA Admin', admin: true },
      },
      {
        path: 'exercises',
        name: 'admin-exercises',
        component: () => import('@/pages/admin/AdminExercises.vue'),
        meta: { title: 'Manage Exercises — MENYA Admin', admin: true },
      },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('@/pages/admin/AdminUsers.vue'),
        meta: { title: 'Users — MENYA Admin', admin: true },
      },
      // Unknown /admin/* paths fall back to the dashboard
      { path: ':pathMatch(.*)*', redirect: '/admin' },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/NotFoundPage.vue'),
    meta: { title: 'Page not found — MENYA' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 90 }
    return { top: 0, behavior: 'smooth' }
  },
})

// Protect admin sub-pages: if not authed (or token expired), send to the login gate.
// Admin sub-pages: ensure auth is initialised, then require an admin role.
// (The AdminShell also shows a login gate, so this is a belt-and-suspenders guard.)
import { useAuth } from '@/composables/useAuth'
router.beforeEach(async (to) => {
  if (to.meta?.admin && to.path !== '/admin') {
    const { init, isAdmin } = useAuth()
    await init()
    if (!isAdmin.value) return { path: '/admin' }
  }
  return true
})

router.afterEach((to) => {
  if (to.meta?.title) document.title = to.meta.title
})

export default router
