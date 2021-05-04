<template>
<div>
    <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
        <el-alert title="注意：只允许为第三级分类设置相关参数" type="warning" center show-icon>
        </el-alert>
        <div>
            选择商品分类
            <el-cascader :props="{
            expandTrigger: 'hover',
            label: 'cat_name',
            value: 'cat_id',
          }" :options="cateList" clearable v-model="selectedKeys" @change="handleChange"></el-cascader>
        </div>
        <el-tabs v-model="activeName" @tab-click="handleTabClick">
            <el-tab-pane label="动态参数" name="many">
                <el-button type="primary" :disabled="isBtnDisabled" @click="addParamsDialogVisible = true">添加动态参数</el-button>
                <el-table :data="manyTableData" border stripe>
                    <el-table-column type="expand" label="展开">
                        <template slot-scope="scope">
                            <el-tag closable v-for="(item, index) in scope.row.attr_vals" :key="index" @close="closeBtn">{{ item }}</el-tag>
                            <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                            </el-input>
                            <el-button v-else class="button-new-tag" size="small"  @click="showInput(scope.row)">+ New Tag</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column type="index" label="#"></el-table-column>
                    <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                    <el-table-column label="操作">
                        <!-- eslint-disable-next-line  -->
                        <template slot-scope="scope">
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)">编辑</el-button>
                            <el-button type="danger" icon="el-icon-delete" size="mini" @click="delFn(scope.row.attr_id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
            <el-tab-pane label="静态参数" name="only">
                <el-button type="primary" :disabled="isBtnDisabled" @click="addParamsDialogVisible = true">添加静态参数</el-button>
                <el-table :data="onlyTableData" border stripe>
                    <el-table-column type="expand" label="展开">
                        <template slot-scope="scope">
                            <el-tag closable v-for="(item, index) in scope.row.attr_vals" :key="index" @close="closeBtn">{{ item }}</el-tag>
                            <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                            </el-input>
                            <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column type="index" label="#"></el-table-column>
                    <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                    <el-table-column label="操作">
                        <!-- eslint-disable-next-line  -->
                        <template slot-scope="scope">
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)">编辑</el-button>
                            <el-button type="danger" icon="el-icon-delete" size="mini" @click="delFn(scope.row.attr_id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
        </el-tabs>
    </el-card>

    <!-- 添加属性对话框 -->
    <el-dialog :title="'添加' + title" :visible.sync="addParamsDialogVisible" width="50%" @close="resetAddFormFn">
        <el-form ref="addFormRef" label-width="80px" :model="addForm" :rules="addFormRules">
            <el-form-item :label="title" prop="attr_name">
                <el-input v-model="addForm.attr_name"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addParamsDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
    </el-dialog>

    <!-- 修改属性对话框 -->
    <el-dialog :title="'修改' + title" :visible.sync="editParamsDialogVisible" width="50%" @close="resetEditFormFn">
        <el-form ref="editFormRef" label-width="80px" :model="editForm" :rules="addFormRules">
            <el-form-item :label="title" prop="attr_name">
                <el-input v-model="editForm.attr_name"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editParamsDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="saveEditFormFn">确 定</el-button>
        </span>
    </el-dialog>
</div>
</template>

<script>
// 什么时候用计算属性 当template模板html中的表达式太繁琐的时候
export default {
  name: 'Params',
  created () {
    this.getCateList()
  },
  data () {
    return {
      inputVisible: false,
      inputValue: '',
      row: {}, // 存我们当前要修改这一条记录
      editForm: {
        attr_name: ''
      },
      editParamsDialogVisible: false,
      cateList: [],
      selectedKeys: [],
      activeName: 'many',
      manyTableData: [], // 动态参数列表
      onlyTableData: [], // 静态参数列表
      addParamsDialogVisible: false,
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [{
          required: true,
          message: '请输入商品属性',
          trigger: 'blur'
        }]
      }
    }
  },
  methods: {
    // 删除tag
    closeBtn (row, index) {
      row.attr_vals.splice(index, 1)
      this.updateVals(row)
    },
    // 更新tag
    async updateVals (row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: this.activeName,
        attr_vals: row.attr_vals.join(' ')
      })

      if (res.meta.status !== 200) return this.$message.error('更新失败')
      row.inputValue = '' // input清空
      row.inputVisible = false // 隐藏input, 显示button
    },
    // 删除按钮
    delFn (attrId) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const {
            data: res
          } = await this.$http.delete(
                        `categories/${this.cateId}/attributes/${attrId}`
          )
          if (res.meta.status !== 200) return this.$message.error('删除失败')
          this.getParamsList()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 编辑确定按钮
    async saveEditFormFn () {
      const {
        data: res
      } = await this.$http.put(
                `categories/${this.cateId}/attributes/${this.row.attr_id}`, {
                  attr_name: this.editForm.attr_name,
                  attr_sel: this.activeName
                }
      )
      if (res.meta.status !== 200) return this.$message.error('修改失败')
      this.editParamsDialogVisible = false
      this.getParamsList()
      this.$message.success('修改成功')
    },
    // 编辑对话框
    showEditDialog (row) {
      this.row = row
      this.editParamsDialogVisible = true
      console.log(row)
      this.editForm.attr_name = row.attr_name
    },
    // 获取参数
    addParams () {
      // 表单预校验
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const {
          data: res
        } = await this.$http.post(
                    `categories/${this.cateId}/attributes`, {
                      attr_name: this.addForm.attr_name,
                      attr_sel: this.activeName
                    }
        )
        if (res.meta.status !== 201) return this.$message.error('添加失败')
        console.log(res)
        this.addParamsDialogVisible = false
        this.getParamsList()
      })
    },
    // 关闭添加参数 重置
    resetAddFormFn () {
      this.$refs.addFormRef.resetFields()
    },
    // 关闭编辑按钮 重置
    resetEditFormFn () {
      this.$refs.editFormRef.resetFields()
    },
    // tab栏切换
    handleTabClick () {
      this.getParamsList()
    },
    // 得到分类列表
    async getCateList () {
      const {
        data: res
      } = await this.$http.get('categories', {
        params: {
          type: 3
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类失败')
      }
      this.cateList = res.data
    },
    // 3级分类选择的时候
    handleChange () {
      console.log(this.selectedKeys)
      if (this.selectedKeys.length < 3) {
        this.selectedKeys = []
      }
      this.getParamsList()
    },
    // 得到参数列表
    async getParamsList () {
      // 为了避免用户清空分类 误操作 导致的错误
      if (!this.cateId) {
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      const {
        data: res
      } = await this.$http.get(
                `categories/${this.cateId}/attributes`, {
                  params: {
                    sel: this.activeName
                  }
                }
      )
      if (res.meta.status !== 200) return this.$message.error('获取失败')
      console.log(res.data)
      console.log(this.cateId)
      // 因为页面中要用数组渲染 但是接口数据是一个以空格分隔的字符串
      res.data.forEach((item) => {
        if (item.attr_vals.trim() === '') {
          item.attr_vals = []
        } else {
          item.attr_vals = item.attr_vals.split(',')
        }

        // 二次加工接口数据 让每个对象有自己的inputvisible 和 inputValue
        item.inputVisible = false
        item.inputValue = ''
      })
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }

      row.attr_vals.push(row.inputValue) // 界面上添加好了数据 但是页面不能刷新 一刷新就没有 还需要发ajax
      this.updateVals(row)
    },

    // 点击按钮 展示文本输入框
    showInput (row) {
      row.inputVisible = true
      // this.$refs.saveTagInput // el-input
      // nextTick 是vue知识点
      this.$nextTick(_ => {
        console.log(this.$refs.saveTagInput)
        this.$refs.saveTagInput.$refs.input.focus()
      })
    }
    //

  },
  computed: {
    isBtnDisabled () {
      return this.selectedKeys.length !== 3
    },
    cateId () {
      if (this.selectedKeys.length < 3) {
        return null
      } else {
        return this.selectedKeys[2]
      }
    },
    title () {
      if (this.activeName === 'many') {
        return '动态属性'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style scoped>
.el-alert {
    margin-bottom: 20px;
}

.el-tag {
    margin: 10px;
}

.input-new-tag {
    width: 120px;
}

.button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
}

.input-new-tag {
    width: 90px;
    margin-left: 10px;
}
</style>
