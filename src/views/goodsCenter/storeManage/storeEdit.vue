<template>
  <div class="store-manage">
    <el-container>
      <el-header class="operate-part">
        <div class="title">基本信息</div>
        <span class="buttons">
          <el-button @click="onBack">取消</el-button>
          <el-button @click="submit()" type="primary"> 保存 </el-button>
        </span>
      </el-header>
      <el-main>
        <el-form ref="storeFormRef" :rules="rules" :model="form">
          <el-form-item label="店铺名称:" :label-width="formLabelWidth" prop="name">
            <el-input v-model="form.name" placeholder="请输入店铺名称" autocomplete="off" maxlength="50" />
          </el-form-item>

          <el-form-item label="店铺底图:" :label-width="formLabelWidth" prop="mapUrl">
            <imgLoadComp :form="form" :title="'mapUrl'"></imgLoadComp>
          </el-form-item>

          <el-form-item label="Logo:" :label-width="formLabelWidth" prop="logoUrl">
            <template v-if="!readOnly">
              <el-input v-model="form.logoUrl" style="display: none" />
              <el-upload class="avatar-uploader" action="/admin/system/sysFile/uploadImg" :show-file-list="false"
                :on-success="(res, file) => uploadSuccess(res, file, 'logoUrl')"
                :before-upload="(file) => uploadBefore(file, 'img', 3)">
                <el-tooltip class="item" effect="dark" content="点击可上传修改" placement="top" :enterable="false">
                  <el-image v-if="form.logoUrl" class="sample-img" :src="form.logoUrl" fit="fill" />
                  <i v-else class="el-icon-plus avatar-uploader-icon" />
                </el-tooltip>
              </el-upload>
            </template>
            <template v-else>
              <el-image v-if="form.logoUrl" class="sample-img" :src="form.logoUrl" fit="fill" />
            </template>
          </el-form-item>

          <el-form-item label="起批金额" :label-width="formLabelWidth" prop="startAmount">
            <el-input-number v-model="form.startAmount" @change="handleChange" :min="1" label="起批金额"></el-input-number>
          </el-form-item>

          <el-form-item label="经营者:" :label-width="formLabelWidth" prop="operator">
            <el-input v-model="form.operator" placeholder="请输入经营者" autocomplete="off" maxlength="50" />
          </el-form-item>

          <el-form-item label="购买须知:" :label-width="formLabelWidth" prop="buyInstructions">
            <el-input type="textarea" v-model="form.buyInstructions" placeholder="请输入购买须知" autocomplete="off"
              maxlength="100" />
          </el-form-item>

          <el-form-item label="状态:" :label-width="formLabelWidth" prop="status">
            <el-radio-group v-model="form.status" :disabled="readOnly">
              <el-radio :label="STORES_STATUS.USE">启用</el-radio>
              <el-radio :label="STORES_STATUS.STOP">停用</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="店铺展示模式:" :label-width="formLabelWidth" prop="status">
            <el-radio-group v-model="form.showModel" :disabled="readOnly">
              <el-radio :label="STORES_MODEL_STATUS.CLASSIFY">商品分类</el-radio>
              <el-radio :label="STORES_MODEL_STATUS.BIGPIC">商品大图</el-radio>
            </el-radio-group>
          </el-form-item>

          <div class="area-title">资质信息</div>

          <el-form-item label="营业执照:" :label-width="formLabelWidth" prop="businessLicense">
            <imgLoadComp :form="form" :title="'businessLicense'"></imgLoadComp>
          </el-form-item>

          <el-form-item label="药品经营许可证:" :label-width="formLabelWidth">
            <imgLoadComp :form="form" :title="'operatorCert'"></imgLoadComp>
          </el-form-item>

          <el-form-item label="药品生产许可证:" :label-width="formLabelWidth">
            <imgLoadComp :form="form" :title="'productionCert'"></imgLoadComp>
          </el-form-item>

          <el-form-item label="药品经营质量管理规范证书:" :label-width="formLabelWidth">
            <imgLoadComp :form="form" :title="'qualityCert'"></imgLoadComp>
          </el-form-item>

          <el-form-item label="药品生产质量管理规范证书:" :label-width="formLabelWidth">
            <imgLoadComp :form="form" :title="'prodQualityCert'"></imgLoadComp>
          </el-form-item>

          <el-form-item label="供应商质量保证能力调查表图片:" :label-width="formLabelWidth">
            <imgLoadComp :form="form" :title="'supplierQualityUrl'"></imgLoadComp>
          </el-form-item>

          <el-form-item label="法人委托书图片:" :label-width="formLabelWidth">
            <imgLoadComp :form="form" :title="'corporationEntrust'"></imgLoadComp>
          </el-form-item>

          <el-form-item label="委托销售人员身份证复印件图片:" :label-width="formLabelWidth">
            <imgLoadComp :form="form" :title="'entrustSale'"></imgLoadComp>
          </el-form-item>

          <el-form-item label="质量保证协议书图片:" :label-width="formLabelWidth">
            <imgLoadComp :form="form" :title="'qualityAgreement'"></imgLoadComp>
          </el-form-item>

          <el-form-item label="随货同行单（票）样式图片:" :label-width="formLabelWidth">
            <imgLoadComp :form="form" :title="'goodsPeer'"></imgLoadComp>
          </el-form-item>

          <el-form-item label="相关印章样式图片:" :label-width="formLabelWidth">
            <imgLoadComp :form="form" :title="'sealUrl'"></imgLoadComp>
          </el-form-item>

          <el-form-item label="食品经营许可证:" :label-width="formLabelWidth">
            <imgLoadComp :form="form" :title="'foodOperatorCert'"></imgLoadComp>
          </el-form-item>

          <el-form-item label="食品生产许可证:" :label-width="formLabelWidth">
            <imgLoadComp :form="form" :title="'foodProdCert'"></imgLoadComp>
          </el-form-item>

          <el-form-item label="商标授权证明:" :label-width="formLabelWidth">
            <imgLoadComp :form="form" :title="'trademarkAuth'"></imgLoadComp>
          </el-form-item>

          <div class="area-title">资质信息</div>

          <el-form-item label="发货方式:" :label-width="formLabelWidth" prop="status">
            <el-radio-group v-model="form.deliveryType" :disabled="readOnly">
              <el-radio :label="0">商家发货</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="物流公司:" :label-width="formLabelWidth" prop="logisticsCompany">
            <el-input v-model="form.logisticsCompany" placeholder="请输入物流公司" autocomplete="off" maxlength="10" />
          </el-form-item>

          <el-form-item label="运费模板:" :label-width="formLabelWidth" prop="freightTemplateId">
            <el-select v-model="form.freightTemplateId" :readonly="form.id" placeholder="请选择运费模板" filterable>
              <el-option v-for="item in freightTemplateList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-form>
      </el-main>
    </el-container>
  </div>
</template>

<script>
  import imgLoadComp from "./imgLoadComp";
  import {
    STORES_STATUS,
    STORES_MODEL_STATUS
  } from "@/utils/constant";
  import {
    getStoreById,
    freightTemplateList
  } from "@/api/goodsCenter";

  export default {
    name: "storeEdit",
    props: [],
    components: {
      imgLoadComp
    },
    data() {
      return {
        STORES_STATUS,
        STORES_MODEL_STATUS,
        readOnly: false,
        formLabelWidth: "120px",
        form: {
          id: "",
          name: "",
          mapUrl: "",
          logoUrl: "",
          startAmount: 0,
          operator: "",
          buyInstructions: "",
          businessLicense: "",
          status: 0,
          showModel: 0,
          operatorCert: "",
          productionCert: "",
          qualityCert: "",
          prodQualityCert: "",
          supplierQualityUrl: "",
          corporationEntrust: "",
          entrustSale: "",
          qualityAgreement: "",
          goodsPeer: "",
          sealUrl: "",
          foodOperatorCert: "",
          foodProdCert: "",
          trademarkAuth: "",
          deliveryType: 0,
          logisticsCompany: "",
          freightTemplateId: "",
        },
        freightTemplateList: [],
        rules: {
          name: [{
              required: true,
              message: "请输入店铺名称",
              trigger: "blur"
            },
            {
              max: 50,
              message: "长度最大50个字符",
              trigger: "blur"
            },
          ],
          operator: [{
              required: true,
              message: "请输入经营者",
              trigger: "blur"
            },
            {
              max: 50,
              message: "长度最大50个字符",
              trigger: "blur"
            },
          ],
          buyInstructions: [{
            max: 100,
            message: "长度最大100个字符",
            trigger: "blur"
          }, ],
          logisticsCompany: [{
              required: true,
              message: "请输入物流公司",
              trigger: "blur"
            },
            {
              max: 10,
              message: "长度最大10个字符",
              trigger: "blur"
            },
          ],
          logoUrl: [{
            required: true,
            message: "请上传图片",
            trigger: "blur"
          }],
          businessLicense: [{
            required: true,
            message: "请上传图片",
            trigger: "blur"
          }, ],
          mapUrl: [{
            required: true,
            message: "请上传图片",
            trigger: "blur"
          }],

          startAmount: [{
            required: true,
            message: "请输入起批金额",
            trigger: "change"
          }, ],
          status: [{
            required: true,
            message: "请选择状态",
            trigger: "change"
          }],
          showModel: [{
            required: true,
            message: "请选择店铺展示模式",
            trigger: "change"
          }, ],
          deliveryType: [{
            required: true,
            message: "请选择发货方式",
            trigger: "change"
          }, ],
          freightTemplateId: [{
            required: true,
            message: "请选择运费模版",
            trigger: "change"
          }, ],
        },
      };
    },
    created() {
      if (this.$route.query.id) {
        this.form.id = this.$route.query.id;
        this.getDatail();
      }
      this.getFreightTemplateList();
    },
    mounted() {},
    methods: {
      getDatail() {
        getStoreById(this.form.id).then((res) => {
          this.form.name = res.data.name;
          this.form.mapUrl = res.data.mapUrl;
          this.form.logoUrl = res.data.logoUrl;
          this.form.startAmount = res.data.startAmount;
          this.form.operator = res.data.operator;
          this.form.buyInstructions = res.data.buyInstructions;
          this.form.status = res.data.status;
          this.form.showModel = res.data.showModel;
          this.form.operatorCert = res.data.operatorCert;
          this.form.productionCert = res.data.productionCert;
          this.form.qualityCert = res.data.qualityCert;
          this.form.prodQualityCert = res.data.prodQualityCert;
          this.form.supplierQualityUrl = res.data.supplierQualityUrl;
          this.form.corporationEntrust = res.data.corporationEntrust;
          this.form.entrustSale = res.data.entrustSale;
          this.form.qualityAgreement = res.data.qualityAgreement;
          this.form.goodsPeer = res.data.goodsPeer;
          this.form.sealUrl = res.data.sealUrl;
          this.form.foodOperatorCert = res.data.foodOperatorCert;
          this.form.foodProdCert = res.data.foodProdCert;
          this.form.trademarkAuth = res.data.trademarkAuth;
          this.form.deliveryType = res.data.deliveryType;
          this.form.logisticsCompany = res.data.logisticsCompany;
          this.form.freightTemplateId = res.data.freightTemplateId;
          this.form.businessLicense = res.data.businessLicense;
        });
      },
      getFreightTemplateList() {
        freightTemplateList().then((res) => {
          this.freightTemplateList = res.data.list;
        });
      },
      onBack() {
        this.$router.go(-1);
      },
      submit() {
        this.$refs.storeFormRef.validate((valid) => {
          if (valid) {
            if (this.form.id) {
              this.$postJson("/goods/store/update", this.form).then((res) => {
                if (res.success === 1) {
                  this.$message.success(res.msg);
                  this.$router.back();
                } else {
                  this.$message.error(res.msg);
                }
              });
            } else {
              this.$postJson("/goods/store/insert", this.form).then((res) => {
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
      handleChange() {},
    },
  };
</script>

<style lang='scss' scoped>
  .store-manage {
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

  .area-title {
    display: flex;
    justify-content: space-between;
    padding: 20px;
    text-align: center;
  }

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
