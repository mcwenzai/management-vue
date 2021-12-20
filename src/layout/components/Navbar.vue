<template>
  <div class="navbar">
    <hamburger
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />
    <breadcrumb class="breadcrumb-container" />
    <div class="right-menu">
      <!-- <span
        style="color: #898c93;font-weight: bold;position: relative; top: -5px;"
        >{{ userInfo.nickname }}</span
      > -->
      <el-dropdown class="avatar-container" trigger="click" style="z-index:1">
        <div class="avatar-wrapper">
          <span
            style="color: #898c93;font-weight: bold;position: relative; top: -5px;"
            >{{ userInfo.nickname }}</span
          >
          <!-- <img :src="userInfo.headimg?userInfo.headimg:'/images/default_head_img.jpg'" class="user-avatar"> -->
          <i class="el-icon-caret-bottom" style="margin-top:-6px" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <!-- <a
            target="_blank"
            :href="
              userInfo.headimg
                ? userInfo.headimg
                : '/images/default_head_img.jpg'
            "
          >
            <el-dropdown-item>查看头像</el-dropdown-item>
          </a> -->
          <a @click="openModal('password')">
            <el-dropdown-item>修改密码</el-dropdown-item>
          </a>
          <!-- <a @click="openModal('headimg')">
            <el-dropdown-item>修改头像</el-dropdown-item>
          </a> -->
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">退出</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-dialog
      :title="dialogTitle"
      :visible="dialogVisible"
      :close-on-click-modal="false"
      :before-close="handleClose"
      width="30%;"
      :append-to-body="true"
    >
      <el-form ref="form" v-loading="loading">
        <div v-if="dialogType === 'password'">
          <el-form-item prop="originPassword">
            <el-input
              v-model="originPassword"
              autocomplete="off"
              type="password"
              placeholder="请输入原密码"
            />
          </el-form-item>
          <el-form-item prop="newPassword">
            <el-input
              v-model="newPassword"
              autocomplete="off"
              type="password"
              placeholder="请输入新密码"
            />
          </el-form-item>
        </div>
        <div v-if="dialogType === 'headimg'">
          <el-form-item>
            <el-input v-model="userInfo.headimg" style="display: none" />
            <el-upload
              class="avatar-uploader"
              action="/admin/system/sysFile/uploadImg"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :on-progress="handleProgress"
              :before-upload="beforeAvatarUpload"
            >
              <img
                v-if="newHeadimg"
                style="width: 100%;height: 100%"
                :src="newHeadimg"
              />
              <i v-else class="el-icon-plus avatar-uploader-icon" />
            </el-upload>
          </el-form-item>
        </div>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button :loading="sendLoading" type="primary" @click="submit('form')"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Breadcrumb from "@/components/Breadcrumb";
import Hamburger from "@/components/Hamburger";
import variables from "@/styles/variables.scss";
import { updateSysUser } from "@/api/system";
export default {
  components: {
    Breadcrumb,
    Hamburger
  },
  computed: {
    ...mapGetters(["sidebar"]),
    variables() {
      return variables;
    }
  },
  data() {
    return {
      userInfo: {},
      loading: false,
      dialogVisible: false,
      dialogType: "",
      originPassword: "",
      newPassword: "",
      newHeadimg: "",
      dialogTitle: "",
      sendLoading: false
    };
  },
  created() {
    this.userInfo = JSON.parse(localStorage.getItem("userInfo"));
  },
  methods: {
    openModal(type) {
      this.dialogTitle = type === "password" ? "修改密码" : "修改头像";
      this.dialogType = type;
      this.newHeadimg = this.userInfo.headimg;
      this.dialogVisible = true;
    },
    toggleSideBar() {
      this.$store.dispatch("app/toggleSideBar");
    },
    async logout() {
      await this.$store.dispatch("user/logout");
      this.$router.push(`/login`);
    },
    handleProgress(event, file, fileList) {
      if (event.percent === 100) {
        this.loading = false;
      }
    },
    beforeAvatarUpload(file) {
      const pic = ["image/jpeg", "image/jpg", "image/png"];
      const isPic = pic.indexOf(file.type) > -1;
      if (!isPic) {
        this.$message.error("仅支持jpg/png格式");
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
        return false;
      }
      this.loading = true;
      return true;
    },
    handleAvatarSuccess(res, file) {
      this.newHeadimg = res.data.url;
    },
    handleClose(done) {
      Object.assign(this.$data, this.$options.data());
      this.dialogVisible = false;
      this.userInfo = JSON.parse(localStorage.getItem("userInfo"));
      done();
    },
    submit(formName) {
      const that = this;
      if (that.dialogType === "password" && !that.originPassword) {
        this.$message({
          type: "error",
          message: "请输入原密码"
        });
        return;
      }
      if (that.dialogType === "password" && !that.newPassword) {
        this.$message({
          type: "error",
          message: "请输入新密码"
        });
        return;
      }
      if (
        that.dialogType === "password" &&
        that.originPassword === that.newPassword
      ) {
        this.$message({
          type: "error",
          message: "新密码不可与原密码相同"
        });
        return;
      }
      if (that.dialogType === "headimg" && !that.newHeadimg) {
        this.$message({
          type: "error",
          message: "请选择图片"
        });
        return;
      }
      that.sendLoading = true;
      var entity = {
        id: that.userInfo.id,
        password: that.originPassword,
        newPassword: that.newPassword,
        headimg: that.newHeadimg
      };
      updateSysUser(entity).then(res => {
        that.sendLoading = false;
        if (res.success === 1) {
          let msg = res.msg;
          if (that.dialogType === "password") {
            that.$store.dispatch("user/logout");
            msg = "密码修改成功，请重新登录";
            setTimeout(function() {
              that.$router.push(`/login`);
            }, 1000);
          }
          if (that.dialogType === "headimg") {
            that.userInfo.headimg = that.newHeadimg;
            localStorage.setItem("userInfo", JSON.stringify(that.userInfo));
          }
          this.$message({
            type: "success",
            message: msg
          });
          that.dialogVisible = false;
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.navbar {
  height: 60px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 60px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    line-height: 60px;
    height: 100%;
    float: left;
  }

  .guide-container {
    line-height: 60px;
    height: 60px;
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 60px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          margin: 0 2px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}

.avatar-uploader .el-upload {
  border: 1px dashed #000000;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 200px;
  color: #8c939d;
  width: 500px;
  height: 100%;
  line-height: 200px;
  text-align: center;
}
</style>
