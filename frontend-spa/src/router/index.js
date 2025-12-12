import { createWebHistory, createRouter } from 'vue-router'
import TaskBoard from '@/views/TaskBoard.vue'
import Login from '@/views/LoginPage.vue'
import Homepage from '@/views/UserHomepage.vue'
import Schedule from '@/views/Schedule.vue'
import Calendar from '@/views/Calendar.vue'

const routes = [
  {
    path: '/',
    name: 'taskboard',
    component: TaskBoard,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('@/views/UsersList.vue'),
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: () => import('@/views/Tasks.vue'),
  },
  {
    path: '/tasks/add',
    name: 'task.add',
    component: () => import('@/views/TaskAdd.vue'),
  },
  {
    path: '/tasks/:id',
    name: 'task.edit',
    component: () => import('@/views/TaskEdit.vue'),
    props: (route) => ({ taskId: route.params.id }),
  },
  {
    path: '/schedule',
    name: 'schedule',
    component: Schedule,
  },
  {
    path: '/calendar',
    name: 'calendar',
    component: Calendar,
  },
  {
    path: '/users/add',
    name: 'user.add',
    component: () => import('@/views/UserAdd.vue'),
  },
  {
    path: '/users/:id/edit',
    name: 'user.edit',
    component: () => import('@/views/UserEdit.vue'),
    props: true,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notfound',
    component: () => import('@/views/NotFound.vue'),
  },
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: () => import('@/views/UnauthorizedPage.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/homepage',
    name: 'Homepage',
    component: Homepage,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('role')
  const allowedRoles = to.meta.roles

  if (to.meta.requiresAuth && !token) {
    return next({ path: '/login' })
  }

  if (to.path === '/login' && token) {
    return next({ path: '/' })
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return next('/unauthorized')
  }

  next()
})
export default router
