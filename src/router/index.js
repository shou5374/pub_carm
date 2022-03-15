import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import firebase from 'firebase'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/carManagement',
    name: 'CarManagement',
    component: () => import('../views/CarManagement.vue')
  },
  {
    path: '/account',
    name: 'Account',
    component: () => import('../views/Account.vue')
  },
  {
    path: '/accountManagement',
    name: 'AccountManagement',
    component: () => import('../views/AccountManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/report',
    name: 'Report',
    component: () => import('../views/Report.vue'),
    meta: { requiresAuth: true }
  },
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  let requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  firebase.auth().onAuthStateChanged(function(user) {
    if (user && to.name=="Account") {
      next({
        path: '/accountManagement',
        query: { redirect: to.fullPath }
      })
    } else if (requiresAuth) {
      if (!user) {
        next({
          path: '/account',
          query: { redirect: to.fullPath }
        })
      } else {
        next()
      }
    } else {
      next()
    }
  });
})

export default router
