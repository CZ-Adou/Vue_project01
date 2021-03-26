<template>
  <div>
    <el-container class="home_container">
      <el-header>
        <div class="left">
          <img src="../assets/heima.png" alt="" />
          <span>电商后台管理系统</span>
        </div>
        <div class="right">
          <el-button type="info" @click="logout">退出</el-button>
        </div>
      </el-header>
      <el-container>
        <el-aside :width="isCollapse ? '64px' : '200px'">
          <!-- toggle -->
          <div class="toggle" @click="isCollapse = !isCollapse">|||</div>
          <!-- el-menu 外面的包裹性组件 --><!-- 侧边栏菜单区域 -->
          <el-menu
            background-color="#333744"
            text-color="#fff"
            unique-opened
            :collapse="isCollapse"
            :collapse-transition="false"
            router
            :default-active="activePath"
          >
            <el-submenu
              :index="item.id + ''"
              v-for="item in menulist"
              :key="item.id"
            >
              <!-- 具名插槽 -->
              <template slot="title">
                <i :class="iconsObj[item.id]"></i>&nbsp;&nbsp;&nbsp;
                <span>{{ item.authName }}</span>
              </template>
              <el-menu-item
                :index="'/' + subItem.path"
                v-for="subItem in item.children"
                :key="subItem.id"
                @click="toggleActivePath('/' + subItem.path)"
              >
                <template slot="title">
                  <i class="el-icon-s-grid"></i>
                  <span>{{ subItem.authName }}</span>
                </template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
const ACTIVE_PATH = 'activePath'
export default {
  data () {
    return {
      menulist: [],
      iconsObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      isCollapse: false, // 默认展开
      activePath: ''
    }
  },
  created () {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem(ACTIVE_PATH)
  },
  methods: {
    logout () {
      // 销毁token
      window.sessionStorage.clear()
      // 跳转到登录页面
      this.$router.push('/login')
    },
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
      // console.log(res)
    },

    toggleActivePath (path) {
      this.toggleActivePath = path
      window.sessionStorage.setItem(ACTIVE_PATH, path)
    }
  },
  computed: {}
}
</script>

<style lang="less" scoped>
// 整个页面容器
.home_container {
  height: 100vh;

  // 头部区域
  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 10px;
    .left {
      img {
        vertical-align: middle;
        margin-right: 20px;
      }
      span {
        font-size: 22px;
        vertical-align: middle;
        color: #fff;
      }
    }
  }

  .toggle {
    background-color: #4a5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
  // 侧边栏
  .el-aside {
    background: #373d41;
  }

  // 主体区域
  .el-main {
    background: #eaedf1;
  }

  .el-menu {
    border-right: 0;
  }
}
</style>
