<template>
<div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品分类列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
        <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        <!-- 树形表格控件 不展开 去掉复选框 -->
        <tree-table :data="cateList" :columns="columns" :expand-type="false" :selection-type="false" show-index border>
            <template slot="cat_deleted" slot-scope="scope">
                <i class="el-icon-success" v-if="scope.row.cat_deleted === false"></i>
                <i class="el-icon-error" v-else></i>
            </template>
            <template slot="cat_level" slot-scope="scope">
                <el-tag size="mini" type="primary" v-if="scope.row.cat_level === 0">一级</el-tag>
                <el-tag size="mini" type="warning" v-else-if="scope.row.cat_level === 1">二级</el-tag>
                <el-tag size="mini" type="danger" v-else>三级</el-tag>
            </template>
            <!-- eslint-disable-next-line  -->
            <template slot-scope="scope" slot="opt">
                <!-- 编辑按钮 -->
                <el-button type="primary" size="mini" icon="el-icon-edit"></el-button>
                <!-- 删除按钮 -->
                <el-button type="danger" size="mini" icon="el-icon-delete"></el-button>
                <!-- 设置按钮 -->
                <el-button type="warning" size="mini" icon="el-icon-setting"></el-button>
            </template>
        </tree-table>
        <!-- 分页区域 -->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 3, 4, 5]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="30%" @close="resetAddFormFn">
        <el-form label-width="80px">
            <el-form-item label="分类名称">
                <el-input v-model="addCateForm.cat_name"></el-input>
            </el-form-item>
            <el-form-item label="父级分类">
                <el-cascader v-model="selectedParentKeys" clearable :props="{ expandTrigger: 'hover',label:'cat_name' , value:'cat_id',checkStrictly: true}" :options="parentCateList" @click="handleChange"></el-cascader>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addCateDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="saveAddCateFn">确 定</el-button>
        </span>
    </el-dialog>
</div>
</template>

<script>
export default {
  data () {
    return {
      // 指定级联选择器的配置对
      selectedParentKeys: [],
      parentCateList: [],
      // 添加分类表单数据对象
      addCateForm: {
        cat_name: '', // 分类名称值
        cat_pid: 0, // 父级分类id值
        cat_level: 0 // 分类当前层级 0 表示1级分类 1表示2级 没有选值就是0 选了数组长度刚好是level
      },
      addCateDialogVisible: false,
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类数据列表 默认为空
      cateList: [],
      total: 0, // 总数据条数
      columns: [{
        label: '分类名称',
        prop: 'cat_name'
      },
      {
        label: '是否有效',
        prop: 'cat_deleted',
        type: 'template', // 表示将当前列定义为模板列
        template: 'cat_deleted' // 当前列使用模板名称
      },
      {
        label: '排序',
        prop: 'cat_level',
        type: 'template',
        template: 'cat_level'
      },
      {
        label: '操作',
        type: 'template',
        template: 'opt'
      }
      ]
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async saveAddCateFn () {
      // 关闭对话框清空network 渲染新数据
      const {
        data: res
      } = await this.$http.post('categories', this.addCateForm)
      if (res.meta.status !== 201) return this.$message.error('添加失败')
      this.addCateDialogVisible = false
      this.getCateList()
    },
    // 重置对话框
    resetAddFormFn () {
      this.addCateForm = {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      }
      this.selectedParentKeys = []
    },
    // 获取父级分类
    async getParentCateList () {
      const {
        data: res
      } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类失败')
      }
      this.parentCateList = res.data
    },
    handleChange () {
      console.log(this.selectedParentKeys)
      if (this.selectedParentKeys.length === 0) {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      } else {
        this.addCateForm.cat_pid = this.selectedParentKeys.slice(-1)[0]
        this.addCateForm.cat_level = this.selectedParentKeys.length
      }
      console.log(this.addCateForm)
    },
    // 获取商品分类信息
    async getCateList () {
      const {
        data: res
      } = await this.$http.get('categories', {
        params: this.queryInfo
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      console.log(res.data)
      // 把数据列表赋值给 catelist
      this.cateList = res.data.result
      // 为总数据条数 赋值
      this.total = res.data.total
    },
    // 监听 pagesize改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听pagenum改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 点击按钮 显示对话框
    showAddCateDialog () {
      this.getParentCateList() // 点击添加分类按钮
      this.addCateDialogVisible = true
    }
  },
  computed: {}
}
</script>

<style scoped>
.zk-table {
    margin-top: 20px;
}
</style>
