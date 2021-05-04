<template>
<div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
        <el-row :gutter="20">
            <el-col :span="8">
              <el-input placeholder="请输入内容" v-model="queryInfo.query"
               @keyup.enter.native="getGoodsList" clearable @clear="getGoodsList">
                <i class="el-icon-search" slot="append" @click="getGoodsList"></i>
              </el-input>
            </el-col>
            <el-col :span="16">
              <el-button type="primary" @click="$router.push('/goods/add')">添加商品</el-button>
            </el-col>
        </el-row>
    <el-table :data=" goodsList" border stripe>
        <el-table-column type="index" label="编号"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量"></el-table-column>
        <el-table-column prop="add_time" label="创建时间">
          <template slot-scope="scope">
            {{scope.row.add_time*1000 | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column prop="role_name" label="操作">
          <template slot-scope="scope">
            <!-- slot-scope="scope" -->
            <el-button type="primary" size="mini" icon="el-icon-edit"></el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="delFn(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
       </el-table>
           <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="1"
      :page-sizes="[1,2,3,4]"
      :page-size="100"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    </el-card>

</div>
</template>
<script>
export default {
  data () {
    return {
      goodsList: [],
      total: 0,
      queryInfo: {
        pagenum: 1,
        pagesize: 10,
        query: ''
      }
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    delFn (goodsId) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`goods/${goodsId}`)
        if (res.meta.status !== 200) return this.$message.error('删除信息失败')
        this.getGoodsList()
        this.$message.success('删除信息成功')
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败！')

      this.goodsList = res.data.goods
      this.total = res.data.total
      console.log(res.data)
    },
    handleSizeChange (pagesize) {
      this.queryInfo.pagesize = pagesize
      this.getGoodsList()
    },
    handleCurrentChange (pagenum) {
      this.queryInfo.pagenum = pagenum
      this.getGoodsList()
    }
  },
  computed: {

  }
}
</script>
<style lang='less' scoped>

</style>
