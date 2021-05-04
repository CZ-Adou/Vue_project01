<template>
<div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--  卡片视图区域 -->
    <el-card>
        <el-row :gutter="20">
            <el-col :span="8">
                <el-input v-model="query.query" clearable @clear="getUserList">
                    <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                </el-input>
            </el-col>
            <el-col :span="16">
                <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
            </el-col>
        </el-row>
        <el-table :data="userList" stripe boder>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="username" label="姓名"></el-table-column>
            <el-table-column prop="email" label="邮箱"></el-table-column>
            <el-table-column prop="mobile" label="电话"></el-table-column>
            <el-table-column prop="role_name" label="角色"></el-table-column>
            <el-table-column prop="mg_state" label="状态">
                <!--  作用域插槽 状态栏 -->
                <template slot-scope="scope">
                    <el-switch v-model="scope.row.mg_state" @change="userStateFn(scope.row)">
                    </el-switch>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
                <!-- slot-scope='scope' -->
                <template slot-scope="scope">
                    <!-- 编辑按钮 -->
                    <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.id)"></el-button>
                    <!-- 删除按钮 -->
                    <el-button type="danger" size="mini" icon="el-icon-delete" @click="delUserFn(scope.row.id)"></el-button>
                    <!-- 设置按钮 -->
                    <el-tooltip content="分配角色" placement="top" :enterable="false">
                        <el-button type="warning" size="mini" icon="el-icon-setting" @click="showRoleDialogFn(scope.row)"></el-button>
                    </el-tooltip>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="query.pagenum" :page-sizes="[1, 2, 3]" :page-size="query.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
    </el-card>
    <!-- 弹出对话框区域 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="resetAddFormFn">
        <el-form ref="addFormRef" label-width="80px" :model="addForm" :rules="addFormRules">
            <el-form-item label="用户名" prop="username">
                <el-input v-model="addForm.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input v-model="addForm.password" typ="passsdf"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="addForm.email"></el-input>
            </el-form-item>
            <el-form-item label="手机" prop="mobile">
                <el-input v-model="addForm.mobile"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="saveAddFormFn">确 定</el-button>
        </span>
    </el-dialog>

    <!-- 编辑  修改对话框区域 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="resetEditForm">
        <el-form ref="editFormRef" label-width="80px" :model="editForm" :rules="addFormRules">
            <el-form-item label="用户名">
                <el-input v-model="editForm.username" disabled></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="editForm.email"></el-input>
            </el-form-item>
            <el-form-item label="手机" prop="mobile">
                <el-input v-model="editForm.mobile"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="saveEditFormFn">确 定</el-button>
        </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="roleDialogVisible" width="50%">
        <p>用户名: {{ userInfo.username }}</p>
        <p>当前角色: {{ userInfo.role_name }}</p>
        <div>
            <!-- v-model选中哪个值就是哪个值 -->
            <el-select v-model="selectedRoleId" placeholder="请选择">
                <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id">
                </el-option>
            </el-select>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="saveRoleFn">确 定</el-button>
        </span>
    </el-dialog>
</div>
</template>

<script>
export default {
    data() {
        // 邮箱正则  rule 规则 value 数据 cb 回调
        const checkEmail = (rule, value, callback) => {
            const reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
            if (!reg.test(value)) {
                return callback(new Error("邮箱格式不对"));
            }
            callback(); // 校验通过
        };

        // 手机号正则
        const checkMobile = (rule, value, callback) => {
            const reg = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
            if (!reg.test(value)) {
                return callback(new Error("手机格式不对"));
            }
            callback(); // 校验通过
        };

        return {
            // 获取用户列表的参数对象
            query: {
                query: "", // 查询关键字
                pagenum: 1, // 当前页码
                pagesize: 4, // 每页数据条数
            },
            userList: [],
            total: 0, // 总条数
            addDialogVisible: false, // 默认隐藏
            addForm: {
                username: "",
                password: "",
                email: "",
                mobile: "",
            },
            // 添加用户校验规则
            addFormRules: {
                username: [{
                        required: true,
                        message: "用户名不能为空",
                        trigger: "blur",
                    },
                    {
                        min: 3,
                        max: 10,
                        message: "长度在3到10之间",
                        trigger: "blur",
                    },
                ],
                password: [{
                    required: true,
                    message: "密码不能为空",
                    trigger: "blur",
                }, ],
                email: [{
                        required: true,
                        message: "邮箱不能为空",
                        trigger: "blur",
                    },
                    {
                        validator: checkEmail,
                        trigger: "blur",
                    },
                ],
                mobile: [{
                        required: true,
                        message: "手机号不能为空",
                        trigger: "blur",
                    },
                    {
                        validator: checkMobile,
                        trigger: "blur",
                    },
                ],
            },
            // 控制修改用户对话框的显示与隐藏
            editDialogVisible: false,
            editForm: {}, // 查询到的用户信息对象
            roleDialogVisible: false,
            userInfo: {}, // 用户信息
            rolesList: [], // 角色列表信息
            selectedRoleId: null,
        };
    },
    // 钩子函数
    created() {
        this.getUserList();
    },
    // 功能函数
    methods: {
        // 获取用户信息
        async getUserList() {
            const {
                data: res
            } = await this.$http.get("users", {
                params: this.query,
            });

            if (res.meta.status !== 200) {
                return this.$message.error("获取用户列表失败!");
            }
            this.userList = res.data.users;
            this.total = res.data.total;
            console.log(res);
        },
        // 每页条数改变事件
        handleSizeChange(size) {
            console.log(size);
            this.query.pagesize = size;
            this.getUserList();
        },
        // 当前页改变事件
        handleCurrentChange(page) {
            console.log(page);
            this.query.pagenum = page;
            this.getUserList();
        },
        // 判断用户列表数据 是否接收到
        async userStateFn(row) {
            console.log(row);
            // 同步到数据库 接口
            const {
                data: res
            } = await this.$http.put(
                `users/${row.id}/state/${row.mg_state}`
            );
            if (res.mete.status !== 200) {
                this.$message.error(res.meta.msg);
                row.mg_state = !row.mg_state;
            }
            this.$message.success(res.meta.msg);
        },
        // 监听添加用户的关闭事件
        resetAddFormFn() {
            this.$refs.addFormRef.resetFields();
        },
        // 点击确定前预校验
        saveAddFormFn() {
            this.$refs.addFormRef.validate(async (valid) => {
                if (!valid) return console.log("校验失败");
                // console.log('ajax'); 成功发ajax请求
                const {
                    data: res
                } = await this.$http.post("users", this.addForm);
                if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
                // 关闭对话框 如果创建成功了 说明页面中表格数据变旧了
                this.addDialogVisible = false;
                // 重新获取最新数据
                this.getUserList();
                // 提示修改成功
                this.$message.success("更新用户信息成功！");
            });
        },
        // 编辑按钮
        async showEditDialog(id) {
            this.editDialogVisible = true;
            const {
                data: res
            } = await this.$http.get(`users/${id}`);
            if (res.meta.status !== 200) {
                return this.$message.error("查询当前用户失败");
            }
            console.log(res);
            this.editForm = res.data;
        },
        // 重置编辑表单 取消按钮
        resetEditForm() {
            this.$refs.editFormRef.resetFields();
        },
        // 确定按钮   保存修改后的数据
        saveEditFormFn() {
            // 预校验
            this.$refs.editFormRef.validate(async (valid) => {
                if (!valid) return console.log("校验失败");
                const {
                    data: res
                } = await this.$http.put(
                    `users/${this.editForm.id}`, {
                        email: this.editForm.email,
                        mobile: this.editForm.mobile,
                    }
                );
                if (res.meta.status !== 200) return this.$message.error("更新失败");
                this.$message.success("更新成功");
                // 重新获取一次数据
                this.getUserList();
                this.editDialogVisible = false;
            });
        },
        // 删除列表信息  根据id来删除
        delUserFn(id) {
            console.log(id);
            this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning",
                })
                .then(async () => {
                    const {
                        data: res
                    } = await this.$http.delete(`users/${id}`);
                    if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
                    this.$message.success(res.meta.msg);
                    this.getUserList();
                })
                .catch(() => {
                    this.$message({
                        type: "info",
                        message: "已取消删除",
                    });
                });
        },
        async showRoleDialogFn(row) {
            this.roleDialogVisible = true;
            console.log(row);
            this.userInfo = row;
            const {
                data: res
            } = await this.$http.get("roles");
            if (res.meta.status !== 200) return this.$message.error("获取角色失败");
            this.rolesList = res.data;
        },
        async saveRoleFn() {
            if (!this.selectedRoleId) {
                return this.$message.error("请选择要分配的角色！");
            }
            const {
                data: res
            } = await this.$http.put(
                `users/${this.userInfo.id}/role`, {
                    rid: this.selectedRoleId,
                }
            );
            if (res.meta.status !== 200) {
                return this.$message.error("更新角色失败！");
            }

            this.$message.success("更新角色成功！");
            this.roleDialogVisible = false;
            this.getUserList();
            this.selectedRoleId = null; // 重置选中的角色id
        },
    },
    computed: {},
};
</script>

<style>
</style>
