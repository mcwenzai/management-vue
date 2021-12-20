
<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" @close="detailDialogClose">
    <el-form ref="versionFormRef" :rules="rules" :model="form">
      <el-form-item label="客户端:" :label-width="formLabelWidth" prop="type">
        <el-radio-group v-model="form.type">
          <el-radio :label="CLIENT_TYPE_ID.ANDROID">Android</el-radio>
          <el-radio :label="CLIENT_TYPE_ID.IOS">IOS</el-radio> 
        </el-radio-group>
      </el-form-item>
      <el-form-item label="版本号名称:" :label-width="formLabelWidth" prop="versionName">
        <el-input v-model="form.versionName" placeholder="请输入版本号名称" autocomplete="off" />
      </el-form-item>
      <el-form-item label="数字版本号:" :label-width="formLabelWidth" prop="versionCode">
        <el-input v-model.number="form.versionCode" type="number" placeholder="请输入数字版本号" :max="1000" :maxlength="4" autocomplete="off" />
      </el-form-item>
      <el-form-item label="更新描述:" :label-width="formLabelWidth" prop="versionDescribe">
        <el-input v-model="form.versionDescribe" placeholder="请输入更新描述" type="textarea" autocomplete="off" />
      </el-form-item>
      <el-form-item label="版本安卓包:" :label-width="formLabelWidth" prop="versionUrl">
        <template>
          <el-upload class="avatar-uploader" action="/admin/system/sysFile/uploadImg" :show-file-list="false" :on-success="(res,file)=>uploadSuccess(res,file,'versionUrl')" :before-upload="(file)=>uploadBefore(file,form.type,3)">
            <el-tooltip class="item" effect="dark" content="点击可上传修改" placement="top" :enterable="false">
              <i class="el-icon-plus avatar-uploader-icon" />
            </el-tooltip>
          </el-upload>
          <el-input v-model="form.versionUrl" style="display: none"  />
          {{form.versionUrl}}
        </template>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="save">保 存</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { insertAppVersion, updateAppVersion } from '@/api/appAdmin'
import { CLIENT_TYPE_ID } from '@/utils/constant'
export default {
  name: 'VersionAdminDetailDialog',
  data() {
    const checkVersionCode = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('请输入数字版本号'));
        }
        if (value > 1000) {
          callback(new Error('最大值为1000'));
        } else {
          callback();
        }
      };
    return {
      dialogVisible: false,
      formLabelWidth: '120px',
      uploadLoading: null,
      loading: false,
      form: {
        id: '',
        type: 0,
        versionCode: null,
        versionName: '',
        versionDescribe: '',
        versionUrl: ''
      },
      rules: {
        type: [
          { required: true, message: '请选择客户端类型', trigger: 'change' }
        ],
        versionName: [
          { required: true, message: '请输入版本号名称', trigger: 'blur' }
        ],
        versionCode: [
          { required: true, validator: checkVersionCode, trigger: 'blur' },
        ],
        versionDescribe: [
          { required: true, message: '请输入更新描述', trigger: 'blur' },
          { max: 200, message: "长度最大200个字符", trigger: "blur" }
        ],
        versionUrl: [
          { required: true, message: '请选择对应的版本安装包', trigger: 'blur' }
        ]
      },
      CLIENT_TYPE_ID
    }
  },
  computed: {
    dialogTitle() {
      return this.form.id ? '编辑版本' : '新建版本'
    }
  },
  methods: {
    resetVerifyForm() {
      this.$refs.versionFormRef.resetFields()
    },
    detailDialogClose() {
      this.form.id = ''
      setTimeout(() => {
        this.resetVerifyForm()
      }, 0)
    },
    save() {
      this.$refs.versionFormRef.validate(async valid => {
        if (valid) {
          if (this.form.id) {
            await updateAppVersion(this.form)
          } else {
            await insertAppVersion(this.form)
          }
          this.$emit('updateSuccess')
          this.dialogVisible = false
        }
      })
    },
    uploadBefore(file, type, limit) {
      const fileSuffix = file.name.substring(file.name.length-3);
      if (type == 0){
          if (fileSuffix != "apk"){
            this.$message.error('仅支持安卓版本安装包')
            return false
          }
      } else {
        if (fileSuffix != "ipa"){
          this.$message.error('仅支持iOS版本安装包')
          return false
        }
      }
      this.openFullScreen()
      return true
    },
    uploadSuccess(res, file, filedName) {
      this.uploadLoading.close();
      if (res.success === 1) {
        this.form[filedName] = res.data.url
      } else {
        this.$message({
          type: 'error',
          message: res.msg
        })
      }
    },
    openFullScreen() {
        this.uploadLoading = this.$loading({
        lock: true,
        text: '正在上传安装包，请稍等...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
    }
  }
}

</script>
<style lang='scss' scoped>
.sample-img {
  width: 74px;
  height: 74px;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 74px;
  height: 74px;
  line-height: 74px;
  text-align: center;
  border: 1px solid #dcdfe6;
}
</style>
