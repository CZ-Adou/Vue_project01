import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import axios from 'axios'
import ZkTable from 'vue-table-with-tree-grid'
// 线上
// axios.defaults.baseURL = 'http://42.192.71.221:8889/api/private/v1/'
// http://42.192.71.221/#/rights
// 本地服务器地址 全局配置  只用写一次
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// 添加请求拦截器  搜索拦截器  放在$http前面
axios.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么
  const token = window.sessionStorage.getItem('token')
  if (token) {
    config.headers.Authorization = token
  }
  return config
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error)
})

Vue.prototype.$http = axios // $http是在父类vue上面的

Vue.config.productionTip = false

Vue.component('tree-table', ZkTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
