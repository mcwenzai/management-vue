<template>
  <div class="brand-admin">
    <el-container>
      <el-header class="operate-part">
        <div class="flex">
          <div class="title">编辑事业部</div>
        </div>
        <span class="buttons">
          <el-button @click="goBack">取消</el-button>
          <el-button type="primary" @click="submit()"> 保存 </el-button>
        </span>
      </el-header>
      <el-main>
        <el-form ref="form" :rules="rules" :model="form" label-width="140px">
          <el-form-item label="事业部名称" required prop="deptName">
            <el-input v-model="form.deptName" clearable maxlength="10" style="width: 200px" />
          </el-form-item>
          <el-form-item label="负责人" required prop="employeeId">
            <el-select v-model="form.employeeId" filterable>
              <el-option v-for="item in userList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" required prop="status">
            <el-radio-group v-model="form.status">
              <el-radio :label="1">停用</el-radio>
              <el-radio :label="0">启用</el-radio>
            </el-radio-group>
          </el-form-item>
          <div class="title" style="padding: 20px 45px 30px">编辑负责人</div>
          <form-item :area-tree="areaTree" />
        </el-form>
      </el-main>
    </el-container>
  </div>
</template>

<script>
  import {
    getListByRole,
    getOaDepartmentById,
    getOaAreaTree,
    oaDepartmentUpdate,
    getOaEmployeeByRole
  } from '@/api/oaAdmin'
  import formItem from './formItem.vue'

  export default {
    name: 'Edit',
    components: {
      formItem
    },
    data() {
      return {
        value: '',
        form: {
          id: '',
          deptName: '',
          employeeId: '',
          status: 0
        },
        rules: {
          deptName: [{
            required: true,
            message: '请输入事业部名称',
            trigger: 'blur'
          }],
          employeeId: [{
            required: true,
            message: '请选择负责人',
            trigger: 'change'
          }]
        },
        userList: [],
        areaTree: []
      }
    },
    created() {
      this.form.id = this.$route.query.id
      this.getDatail()
      this.getOaAreaTree()
      this.getUserList()
    },
    methods: {
      getDatail() {
        getOaDepartmentById(this.form.id).then((res) => {
          if (res.success === 1) {
            this.form.deptName = res.data.deptName
            this.form.employeeId = res.data.employeeId
            this.form.status = res.data.status ? res.data.status : 0
          }
        })
      },
      getOaAreaTree() {
        getOaAreaTree({
          deptId: this.form.id
        }).then((res) => {
          console.log(res)
          if (res.success === 1) {
            const areaTree = res.data
            this.getOaEmployeeByRole().then((data) => {
              this.setAreaTree(areaTree, data)
            })
          }
        })
      },
      setAreaTree(children, roleList) {
        children.forEach((item) => {
          for (const k in roleList) {
            if (Number(item.roleId) === Number(k) && Number(item.level) !== 4) {
              this.$set(item, 'roleList', roleList[k])
            }
          }
          if (item.children.length) {
            this.setAreaTree(item.children, roleList)
          }
        })
        this.areaTree = children
      },
      getOaEmployeeByRole() {
        return new Promise((resolve, reject) => {
          getOaEmployeeByRole().then((res) => {
            resolve(res.data)
          })
        })
      },
      getUserList() {
        getListByRole({
          roleId: 1
        }).then((res) => {
          if (res.success === 1) {
            this.userList = res.data
          }
        })
      },
      resetVerifyForm() {
        this.$refs.form.resetFields()
      },
      goBack() {
        this.$router.go(-1)
      },
      submit() {
        this.$refs.form.validate((valid) => {
          if (valid) {
            oaDepartmentUpdate(this.form).then((res) => {
              if (res.success === 1) {
                this.$message.success(res.msg)
                this.onBack()
              }
            })
          }
        })
      }
    }
  }
</script>

<style lang='scss' scoped>
  .brand-admin {
    .operate-part {
      display: flex;
      justify-content: space-between;
      padding: 30px 20px 20px 65px;
      text-align: center;

      .el-input {
        width: 200px;
      }
    }
  }

  .buttons {
    margin-right: 20px;
  }
</style>
