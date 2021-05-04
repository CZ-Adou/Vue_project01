import Vue from 'vue'
import VueRouter from 'vue-router'
// import Login from '../components/Login.vue'
// import Home from '../components/Home.vue'
// import Welcome from '../components/Welcome.vue'
// import Categories from '../components/goods/Categories.vue'
// import Goods from '../components/goods/Goods.vue'
// import Params from '../components/goods/Params.vue'
// import Orders from '../components/order/Orders.vue'
// import Rights from '../components/power/Rights.vue'
// import Roles from '../components/power/Roles.vue'
// import Reports from '../components/report/Reports.vue'
// import Users from '../components/user/Users.vue'
// import GoodsAdd from '../components/goods/Add.vue'

Vue.use(VueRouter)
const routes = [
  // { path: '/', redirect: '/login' },
  // { path: '/login', component: Login },
  // {
  //   path: '/home',
  //   component: Home,
  //   redirect: '/welcome',
  //   children: [
  //     { path: '/welcome', component: Welcome },
  //     { path: '/categories', component: Categories },
  //     { path: '/goods', component: Goods },
  //     { path: '/params', component: Params },
  //     { path: '/orders', component: Orders },
  //     { path: '/rights', component: Rights },
  //     { path: '/roles', component: Roles },
  //     { path: '/reports', component: Reports },
  //     { path: '/users', component: Users },
  //     { path: '/goods/add', component: GoodsAdd }
  //   ]
  // }

  { path: '/', redirect: '/login' },
  { path: '/login', component: () => import(/* webpackChunkName: "login" */'../components/Login.vue') },
  {
    path: '/home',
    component: () => import('../components/Home.vue'),
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: () => import(/* webpackChunkName: "welcome" */'../components/Welcome.vue') },
      { path: '/categories', component: () => import(/* webpackChunkName: "goods-categories" */'../components/goods/Categories.vue') },
      { path: '/goods', component: () => import('../components/goods/Goods.vue') },
      { path: '/params', component: () => import('../components/goods/Params.vue') },
      { path: '/orders', component: () => import('../components/order/Orders.vue') },
      { path: '/rights', component: () => import('../components/power/Rights.vue') },
      { path: '/roles', component: () => import('../components/power/Roles.vue') },
      { path: '/reports', component: () => import('../components/report/Reports.vue') },
      { path: '/users', component: () => import('../components/user/Users.vue') },
      { path: '/goods/add', component: () => import('../components/goods/Add.vue') }
    ]
  }

]

const router = new VueRouter({
  routes
})

// 路由导航守卫
router.beforeEach((to, from, next) => {
  // 登录 直接放行
  if (to.path === '/login') return next()
  const token = window.sessionStorage.getItem('token')
  if (!token) return next('/login')
  next()
})

export default router
