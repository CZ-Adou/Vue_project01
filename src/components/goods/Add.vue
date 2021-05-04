<template>
<div class="abc">
    <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
        <el-alert title="添加商品信息" type="info" close-text="知道了">
        </el-alert>
        <el-steps :active="activeIndex - 0" finish-status="success" :space="200" align-center>
            <el-step title="基本信息"></el-step>
            <el-step title="商品参数"></el-step>
            <el-step title="商品属性"></el-step>
            <el-step title="商品图片"></el-step>
            <el-step title="商品内容"></el-step>
            <el-step title="完成"></el-step>
        </el-steps>

        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef">
            <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeLeave">
                <el-tab-pane label="基本信息" name="0">
                    <el-form-item label="商品名称" prop="goods_name">
                        <el-input v-model="addForm.goods_name"></el-input>
                    </el-form-item>
                    <el-form-item label="商品价格" prop="goods_price">
                        <el-input v-model="addForm.goods_price" type="number"></el-input>
                    </el-form-item>
                    <el-form-item label="商品重量" prop="goods_weight">
                        <el-input v-model="addForm.goods_weight" type="number"></el-input>
                    </el-form-item>
                    <el-form-item label="商品数量" prop="goods_number">
                        <el-input v-model="addForm.goods_number" type="number"></el-input>
                    </el-form-item>
                    <el-form-item label="商品分类" prop="goods_cat">
                        <br>
                        <el-cascader v-model="addForm.goods_cat" @change="handleChange" :options="catelist" :props="{ label:'cat_name',value:'cat_id' }"></el-cascader>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品参数(动态)" name="1">
                    <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
                        <br>
                        <el-checkbox-group v-model="item.attr_vals">
                            <el-checkbox border :label="item1" v-for="(item1,index1) in item.attr_vals1" :key="index1"></el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品属性(静态)" name="2">
                    <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
                        <el-input v-model="item.attr_vals"></el-input>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品图片" name="3">
                    <el-upload :headers="headers" action="http://127.0.0.1:8888/api/private/v1/upload" :on-success="handleSuccess" :on-preview="handlePreview" :on-remove="handleRemove" :file-list="fileList" list-type="picture">
                        <el-button size="small" type="primary">点击上传</el-button>
                        <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                    </el-upload>
                </el-tab-pane>
                <el-tab-pane label="商品内容" name="4">
                  <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                  <el-button type="primary" @click="add">添加商品</el-button>
                </el-tab-pane>
            </el-tabs>
        </el-form>
    </el-card>

    <!-- 预览对话框 -->
    <el-dialog :visible.sync="previewDialogVisible" width="50%">
        <img style="width:100%;" :src="previewPath" alt="">
    </el-dialog>
</div>
</template>

<script>
// 前端开发的时候，经常会有一些各种小的需求，对数据进行处理 深拷贝 lodash
// 一个表单 拆分成很多块
// npm i lodash

// 1. handleChange的if添加一个else{}
// 2. tabClickFn里面的if...else代码全部拷贝到handleChange 把第二个ajax的const {data:res} 改成 {data:res1} res.data 改成res1.data
// 3. handleChange添加一个async
import _ from 'lodash'
export default {
  data () {
    return {
      activeIndex: 0,
      addForm: {
        goods_name: '', // 商品名称
        goods_price: 0, // 价格
        goods_weight: 0, // 重量
        goods_number: 0, // 数量
        goods_cat: [], // 分类 [70,96,110]
        pics: [

        ],
        goods_introduce: ''
      },
      addFormRules: {
        goods_name: [{
          required: true,
          message: '商品名称不能为空',
          trigger: 'blur'
        }],
        goods_price: [{
          required: true,
          message: '商品价格不能为空',
          trigger: 'blur'
        }],
        goods_weight: [{
          required: true,
          message: '商品重量不能为空',
          trigger: 'blur'
        }],
        goods_number: [{
          required: true,
          message: '商品数量不能为空',
          trigger: 'blur'
        }]
      },
      catelist: [],
      manyTableData: [],
      onlyTableData: [],
      fileList: [],
      headers: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewDialogVisible: false,
      previewPath: ''
    }
  },
  created () {
    this.getCateList()
  },
  name: 'GoodsAdd',
  methods: {
    add () {
      // 表单预校验
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写合法的数据')
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')// 数组变成字符串，以,号分割
        form.attrs = []// 空数组
        // 动态属性
        this.manyTableData.forEach(item => {
          const obj = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          form.attrs.push(obj)
        })
        // 静态
        this.onlyTableData.forEach(item => {
          const obj = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          form.attrs.push(obj)
        })
        console.log(form)
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) return this.$message.error('添加失败')
        this.$router.push('/goods')
      })
    },
    handleSuccess (response) {
      console.log(response)
      // 构建一个对象{"pic":"/tmp_uploads/30f08d52c551ecb447277eae232304b8"} push到pics当中
      this.addForm.pics.push({
        pic: response.data.tmp_path
      })
    },
    handlePreview (file) {
      console.log(file)
      // 'http://42.192.71.221:8889/'+file.response.data.tmp_path 线上写法
      this.previewPath = 'http://127.0.0.1:8888/' + file.response.data.tmp_path// 本地有接口服务器的写法
      this.previewDialogVisible = true
    },
    handleRemove (file) {
      // 组件删除了，我们还要同步删除addForm中的pics数组
      // console.log(file)
      const path = file.response.data.tmp_path
      const index = this.addForm.pics.findIndex(item => item.pic === path)
      this.addForm.pics.splice(index, 1)
    },
    async tabClickFn () {
      console.log(this.activeIndex)
      // 当值为1的时候 意味着我们当前切换到动态属性标签页
      if (this.activeIndex === '1') {
        const {
          data: res
        } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'many'
          }
        })
        // 把attr_vals参数变成数组
        res.data.forEach(item => {
          if (item.attr_vals.trim() === '') {
            item.attr_vals = []
          } else {
            item.attr_vals = item.attr_vals.split(' ')
          }
          // v-for和v-model不能是同一个数据
          item.attr_vals1 = [...item.attr_vals] // 拷贝 保证这是二个数组
        })
        this.manyTableData = res.data
        console.log(this.manyTableData)
      } else if (this.activeIndex === '2') {
        const {
          data: res
        } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'only'
          }
        })
        this.onlyTableData = res.data
        console.log(this.onlyTableData)
      }
    },
    async getCateList () {
      const {
        data: res
      } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类数据失败')
      this.catelist = res.data
      console.log(this.catelist)
      this.manyTableData = res.data
    },
    async handleChange () {
      console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      } else {
        const {
          data: res
        } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'many'
          }
        })
        // 把attr_vals参数变成数组
        res.data.forEach(item => {
          if (item.attr_vals.trim() === '') {
            item.attr_vals = []
          } else {
            item.attr_vals = item.attr_vals.split(' ')
          }
          // v-for和v-model不能是同一个数据
          item.attr_vals1 = [...item.attr_vals] // 拷贝 保证这是二个数组
        })
        this.manyTableData = res.data
        console.log(this.manyTableData)
        const {
          data: res1
        } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'only'
          }
        })
        this.onlyTableData = res1.data
        console.log(this.onlyTableData)
      }
    },
    beforeLeave (to, from) {
      // console.log(from)
      // 如果我们是从第一个切换过来并且我们的分类没有选这样不允许
      if (from === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('分类不能为空')
        return false
      }
    }
  },
  computed: {
    // 三级商品的分类的id
    cateId () {
      return this.addForm.goods_cat[2]
    }
  }
}
</script>

<style lang="less" scoped>
/* 模板中用到了一个组件，它只会给组件最外面根标签添加data-属性，内部不加 */
.el-steps {
    margin: 20px;
}

// .el-step >>> .el-step__title{
//   font-size:13px !important;
// }

.el-step ::v-deep .el-step__title {
    font-size: 13px !important;
}

// .el-step /deep/ .el-step__title{
//   font-size:13px !important;
// }

// 下划线是有两个
/deep/ .el-dialog__header {
    display: none !important;
}
/deep/ .ql-editor{
  min-height: 200px;
}
.quill-editor{
  margin-bottom: 20px;
}
</style>
