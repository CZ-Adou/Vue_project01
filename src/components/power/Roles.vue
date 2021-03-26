<template>
<div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
        <el-button type="primary">添加角色</el-button>
        <!-- 角色列表区域 -->
        <el-table :data="rolesList" border >
          <!-- 展开列 -->
            <el-table-column type="expand" label="展开">
                <template slot-scope="scope">
                  <!-- <pre>{{scope.row}}</pre> 用户列表数据 -->
                    <el-row v-for="item1 in scope.row.children" :key="item1.id" style="background-color: #e5e5eb; margin-bottom: 20px; padding-top: 10px;">
                        <el-col :span="5">
                            <el-tag type="primary" closable="" @close="delRightsFn(scope.row, item1.id)">{{ item1.authName }}</el-tag>
                            <i class="el-icon-caret-right"></i>
                        </el-col>
                        <el-col :span="19">
                            <div v-for="item2 in item1.children" :key="item2.id" style="background-color: #c9bbc2; margin-bottom: 10px">
                                <el-row>
                                    <el-col :span="5">
                                        <el-tag type="warning" closable="" @close="delRightsFn(scope.row, item2.id)">{{ item2.id }}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="19">
                                        <el-tag v-for="item3 in item2.children" @close="delRightsFn(scope.row, item3.id)" :key="item3.id" type="danger" closable="">{{ item3.authName }}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                </el-row>
                            </div>
                        </el-col>
                    </el-row>
                </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#" ></el-table-column>
            <el-table-column prop="roleName" label="角色名称"></el-table-column>
            <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
            <el-table-column label="操作">
                <!--  作用域插槽 状态栏 -->
                <!-- slot-scope='scope' -->
                <!-- eslint-disable-next-line  -->
                <template slot-scope="scope">
                    <!-- 编辑按钮 -->
                    <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
                    <!-- 删除按钮 -->
                    <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
                    <!-- 设置按钮 -->
                    <el-tooltip content="分配权限" placement="top" :enterable="false">
                        <el-button type="warning" size="mini" icon="el-icon-setting" @click="showRightDialogFn(scope.row)">分配权限</el-button>
                    </el-tooltip>
                </template>
            </el-table-column>
        </el-table>
    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" width="30%" :visible.sync="rightDialogVisible">
        <el-tree ref="mytree" :default-checked-keys="selectedKeys" node-key="id" :props="defaultProps" :show-checkbox="true" default-expand-all :data="rightsList"></el-tree>
        <span slot="footer" class="dialog-footer">
            <el-button @click="rightDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="saveRights">确 定</el-button>
        </span>
    </el-dialog>
</div>
</template>

<script>
export default {
  created () {
    this.getRolesList()
  },
  data () {
    return {
      // 所有角色列表数据
      rolesList: [],
      // 控制分配权限对话框的显示与隐藏
      rightDialogVisible: false,
      // 所有权限的数据
      rightsList: [],
      // 树形控件的属性绑定对象
      defaultProps: {
        label: 'authName'
      },
      selectedKeys: [],
      roleId: null // 显示权限对话框的时候把当前角色id值保存点击时候用
    }
  },
  methods: {
    // 得到列表信息
    async getRolesList () {
      const {
        data: res
      } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.message.error('查询失败')
      console.log(res)
      this.rolesList = res.data // 重绘
      console.log(this.rolesList)
    },
    // 删除列表
    delRightsFn (role, id) {
      this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const {
            data: res
          } = await this.$http.delete(`roles/${role.id}/rights/${id}`)
          console.log(res)

          // 把删除成功后的权限数据列表返回了 更新到角色数据的children中
          role.children = res.data
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 打开权限对话框
    async showRightDialogFn (role) {
      this.roleId = role.id
      this.rightDialogVisible = true
      const {
        data: res
      } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取失败')
      console.log(res)
      this.rightsList = res.data

      const arr = [] // 收集所有的三级权限id值
      // if (role.children.length > 0) {
      //   role.children.forEach(item1 => {
      //     if (item1.children.length > 0) {
      //       item1.children.forEach(item2 => {
      //         if (item2.children.length > 0) {
      //           item2.children.forEach(item3 => {
      //             arr.push(item3.id)
      //           })
      //         }
      //       })
      //     }
      //   })

      // 递归
      function fn (obj) {
        if (obj.children) {
          obj.children.forEach(item => {
            fn(item)
          })
        } else {
          // 最底层
          arr.push(obj.id)
        }
      }
      fn(role)
      this.selectedKeys = arr
    },
    // 按确定保存数据
    async saveRights () {
      const arr = [...this.$refs.mytree.getCheckedKeys(), ...this.$refs.mytree.getHalfCheckedKeys()]
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: arr.join(',') })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('更新权限失败！')
      this.$message.success('更新权限成功')
      this.rightDialogVisible = false // 关闭弹出框
      this.getRolesList() // 数据变旧了重新刷新数据
    }
  },
  computed: {}
}
</script>

<style scoped>
.el-tag {
    margin: 7px;
}

.el-table {
  margin-top: 10px;
}
</style>
