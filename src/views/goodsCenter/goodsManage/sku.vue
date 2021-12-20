
<template>
  <!-- :rules="[{ required: true, message: "请上传图片", trigger: "blur" }]" -->
  <div>
    <el-form-item :label="'SKU' + (index + 1)" :label-width="formLabelWidth">
      <span class="buttons">
        <el-button v-if="index" @click="subSku()" icon="el-icon-minus">
        </el-button>
        <el-button @click="addSku()" type="primary" icon="el-icon-plus"> </el-button>
      </span>
    </el-form-item>
    <el-form-item
      label="缩略图:"
      :label-width="formLabelWidth"
      :prop="'goodsSkuList.' + index + '.imgUrl'"
      :rules="[{ required: true, message: '请上传缩略图', trigger: 'change' }]"
    >
      <el-input style="display: none" />
      <el-upload
        action="/admin/system/sysFile/uploadImg"
        :auto-upload="true"
        class="avatar-uploader"
        :show-file-list="false"
        :on-success="(res, file) => uploadSuccess(res, file, 'logoUrl')"
        :before-upload="(file) => uploadBefore(file, 'img', 3)"
      >
        <img
          v-if="form.goodsSkuList[index].imgUrl"
          :src="form.goodsSkuList[index].imgUrl"
          class="avatar"
        />
        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
      </el-upload>
      <el-dialog :visible.sync="dialogVisible">
        <img width="100%" :src="dialogImageUrl" alt="" />
      </el-dialog>
    </el-form-item>
    <el-form-item
      :label="form.type === GOODS_TYPE[1].value ? '规格:' : '规格包装信息:'"
      :key="'g' + index"
      :label-width="formLabelWidth"
      :prop="'goodsSkuList.' + index + '.name'"
      :rules="[
        { required: true, message: '请输入规格信息', trigger: 'blur' },
      ]"
    >
      <!-- { max: 50, message: "长度最大50个字符", trigger: "blur" },           -->
      <el-input
        v-if="!readOnly"
        v-model="form.goodsSkuList[index].name"
        :maxlength="20"
        :placeholder="form.type === GOODS_TYPE[1].value ? '请输入规格:' : '请输入规格包装信息:'"
        autocomplete="off"
      />
      <span v-else>{{ form.goodsSkuList[index].name }}</span>
    </el-form-item>
    <el-form-item
      label="当量:"
      :key="'d' + index"
      :label-width="formLabelWidth"
      :prop="'goodsSkuList.' + index + '.effectRatio'"
      :rules="[
        { required: true, message: '请输入当量', trigger: 'blur' },
      ]"
      v-if="form.type === GOODS_TYPE[1].value"
    >
      <el-input
        v-if="!readOnly"
        v-model="form.goodsSkuList[index].effectRatio"
        :maxlength="20"
        placeholder="请输入当量"
        autocomplete="off"
      />
      <span v-else>{{ form.goodsSkuList[index].effectRatio }}</span>
    </el-form-item>
  </div>
</template>

<script>
import { GOODS_TYPE } from "@/utils/constant";
export default {
  data() {
    return {
      GOODS_TYPE,
      // 上传图片
      dialogImageUrl: "",
      dialogVisible: false,
      disabled: false,
      uploadDisabled: false,
    };
  },
  props: ["logoUrl", "readOnly", "formLabelWidth", "form", "index"],
  mounted() {},
  methods: {
    addSku() {
      // console.log("发送事件", this.form);
      this.$emit("addSku");
    },
    subSku() {
      // console.log("发送删除事件");
      this.$emit("subSku");
    },
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
      this.uploadDisabled = true;
      this.form.goodsSkuList[this.index].imgUrl = res.data.url;
      this.$emit('validate', `goodsSkuList.${this.index}.imgUrl`);
      // console.log("uploadSuccess", res.data.url);
    },
    // 删除图片
    handleRemove(file, fileList) {
      this.uploadDisabled = false;
      // this.hideUpload = fileList.length >= this.limitCount;
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    handleDownload(file) {
      console.log(file);
    },
  },
};
</script>
<style lang='scss'>
.buttons {
  position: absolute;
  right: 0px;
}
.el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
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
