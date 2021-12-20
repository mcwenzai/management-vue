<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    @close="detailDialogClose"
  >
    <el-form ref="bannerCategoryFormRef" :rules="rules" :model="form">
      <el-form-item
        :label="
          form.type === APP_ADMIN_TYPE.CAROUSEL
            ? 'Banner名称:'
            : '分类导航名称:'
        "
        :label-width="formLabelWidth"
        prop="name"
      >
        <el-input
          v-model="form.name"
          :maxlength="form.type === APP_ADMIN_TYPE.CAROUSEL ? 20 : 4"
          :placeholder="placeholderTitle"
          autocomplete="off"
        />
      </el-form-item>
      <el-form-item
        :label="
          form.type === APP_ADMIN_TYPE.CAROUSEL ? 'Banner图:' : '分类导航图标:'
        "
        :label-width="formLabelWidth"
        prop="imgUrl"
      >
        <el-input v-model="form.imgUrl" style="display: none" />
        <el-upload
          class="avatar-uploader"
          action="/admin/system/sysFile/uploadImg"
          :show-file-list="false"
          :on-success="(res, file) => uploadSuccess(res, file, 'imgUrl')"
          :before-upload="file => uploadBefore(file, 'img', 3)"
        >
          <el-tooltip
            class="item"
            effect="dark"
            content="点击可上传修改"
            placement="top"
            :enterable="false"
          >
            <el-image
              v-if="form.imgUrl"
              class="sample-img"
              :src="form.imgUrl"
              fit="fill"
            />
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-tooltip>
        </el-upload>
      </el-form-item>
      <el-form-item
        label="跳转类型:"
        :label-width="formLabelWidth"
        prop="jumpType"
      >
        <el-select v-model="form.jumpType" placeholder="请选择" filterable>
          <el-option
            v-for="item in BANNER_JUMP_TYPE"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="跳转链接:"
        :label-width="formLabelWidth"
        prop="jumpUrl"
      >
        <el-input
          v-model="form.jumpUrl"
          :maxlength="100"
          placeholder="请输入跳转链接"
          autocomplete="off"
        />
      </el-form-item>
      <el-form-item label="权重:" :label-width="formLabelWidth">
        <el-input-number v-model="form.sort" :min="1" :max="99" />
      </el-form-item>
      <el-form-item
        label="是否展示:"
        :label-width="formLabelWidth"
        prop="isDisplay"
      >
        <el-radio-group v-model="form.isDisplay">
          <el-radio :label="BANNER_CATEGORY_ISDISPLAY.SHOW">是</el-radio>
          <el-radio :label="BANNER_CATEGORY_ISDISPLAY.HIDDEN">否</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="save">保 存</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { updateIndexBanner, updateIndexClass } from "@/api/appAdmin";
import {
  APP_ADMIN_TYPE,
  BANNER_JUMP_TYPE,
  BANNER_CATEGORY_ISDISPLAY
} from "@/utils/constant";
export default {
  name: "BannerCategoryDialog",
  data() {
    return {
      dialogVisible: false,
      formLabelWidth: "120px",
      form: {
        name: "",
        id: "",
        imgUrl: null,
        type: null,
        jumpUrl: "",
        jumpType: null,
        sort: null,
        isDisplay: null
      },
      APP_ADMIN_TYPE,
      BANNER_JUMP_TYPE,
      BANNER_CATEGORY_ISDISPLAY,
      rules: {
        imgUrl: [{ required: true, message: "请上传图片", trigger: "blur" }],
        jumpType: [
          { required: true, message: "请选择跳转类型", trigger: "change" }
        ],
        jumpUrl: [
          { required: true, message: "请输入跳转链接", trigger: "blur" },
          { max: 100, message: "长度最大100个字符", trigger: "blur" }
        ],
        isDisplay: [
          { required: true, message: "请选择是否展示", trigger: "change" }
        ]
      }
    };
  },
  computed: {
    dialogTitle() {
      let targetData = "";
      switch (this.form.type) {
        case this.APP_ADMIN_TYPE.CAROUSEL:
          if (this.form.id) {
            targetData = "编辑首页Banner";
          } else {
            targetData = "新建首页Banner";
          }
          break;
        case this.APP_ADMIN_TYPE.CATEGORY:
          if (this.form.id) {
            targetData = "编辑分类导航";
          } else {
            targetData = "新建分类导航";
          }
          break;
        default:
          break;
      }
      return targetData;
    },
    placeholderTitle() {
      return this.form.type === this.APP_ADMIN_TYPE.CAROUSEL
        ? "请输入Banner名称"
        : "请输入分类导航名称";
    }
  },
  watch: {
    dialogVisible: {
      handler(newVal) {
        if (newVal) {
          this.handleFormNameRule();
        }
      }
    }
  },
  methods: {
    detailDialogClose() {
      this.form.id = "";
      setTimeout(() => {
        this.resetVerifyForm();
      }, 0);
    },
    handleFormNameRule() {
      const name = [
        {
          required: true,
          message:
            this.form.type === APP_ADMIN_TYPE.CAROUSEL
              ? "请输入Banner名称"
              : "请输入分类导航名称",
          trigger: "blur"
        },
        {
          max: this.form.type === APP_ADMIN_TYPE.CAROUSEL ? 20 : 4,
          message:
            this.form.type === APP_ADMIN_TYPE.CAROUSEL
              ? "长度最大20个字符"
              : "长度最大4个字符",
          trigger: "blur"
        }
      ];
      this.rules.name = name;
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
      if (res.success === 1) {
        this.form[filedName] = res.data.url;
      } else {
        this.$message({
          type: "error",
          message: res.msg
        });
      }
    },
    resetVerifyForm() {
      this.$refs.bannerCategoryFormRef.resetFields();
    },
    save() {
      this.$refs.bannerCategoryFormRef.validate(async valid => {
        if (valid) {
          // console.log(this.form);
          if (this.form.id) {
            await updateIndexClass(this.form);
          } else {
            await updateIndexBanner(this.form);
          }

          this.$emit("updateSuccess");
          this.dialogVisible = false;
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
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
