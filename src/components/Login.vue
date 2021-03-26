<template>
<div class="login_container">
    <div class="login_box">
        <div class="avatar_box">
            <img src="../assets/logo.png" alt="" />
        </div>
        <el-form class="login_form" :model="loginForm" :rules="loginFormRules" ref="loginFormRef">
            <!-- 用户名 -->
            <el-form-item prop="username">
                <el-input prefix-icon="iconfont icon-user" v-model="loginForm.username">
                </el-input>
            </el-form-item>
            <!-- 密码 -->
            <el-form-item prop="password">
                <el-input prefix-icon="iconfont icon-3702mima" type="password" v-model="loginForm.password"></el-input>
            </el-form-item>
            <!-- 登录  注册 -->
            <el-form-item class="btns">
                <el-button type="primary" @click="login">登录</el-button>
                <el-button type="info" @click="resetLoginForm">重置</el-button>
            </el-form-item>
        </el-form>
    </div>
</div>
</template>

<script>
export default {
  data () {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loginFormRules: {
        // 表单中每一个表单项input都是一个数组 因为每个表单input可以有很多规则 非空
        username: [{
          required: true,
          message: '用户名不能为空',
          trigger: blur
        },
        {
          min: 3,
          max: 10,
          message: '长度在3到10之间'
        }
        ],
        password: [{
          required: true,
          message: '密码不能为空',
          trigger: blur
        },
        {
          min: 6,
          max: 15,
          message: '长度在6到15之间'
        }
        ]
      }
    }
  },
  methods: {
    // 重置表单
    resetLoginForm () {
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      // 预校验： 发ajax之前再校验一次
      // valid 是形参  校验通过时，valid值是true
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) return // 如果校验失败就直接代码终止
        const {
          data: res
        } = await this.$http.post('login', this.loginForm)
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error('登录失败')

        this.$message.success('登录成功')

        // 把token存到本地存储
        window.sessionStorage.setItem('token', res.data.token)
        // 跳转到后台首页
        this.$router.push('/home')
      })
    }
  },

  computed: {}
}
</script>

<style lang="less" scoped>
.login_container {
    height: 100%;
    background-color: #2b4b6b;
    position: relative;

    .login_box {
        width: 450px;
        height: 300px;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        background-color: #fff;
        border-radius: 5px;

        .avatar_box {
            width: 130px;
            height: 130px;
            background: #fff;
            position: absolute;
            left: 50%;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            padding: 10px;
            box-shadow: 0 0 10px #ddd;

            img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background-color: #eee;
            }
        }

        .login_form {
            position: absolute;
            bottom: 0;
            padding: 0 20px;
            width: 100%;
            box-sizing: border-box;
        }

        .btns {
            // display: flex;
            // justify-content: flex-end;
            text-align: right;
        }
    }
}
</style>
