<template>
  <div v-if="visible" >
    <el-dialog

      id="dialog"
      :title="title"
      :visible.sync="visible"
      :before-close="handleClose"
      :close-on-click-modal="false"
    >
      <el-form v-loading="loading" ref="form" :model="entity" label-width="20%" >
        <el-form-item prop="id">
          <el-input v-model="entity.id" style="display: none"></el-input>
        </el-form-item>
        <el-form-item
          prop="roleName"
          label="角色名"
          :rules="[
      {required:true,message:'请输入角色名',trigger:'blur'}
    ]">
          <el-input v-model="entity.roleName" style="width: 80%"></el-input>
        </el-form-item>
        <el-form-item
          label="权限"
          >
          <el-tree
            ref="tree"
            style="width: 80%"
            :data="treeData"
            :default-checked-keys="checkedTree"
            show-checkbox
            node-key="id"
            highlight-current
            default-expand-all
            :check-strictly="true"
          >
            <span slot-scope="{ node, data }">
              <span>
                <el-tag v-if="data.type===1" size="mini">菜单</el-tag>
                <el-tag v-if="data.type===2" size="mini" type="warning">按钮</el-tag>
              </span>
              {{data.label}}
            </span>
          </el-tree>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button :loading="sendLoading" type="primary" @click="submit('form')">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  const updateUrl = '/system/sysRole/update';
  const addUrl = '/system/sysRole/insert';
  export default {
    name: "SysRoleModal",
    data() {
      return {
        loading:false,
        visible: false,
        sendLoading:false,
        title:'',
        requestUrl:'',
        entity:{},
        //是否是新增记录
        isAdd:true,
        treeData:[],
        checkedTree:[],
        uploadPercent:0
      }
    },
    methods: {
      getTreeData(roleId){
        var that = this;
        that.loading = true
        that.$get('/system/sysRole/getPermissionTree?roleId='+roleId).then(res => {
          that.loading = false
          //排序
          var menus = res.data.currentMenus.sort(function(a,b){
            if(a.sort<b.sort){
              return -1;
            }else if(a.sort>b.sort){
              return 1;
            }
            return 0;
          });
          this.treeData = this.makeTreeData(menus,0);
          this.checkedTree = res.data.roleMenuIds;
        })
      },
      submit(formName){
        var that = this;
        this.$refs[formName].validate((valid) => {
          if (valid) {
            that.getCheckedTree();
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
        that.requestUrl = entity?updateUrl:addUrl;
        //转一下，不然表格中的值要跟着变
        var container = JSON.stringify(entity ? entity : {id:''});
        that.entity = JSON.parse(container);
        this.getTreeData(that.entity.id);
        that.title = entity?'修改':'添加';
        that.visible = true;
      },
      handleClose(done) {
        this.visible = false;
        this.uploadPercent = 0;
        done()
      },
      makeTreeData(menus,parentId){
        var res = [];
        for (var menu of menus){
          if(menu.parentId === parentId){
            var tree = {
              id:menu.id,
              label:menu.title,
              type:menu.type,
              children:this.makeTreeData(menus,menu.id)
            };
            res.push(tree)
          }
        }
        return res;
      },
      getCheckedTree(){
        this.entity.menuIds = this.$refs.tree.getCheckedKeys();
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
