import { createRouter, createWebHashHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: () => import('./pages/index.vue') },
    { path: '/book/add', component: () => import('./pages/book/add.vue') },
    { path: '/book/:id', component: () => import('./pages/book/[id].vue') },
    { path: '/series', component: () => import('./pages/series/index.vue') },
    { path: '/series/add', component: () => import('./pages/series/add.vue') },
    { path: '/series/:id', component: () => import('./pages/series/[id].vue') },
    { path: '/stats', component: () => import('./pages/stats.vue') },
    { path: '/settings', component: () => import('./pages/settings.vue') },
  ],
})
