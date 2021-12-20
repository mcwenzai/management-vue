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
          prop="tag"
          label="配置标识"
          :rules="[
          {required:true,message:'请输入配置标识',trigger:'blur'}
          ]"
        >
          <el-input :disabled="!isAdd" v-model="entity.tag" style="width: 80%"></el-input>
        </el-form-item>

        <el-form-item
          prop="name"
          label="配置名称"
          :rules="[
          {required:true,message:'请输入配置名称',trigger:'blur'}
          ]"
        >
          <el-input v-model="entity.name" style="width: 80%"></el-input>
        </el-form-item>
        <el-form-item
          prop="param"
          label="配置参数"
        >
          <vue-json-editor style="width: 80%" v-model="param" @json-change="onJsonChange"></vue-json-editor>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button :loading="sendLoading" type="primary" @click="submit('form')">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  import vueJsonEditor from 'vue-json-editor'

  export default {
    name: "SysConfigModal",
    components: {vueJsonEditor},
    data() {
      return {
        visible: false,
        sendLoading: false,
        title: '',
        requestUrl: '',
        entity: {},
        //是否是新增记录
        isAdd: true,
        param: {},
        defaultProps: {
          children: 'children',
          label: 'label'
        }
      }
    },
    created() {

    },
    methods: {
      submit(formName) {
        var that = this;
        this.$refs[formName].validate((valid) => {
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
        that.requestUrl = entity ? '/system/sysConfig/update' : '/system/sysConfig/insert';
        //转一下，不然表格中的值要跟着变
        var container = JSON.stringify(entity ? entity : {param: "{}"});
        that.entity = JSON.parse(container);
        that.param = JSON.parse(that.entity.param);
        that.title = entity ? '修改' : '添加';
        that.visible = true;
      },
      handleClose(done) {
        this.visible = false;
        this.uploadPercent = 0;
        done()
      },
      onJsonChange(value) {
        this.entity.param = JSON.stringify(value)
      }
    }
  }
</script>

<style scoped>

</style>
