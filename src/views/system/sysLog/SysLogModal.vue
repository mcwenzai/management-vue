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
        <el-form-item
          prop="module"
          label="业务模块"
        >
          {{entity.module}}
        </el-form-item>

        <el-form-item
          prop="requestUrl"
          label="请求URL"
        >
          {{entity.requestUrl}}
        </el-form-item>

        <el-form-item
          prop="requestParam"
          label="请求参数"
        >
          {{entity.requestParam}}
        </el-form-item>

        <el-form-item
          prop="ip"
          label="IP地址"
        >
          {{entity.ip}}
        </el-form-item>

        <el-form-item
          prop="method"
          label="请求方法"
        >
          {{entity.method}}
        </el-form-item>

        <el-form-item
          prop="content"
          label="日志内容"
        >
          {{entity.content}}
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
  import {Loading} from 'element-ui';

  export default {
    name: "SysLogModal",
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
      openModal(entity) {
        var that = this;
        that.isAdd = !entity;
        that.requestUrl = entity ? '/system/sysLog/update' : '/system/sysLog/insert';
        //转一下，不然表格中的值要跟着变
        var container = JSON.stringify(entity ? entity : {headimg: ''});
        that.entity = JSON.parse(container);
        that.title = '详情'
        //that.title = entity ? '修改' : '添加';
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
