<template>
  <div v-if="visible">
    <el-dialog
      :title="title"
      :visible.sync="visible"
      :before-close="handleClose"
      :close-on-click-modal="false"
    >
      <el-form ref="form" :model="entity" label-width="20%">
        <el-form-item
          prop="id"
        >
          <el-input v-model="entity.id" style="display: none"></el-input>
        </el-form-item>
        <el-form-item
          prop="parentId"
          label="父菜单ID"
          :rules="[
      {required:true,message:'缺少父菜单ID',trigger:'blur'}
    ]">
          <el-input disabled="disabled" v-model="entity.parentId" style="width: 80%"></el-input>
        </el-form-item>

        <el-form-item
          prop="title"
          label="菜单名称"
          :rules="[
      {required:true,message:'请输入菜单名称',trigger:'blur'}
    ]">
          <el-input v-model="entity.title" style="width: 80%"></el-input>
        </el-form-item>

        <el-form-item
          prop="url"
          label="URL"
          :rules="[
      {required:true,message:'请输入菜单URL',trigger:'blur'}
    ]">
          <el-input v-model="entity.url" style="width: 80%"></el-input>
        </el-form-item>

        <el-form-item
          prop="component"
          label="组件路径">
          <el-input v-model="entity.component" style="width: 80%"></el-input>
        </el-form-item>
        <el-form-item
          prop="icon"
          label="图标">
          <el-input v-model="entity.icon" style="width: 20%"></el-input>
          <el-button @click="showIcon(iconStyle)">选择图标</el-button>
          <div :style="iconStyle" class="icons-container">
            <div class="grid">
              <div v-for="item of svgIcons" :key="item" @click="chooseIcon(item)">
                <div class="icon-item">
                  <svg-icon :icon-class="item" class-name="disabled"/>
                  <span>{{ item }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item
          prop="type"
          label="类型"
          :rules="[
      {required:true,message:'请选择菜单类型',trigger:'blur'}
    ]">
          <el-radio v-model="entity.type" :label="1">菜单</el-radio>
          <el-radio v-model="entity.type" :label="2">按钮</el-radio>
        </el-form-item>
        <el-form-item
          prop="permission"
          label="权限标识">
          <el-input v-model="entity.permission" style="width: 80%"></el-input>
        </el-form-item>
        <el-form-item
          prop="sort"
          label="排序">
          <el-input v-model="entity.sort" style="width: 80%"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button :loading="sendLoading" type="primary" @click="submit('form')">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>
<script>
  const updateUrl = '/system/sysMenu/update';
  const addUrl = '/system/sysMenu/insert';
  import svgIcons from '../../icons/svg-icons'

  export default {
    name: "SysMenuModal",
    data() {
      return {
        svgIcons,
        count: 10,
        visible: false,
        sendLoading: false,
        title: '',
        requestUrl: '',
        entity: {},
        //是否是新增记录
        isAdd: true,
        iconStyle:'display:none'
      }
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
        //转一下，不然表格中的值要跟着变
        var container = JSON.stringify(entity ? entity : {icon:null});
        that.entity = JSON.parse(container);
        that.entity.parentId = that.entity.parentId ? that.entity.parentId : 0;
        that.isAdd = !that.entity.id;
        that.requestUrl = that.entity.id ? updateUrl : addUrl;
        that.title = that.entity.id ? '修改' : '添加';
        that.visible = true;
      },
      handleClose(done) {
        this.visible = false;
        done()
      },
      chooseIcon(icon) {
        this.entity.icon = icon
      },
      showIcon(style){
        if(style.indexOf('none')>-1){
          this.iconStyle = 'display:block'
        }
        if(style.indexOf('block')>-1){
          this.iconStyle = 'display:none'
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .icons-container {
    margin: 10px 20px 0;
    overflow: hidden;

    .grid {
      position: relative;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }

    .icon-item {
      margin: 20px;
      height: 85px;
      text-align: center;
      width: 100px;
      float: left;
      font-size: 30px;
      color: #24292e;
      cursor: pointer;
    }

    span {
      display: block;
      font-size: 16px;
      margin-top: 10px;
    }

    .disabled {
      pointer-events: none;
    }
  }
</style>
