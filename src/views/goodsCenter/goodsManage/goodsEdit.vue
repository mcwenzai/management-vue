<template>
  <div class="brand-admin">
    <el-container>
      <el-header class="operate-part">
        <div class="flex">
          <div class="title">{{ form.id ? "编辑" : "新增" }}商品</div>
        </div>
        <span class="buttons">
          <el-button @click="onBack">取消</el-button>
          <el-button @click="submit()" type="primary"> 保存 </el-button>
        </span>
      </el-header>
      <el-main>
        <el-form ref="brandFormRef" :rules="rules" :model="form">
          <el-form-item label="类型:" :label-width="formLabelWidth" prop="type">
            <el-radio-group v-model="form.type" :disabled="readOnly" @change="handleChangeType">
              <el-radio :label="type.value" v-for="(type, index) in GOODS_TYPE" :key="index">
                {{type.label}}
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            label="选择类目:"
            :label-width="formLabelWidth"
            prop="classifyId"
            v-if="form.type === GOODS_TYPE[0].value"
          >
            <el-cascader
              v-model="form.classifyId"
              clearable
              :options="treeList"
              :props="{ expandTrigger: 'hover', value: 'id', label: 'name', emitPath: false }"
            />
          </el-form-item>
          <el-form-item label="SPU" :label-width="formLabelWidth"></el-form-item>
          <el-form-item
            label="品牌:"
            :label-width="formLabelWidth"
            prop="brandId"
          >
            <el-select
              v-model="form.brandId"
              :disabled="Boolean(form.id)"
              placeholder="请选择"
              filterable
            >
              <el-option
                v-for="item in brandList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="商品名称:"
            :label-width="formLabelWidth"
            prop="goodsName"
          >
            <el-input
              :disabled="Boolean(form.id)"
              v-model="form.goodsName"
              placeholder="请输入商品名称"
              autocomplete="off"
              maxlength="20"
            />
          </el-form-item>
          <el-form-item label="标签:" :label-width="formLabelWidth" prop="tag"
            v-if="form.type === GOODS_TYPE[0].value">
            <el-radio-group v-model="form.tag" :disabled="readOnly">
              <el-radio :label="tag.value" v-for="(tag, index) in GOODS_TAG" :key="index">
                {{tag.label}}
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="推荐首页:" v-if="form.type === GOODS_TYPE[0].value" :label-width="formLabelWidth" prop="isRecommend">
            <el-radio-group v-model="form.isRecommend" :disabled="readOnly">
              <el-radio :label="0">否</el-radio>
              <el-radio :label="1">是</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            label="产地:"
            :label-width="formLabelWidth"
            prop="place"
            v-if="form.type === GOODS_TYPE[2].value"
          >
            <el-input
              v-model="form.place"
              placeholder="请输入产地"
              autocomplete="off"
            />
          </el-form-item>
          <div v-for="(item, index) in form.goodsSkuList" :key="index">
            <sku
              :readOnly="readOnly"
              :form="form"
              :formLabelWidth="formLabelWidth"
              :index="index"
              @addSku="addSku(item, index)"
              @subSku="subSku(index)"
              @validate="validateForm"
            ></sku>
          </div>
          <el-form-item label="基本信息" :label-width="formLabelWidth"></el-form-item>
          <div class="baseMessage">
            <span>标题</span>
            <span>内容</span>
          </div>
          <div
            v-for="(item, index) in form.goodsInfoList"
            :key="'info2' + index"
          >
            <baseinfo
              style="padding-bottom: 20px"
              :form="form"
              :index="index"
              @addInfo="addInfo(item, index)"
              @subInfo="subInfo(index)"
            ></baseinfo>
          </div>
          <el-form-item label="图文描述" :label-width="formLabelWidth"></el-form-item>
          <el-form-item
            label="商品banner:"
            :label-width="formLabelWidth"
            prop="goodsBannerList"
            style="width: 620px"
          >
            <imgUpload v-model="form.goodsBannerList" :limit="9" @validate="validateForm('goodsBannerList')"/>
          </el-form-item>
          <el-form-item label="详情图:" style="width: 620px" :label-width="formLabelWidth" prop="describes">
            <imgUpload v-model="form.describes" :limit="15" @validate="validateForm('describes')"/>
          </el-form-item>
          <el-form-item
            label="状态:"
            :label-width="formLabelWidth"
            prop="status"
          >
            <el-radio-group v-model="form.status" :disabled="readOnly">
              <el-radio :label="GOODS_STATUS.USE">启用</el-radio>
              <el-radio :label="GOODS_STATUS.STOP">停用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { getClassifyTree, getBrandList, getGoodsById } from "@/api/goodsCenter";
import sku from "./sku";
import baseinfo from "./baseinfo";
import { GOODS_STATUS, GOODS_TYPE, GOODS_TAG } from "@/utils/constant";
import imgUpload from '@/components/ImgUpload'

export default {
  name: "GoodsEdit",
  components: { sku, baseinfo, imgUpload },
  data() {
    return {
      GOODS_STATUS,
      GOODS_TYPE,
      GOODS_TAG,
      // 上传图片
      dialogImageUrl: "",
      dialogVisible: false,
      disabled: false,
      baseInfoList: [{ title: 1 }],
      //
      treeList: [],
      readOnly: false,
      formLabelWidth: "120px",
      brandList: [],
      form: {
        id: "",
        type: null,
        brandId: "",
        classifyId: '',
        place: '',
        goodsName: "",
        tag: '',
        isRecommend: 0,
        describes: [],
        status: null,
        // 商品轮播图表
        goodsBannerList: [],
        // 商品基本信息
        goodsInfoList: [{ title: "", content: "", sort: 0 }],
        //商品规格
        goodsSkuList: [{ name: "", imgUrl: "", effectRatio: "" }],
      },
      rules: {
        type: [
          { required: true, message: "请选择类型", trigger: "blur" },
        ],
        goodsName: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
          { max: 50, message: "长度最大50个字符", trigger: "blur" },
        ],
        place: [
          { required: true, message: "请输入产地", trigger: "blur" },
        ],
        goodsBannerList: [
          { required: true, message: "请上传商品banner", trigger: "change" },
        ],
        status: [{ required: true, message: "请选择状态", trigger: "change" }],
        describes: [
          { required: true, message: "请上传详情图", trigger: "change" },
        ],
        brandId: [{ required: true, message: "请选择品牌", trigger: "change" }],
        classifyId: [
          { required: true, message: "请选择类目", trigger: "change" },
        ],
        tag: [
          { required: true, message: "请选择标签", trigger: "change" },
        ],
      },
    };
  },
  created() {
    if (this.$route.query.id) {
      this.form.id = this.$route.query.id;
      this.getDatail();
    }
    this.getTree();
    this.getBrandList();
  },
  mounted() {},
  methods: {
    validateForm(prop) {
      this.$refs.brandFormRef.validateField(prop);
    },
    addInfo(item, index) {
      let data = { title: "", content: "", sort: "" };
      this.form.goodsInfoList.push(data);
    },
    subInfo(index) {
      this.form.goodsInfoList.splice(index, 1);
    },
    //上传图片
    subSku(index) {
      this.form.goodsSkuList.splice(index, 1);
    },
    handleChangeType() {
      this.form.classifyId = '';
      this.form.place = '';
      this.form.tag = '';
    },
    addSku(item, index) {
      let newTitle = item.title + 1;
      let data = { name: "", imgUrl: "" };
      this.form.goodsSkuList.push(data);
    },
    // 获取详情
    getDatail() {
      getGoodsById(this.form.id).then((res) => {
        this.form.type = res.data.type;
        this.form.brandId = res.data.brandId;
        this.form.classifyId = res.data.classifyId;
        this.form.goodsName = res.data.goodsName;
        this.form.place = res.data.place;
        this.form.tag = res.data.tag;
        this.form.isRecommend = res.data.isRecommend;
        if (res.data.describes) {
          const list = res.data.describes.replace(/，/g, ',').split(',');
          list.forEach((item) => {
            this.form.describes.push({
              name: '',
              url: item,
            });
          });
        }
        this.form.status = res.data.status;
        this.form.goodsBannerList = res.data.goodsBannerList;
        if (res.data.goodsInfoList.length) {
          this.form.goodsInfoList = res.data.goodsInfoList;
        } else {
          this.form.goodsInfoList = [{ title: "", content: "", sort: 0 }];
        }
        this.form.goodsSkuList = res.data.goodsSkuList;
      });
    },
    async getBrandList() {
      const res = await getBrandList();
      this.brandList = res.data.list;
    },
    async getTree() {
      let res = await getClassifyTree();
      res = res.data || [];
      res.forEach((e) => {
        e.children.forEach((el) => {
          el.children.forEach((ele) => {
            delete ele.children;
          });
        });
      });
      this.treeList = res;
    },
    resetVerifyForm() {
      this.$refs.brandFormRef.resetFields();
    },
    onBack() {
      this.$router.go(-1);
    },
    submit() {
      const goodsBannerList = [];
      const goodsInfoList = [];
      const goodsSkuList = [];
      this.form.goodsBannerList.forEach((item) => {
        goodsBannerList.push({
          url: item.url,
          id: item.id,
        });
      });
      this.form.goodsInfoList.forEach((item) => {
        goodsInfoList.push({
          title: item.title,
          content: item.content,
          sort: item.sort,
          id: item.id,
        });
      });
      this.form.goodsSkuList.forEach((item) => {
        goodsSkuList.push({
          imgUrl: item.imgUrl,
          name: item.name,
          effectRatio: item.effectRatio,
          id: item.id,
        });
      });
      const form = {
        id: this.form.id,
        type: this.form.type,
        brandId: this.form.brandId,
        classifyId: this.form.classifyId,
        place: this.form.place,
        goodsName: this.form.goodsName,
        status: this.form.status,
        tag: this.form.tag,
        isRecommend: this.form.isRecommend,
        describes: this.form.describes.map((item) => item.url).join(','),
        goodsBannerList,
        goodsInfoList,
        goodsSkuList,
      }
      this.$refs.brandFormRef.validate((valid) => {
        if (valid) {
          if (this.form.id) {
            this.$postJson("/goods/goods/update", form).then((res) => {
              if (res.success === 1) {
                this.$message.success(res.msg);
                this.$router.back();
              } else {
                this.$message.error(res.msg);
              }
            });
          } else {
            this.$postJson("/goods/goods/insert", form).then((res) => {
              if (res.success === 1) {
                this.$message.success(res.msg);
                this.$router.back();
              } else {
                this.$message.error(res.msg);
              }
            });
          }
        }
      });
    },
  },
};
</script>

<style lang='scss' scoped>
.brand-admin {
  .operate-part {
    display: flex;
    justify-content: space-between;
    padding: 30px 20px 20px 65px;
    text-align: center;
    .el-input {
      width: 200px;
    }
  }
}
.baseMessage {
  display: flex;
  padding: 20px 20px 5px 20px;
  span {
    flex: 1;
  }
  :nth-child(1) {
    margin-left: 101px;
  }
  :nth-child(2) {
    margin-left: -108px;
  }
}
</style>
