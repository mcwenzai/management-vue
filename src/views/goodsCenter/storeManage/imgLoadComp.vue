<template>
  <el-upload class="avatar-uploader" action="/admin/system/sysFile/uploadImg" :show-file-list="false"
    :on-success="(res, file) => uploadSuccess(res, file, this.title)"
    :before-upload="(file) => uploadBefore(file, 'img', 3)">
    <el-tooltip class="item" effect="dark" content="点击可上传修改" placement="top" :enterable="false">
      <el-image v-if="form[title]" class="sample-img" :src="form[title]" fit="fill" />
      <i v-else class="el-icon-plus avatar-uploader-icon" />
    </el-tooltip>
  </el-upload>
</template>
<script>
  export default {
    data() {
      return {};
    },
    props: ["form", "title"],
    methods: {
      uploadBefore(file, type, limit) {
        if (type === "img") {
          const pic = ["image/jpeg", "image/jpg", "image/png"];
          const isPic = pic.indexOf(file.type) > -1;
          if (!isPic) {
            this.$message.error("仅支持jpg/png格式");
            return false;
          }
        }
        const isLt = file.size / 1024 / 1024 < limit;
        if (!isLt) {
          this.$message.error("文件大小不能超过 " + limit + "MB!");
          return false;
        }
        return true;
      },
      uploadSuccess(res, file, filedName) {
        if (res.success === 1) {
          this.form[filedName] = res.data.url;
        } else {
          this.$message({
            type: "error",
            message: res.msg,
          });
        }
      },
    },
  };
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
