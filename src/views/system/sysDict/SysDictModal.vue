<template>
  <div v-if="visible">

    <el-dialog
      id="dialog"
      :title="title"
      :visible.sync="visible"
      :before-close="handleClose"
      :close-on-click-modal="false"
    >
      <el-form ref="form" :model="entity" label-width="20%">
        <el-form-item prop="id">
          <el-input v-model="entity.id" style="display: none"></el-input>
        </el-form-item>

        <el-form-item
          prop="type"
          label="字典类型"
          :rules="[
                                {required:true,message:'请输入字典类型',trigger:'blur'}]">
          <el-input :disabled="!isAdd" v-model="entity.type" style="width: 80%"></el-input>
        </el-form-item>

        <el-form-item
          prop="desc"
          label="类型描述"
          :rules="[
                                {required:true,message:'请输入类型描述',trigger:'blur'}]">
          <el-input v-model="entity.desc" style="width: 80%"></el-input>
        </el-form-item>

        <el-form-item
          prop="code"
          label="字典编码"
          :rules="[
                                {required:true,message:'请输入字典编码',trigger:'blur'}]">
          <el-input v-model="entity.code" style="width: 80%"></el-input>
        </el-form-item>

        <el-form-item
          prop="text"
          label="字典描述"
          :rules="[
                                {required:true,message:'请输入字典描述',trigger:'blur'}]">
          <el-input v-model="entity.text" style="width: 80%"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button :loading="sendLoading" type="primary" @click="submit('form')">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  import {Loading} from 'element-ui';

  export default {
    name: "SysDictModal",
    data() {
      return {
        visible: false,
        sendLoading: false,
        title: '',
        requestUrl: '',
        entity: {},
        //是否是新增记录
        isAdd: true,
      }
    },
    created() {

    },
    methods: {
      submit(formName) {
        var that = this;
        this.$refs
          [formName].validate((valid) => {
          if (valid) {
            that.sendLoading = true;
            that.$postJson(that.requestUrl, that.entity).then(res => {
              that.sendLoading = false;
              if (res.success === 1) {
                this.$message({
                  type: 'success',
                  message: res.msg
                });
                that.visible = false;
                that.$emit('reload')
              }
            })
          }
        });
      },
      openModal(entity, isSame) {
        var that = this;
        that.isAdd = !entity;
        that.requestUrl = entity ? '/system/sysDict/update' : '/system/sysDict/insert';
        //转一下，不然表格中的值要跟着变
        var container = JSON.stringify(entity ? entity : isSame ? isSame : {});
        that.entity = JSON.parse(container);
        that.title = entity ? '修改' : '添加';
        that.visible = true;
      },
      handleClose(done) {
        this.visible = false;
        this.uploadPercent = 0;
        done()
      }
    }
  }
</script>

<style scoped>

</style>
