<template>
  <div v-if="visible">

    <el-dialog
      id="dialog"
      :title="title"
      :visible.sync="visible"
      :before-close="handleClose"
      :close-on-click-modal="false"
    >
      <el-form ref="form" :model="entity" label-width="20%" >
        <el-form-item prop="id">
          <el-input v-model="entity.id" style="display: none"></el-input>
        </el-form-item>
        <el-form-item
          prop="username"
          label="用户名"
          :rules="[
      {required:true,message:'请输入用户名',trigger:'blur'}
    ]">
          <el-input :disabled="!isAdd" v-model="entity.username" style="width: 80%"></el-input>
        </el-form-item>

        <el-form-item
          prop="password"
          label="密码"
          :rules="[
      {required:true,message:'请输入密码',trigger:'blur'}
    ]">
          <el-input type="password" v-model="entity.password" style="width: 80%"></el-input>
        </el-form-item>

        <el-form-item
          prop="nickname"
          label="昵称"
          :rules="[
      {required:true,message:'请输入昵称',trigger:'blur'}]"
        >
          <el-input v-model="entity.nickname" style="width: 80%"></el-input>
        </el-form-item>

        <el-form-item
          prop="headimg"
          label="头像">
          <el-input v-model="entity.headimg" style="display: none"></el-input>
          <el-upload
            class="avatar-uploader"
            action="/admin/system/sysFile/uploadImg"
            :show-file-list="false"
            :on-success="(res,file)=>uploadSuccess(res,file,'headimg')"
            :on-progress="uploadProgress"
            :before-upload="(file)=>uploadBefore(file,'img',2)">
            <img v-if="entity.headimg" :src="entity.headimg" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
          <el-progress style="width: 228px;" :percentage="uploadPercent"></el-progress>
        </el-form-item>

        <el-form-item
          prop="roleIds"
          label="角色">
          <el-checkbox-group style="width: 80%" @change="(val)=>changeRoleIds(val)" v-model="roleIds">
            <el-checkbox v-if="item.id!==1" :key="item.id" v-for="item in roleList" :label="item.id.toString()">{{item.roleName}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button :loading="sendLoading" type="primary" @click="submit('form')">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  import {Mixins} from '@/utils/mixins';
  export default {
    name: "SysUserModal",
    mixins:[Mixins],
    data() {
      return {
        visible: false,
        sendLoading:false,
        title:'',
        requestUrl:'',
        entity:{},
        //是否是新增记录
        isAdd:true,
        roleList:[],
        roleIds:[]
      }
    },
    created(){
      this.getRoleList()
    },
    methods: {
      changeRoleIds(val){
        this.entity.roleIds = val.toString()
      },
      getRoleList(){
        var that = this;
        that.$postJson('/system/sysRole/list',{}).then(res => {
          that.roleList = res.data.list
        })
      },
      submit(formName){
        var that = this;
        this.$refs[formName].validate((valid) => {
          if (valid) {
            that.sendLoading = true;
            that.$postJson(that.requestUrl,that.entity).then(res=>{
              that.sendLoading = false;
              if(res.success===1){
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
      openModal(entity){
        var that = this;
        that.isAdd = !entity;
        that.requestUrl = entity?'/system/sysUser/update':'/system/sysUser/insert';
        //转一下，不然表格中的值要跟着变
        var container = JSON.stringify(entity ? entity : {headimg:''});
        that.entity = JSON.parse(container);
        that.title = entity?'修改':'添加';
        that.roleIds = that.entity.roleIds?that.entity.roleIds.split(','):[];
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
  .avatar-uploader .el-upload {
    border: 1px dashed #000000;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>
