<template>
  <div class="select-area">
    <el-dialog title="编辑" :visible.sync="dialogVisible" width="36%">
      <div class="content">
        <el-form ref="form" :model="form" :rules="formRules" label-width="80px">
          <el-form-item label="编辑位置">
            <div v-if="dialogVisible" id="app">
              <el-cascader v-model="form.selectedOptions" size="large" :options="options" @change="handleChange" />
            </div>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio :label="0">启动</el-radio>
              <el-radio :label="1">停用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmSelectArea">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {
    regionData
  } from 'element-china-area-data'
  export default {

    components: {},
    data() {
      return {
        dialogVisible: false,
        options: regionData,
        userInfo: null,
        form: {
          selectedOptions: [],
          status: 0
        },
        formRules: {
          status: [{
            required: true,
            message: '请选择状态',
            trigger: 'blur'
          }]
        }
      }
    },
    methods: {
      handleChange(value) {
        console.log(value)
      },
      confirmSelectArea() {
        this.$refs.form.validate(valid => {
          if (valid) {
            this.dialogVisible = false
            this.$emit('confirmSelectArea', {
              selectedOptions: this.form.selectedOptions,
              id: this.userInfo.id,
              status: this.form.status
            })
          }
        })
      }
    }
  }
</script>
<style lang='scss' scoped>
  .select-area {
    .content {
      height: 240px;

      #app,
      .el-cascader {
        width: 100%;
      }
    }
  }
</style>
