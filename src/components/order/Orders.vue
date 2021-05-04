<template>
<div>
    <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>订单管理</el-breadcrumb-item>
        <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
        <div style="width: 400px">
            <el-input>
                <i slot="append" class="el-icon-search"></i>
            </el-input>
        </div>
        <!-- 返回数据和要呈现方式的数据如果不一致就考虑用作用域插槽 -->
        <el-table :data="orderList" border stripe>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="订单编号" prop="order_number"></el-table-column>
            <el-table-column label="订单价格" prop="order_price"></el-table-column>
            <el-table-column label="是否付款" prop="order_pay">
                <template slot-scope="scope">
                    <el-tag type="success" v-if="scope.row.order_pay === '0'">是</el-tag>
                    <el-tag v-else type="danger">否</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="是否发货" prop="is_send"></el-table-column>
            <el-table-column label="下单时间" prop="create_time">
                <template slot-scope="scope">
                    {{ (scope.row.create_time * 1000) | dateFormat }}
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <!-- eslint-disable-next-line   -->
                <template slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="addressDialogVisible=true"></el-button>
                    <el-button type="success" icon="el-icon-location" size="mini" @click="expressDialogVisible=true"></el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-card>

    <!-- 弹出编辑框 -->
    <el-dialog title="修改地址" :visible.sync="addressDialogVisible" width="50%" >
          <el-form label-width="80px">
            <el-form-item label="省市区/县">
              <el-cascader :options="citydata"></el-cascader>
            </el-form-item>
            <el-form-item label="详细地址">
            <el-input ></el-input>
            </el-form-item>
          </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addressDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addressDialogVisible = false">确 定</el-button>
        </span>
    </el-dialog>
        <!-- 快递信息对话框 -->
    <el-dialog title="快递信息" :visible.sync="expressDialogVisible" width="50%" >
            <el-timeline>
    <el-timeline-item
      v-for="(item, index) in expressData"
      :key="index"
      :icon="'el-icon-more'"
      :type="'primary'"
      :color="'green'"
      :size="'large'"
      :timestamp="item.time">
      {{item.context}}
    </el-timeline-item>
  </el-timeline>
    </el-dialog>
</div>
</template>

<script>
import citydata from './citydata'
export default {
  data () {
    return {
      queryInfo: {
        pagenum: 1,
        pagesize: 20
      },
      orderList: [],
      total: 0,
      addressDialogVisible: false,
      expressDialogVisible: false,
      citydata,
      expressData: [
        {
          time: '2018-05-10 09:39:00',
          ftime: '2018-05-10 09:39:00',
          context: '已签收,感谢使用顺丰,期待再次为您服务',
          location: ''
        },
        {
          time: '2018-05-10 08:23:00',
          ftime: '2018-05-10 08:23:00',
          context: '[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件',
          location: ''
        },
        {
          time: '2018-05-10 07:32:00',
          ftime: '2018-05-10 07:32:00',
          context: '快件到达 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-10 02:03:00',
          ftime: '2018-05-10 02:03:00',
          context: '快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-09 23:05:00',
          ftime: '2018-05-09 23:05:00',
          context: '快件到达 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 21:21:00',
          ftime: '2018-05-09 21:21:00',
          context: '快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 13:07:00',
          ftime: '2018-05-09 13:07:00',
          context: '顺丰速运 已收取快件',
          location: ''
        },
        {
          time: '2018-05-09 12:25:03',
          ftime: '2018-05-09 12:25:03',
          context: '卖家发货',
          location: ''
        },
        {
          time: '2018-05-09 12:22:24',
          ftime: '2018-05-09 12:22:24',
          context: '您的订单将由HLA（北京海淀区清河中街店）门店安排发货。',
          location: ''
        },
        {
          time: '2018-05-08 21:36:04',
          ftime: '2018-05-08 21:36:04',
          context: '商品已经下单',
          location: ''
        }
      ]
    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    async getOrderList () {
      const {
        data: res
      } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error('获取失败')
      console.log(res)
      this.orderList = res.data.goods
      this.total = res.data.total
    }
  },
  computed: {}
}
</script>

<style scoped>
.el-cascader{
  width: 100%;
}
</style>
