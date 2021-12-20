<template>
  <div v-if="form" class="detail">
    <el-container>
      <el-main>
        <el-form ref="verifyForm" :key="uniqueKey" :model="form" class="form-content">
          <div class="divide">
            <el-form-item label="机构类型:" :label-width="formLabelWidth">
              <span>{{ keymap.getValue('ORGAN_TYPE', form.organType) }}</span>
            </el-form-item>
            <el-form-item label="机构位置:" :label-width="formLabelWidth" required>
                <span v-for="item in form.provincesCode" :key="item.id">{{ CodeToText[item] }}</span>
            </el-form-item>
            <el-form-item label="详细地址:" :label-width="formLabelWidth" required>
                <span>{{ form.address }}</span>
            </el-form-item>
          </div>
          <div class="divide">
            <el-form-item label="医疗执业许可证复印件:" :label-width="formLabelWidth" required>
                <el-image class="sample-img" :src="form.medicalPermit" fit="fill" @click="onSwitch(0)" />
            </el-form-item>
            <el-form-item label="是否通过:" :label-width="formLabelWidth" :required="true">
              <el-switch v-model="medicalPermitStatusSwitch" :disabled="true" active-text="是" inactive-text="否" />
            </el-form-item>
            <el-form-item v-if="form.organName" label="机构名称:" :label-width="formLabelWidth" required>
                <span>{{ form.organName }}</span>
            </el-form-item>
            <el-form-item v-if="form.organNo" label="登记号:" :label-width="formLabelWidth" required>
                <span>{{ form.organNo }}</span>
            </el-form-item>
            <el-form-item v-if="medicalPermitStatusSwitch" label="有限期至:" :label-width="formLabelWidth" required>
                <span v-if="form.medicalPermitTime">{{ form.medicalPermitTime.slice(0,10) }}</span>
                <span v-else>暂无</span>
            </el-form-item>
            <div v-if="!medicalPermitStatusSwitch">
              <el-form-item v-if="form.medicalPermitCause || form.medicalPermitCause ==''" label="原因:" :label-width="formLabelWidth" required>
                <span v-for="item in medicalReasons" :key="item.id">
                  <span v-if="item.id == form.medicalPermitCause">{{item.reason}}</span>
                </span>
              </el-form-item>
              <el-form-item v-if="isShowMedicalNote" label="说明:" :label-width="formLabelWidth" required>
                <span>{{form.medicalPermitNote}}</span>
              </el-form-item>
            </div>
          </div>
          <div class="divide">
            <el-form-item label="采购人身份证复印件:" :label-width="formLabelWidth" :required="true">
              <div v-if="buyerCardImg.length < 2">
                <el-image class="sample-img" :src="buyerCardImg[0]" fit="fill" @click="onSwitch(1)" />
              </div>
              <div v-else>
                <el-image class="sample-img" v-for="(url, index) in buyerCardImg" :key="index" :src="url" fit="fill"
                  @click="onSwitch(index+1)" />
              </div>
            </el-form-item>
            <el-form-item label="是否通过:" :label-width="formLabelWidth" required>
              <el-switch v-model="buyerCardStatusSwitch" :disabled="true" active-text="是" inactive-text="否" />
            </el-form-item>
            <el-form-item v-if="buyerCardStatusSwitch" label="有限期至:" :label-width="formLabelWidth" required>
              <span v-if="form.buyerCardTime">{{ form.buyerCardTime.slice(0,10) }}</span>
              <span v-else>暂无</span>
            </el-form-item>
            <div v-if="!buyerCardStatusSwitch">
              <el-form-item v-if="form.buyerCardCause || form.buyerCardCause == ''" label="原因:" :label-width="formLabelWidth" required>
                <span v-for="item in cardReasons" :key="item.id">
                  <span v-if="item.id == form.buyerCardCause">{{item.reason}}</span>
                </span>
              </el-form-item>
              <el-form-item v-if="isShowCardNote" label="说明:" :label-width="formLabelWidth" required>
                <span>{{form.buyerCardNote}}</span>
              </el-form-item>
            </div>

          </div>
          <div class="divide">
            <el-form-item label="采购委托书复印件:" :label-width="formLabelWidth" required>
              <el-image class="sample-img" :src="form.buyerEntrust" fit="fill" @click="onSwitch(srcIndex)" />
            </el-form-item>
            <el-form-item label="是否通过:" :label-width="formLabelWidth" required>
              <el-switch v-model="buyerEntrustStatusSwitch" :disabled="true" active-text="是" inactive-text="否" />
            </el-form-item>
            <el-form-item v-if="buyerEntrustStatusSwitch" label="有限期至:" :label-width="formLabelWidth" required>
              <span v-if="form.buyerEntrustTime">{{ form.buyerEntrustTime.slice(0,10) }}</span>
              <span v-else>暂无</span>
            </el-form-item>
            <div v-if="!buyerCardStatusSwitch">
            <el-form-item v-if="form.buyerEntrustCause || form.buyerEntrustCause == '' " label="原因:" :label-width="formLabelWidth" required>
              <span v-for="item in buyerReasons" :key="item.id">
                <span v-if="item.id == form.buyerEntrustCause">{{item.reason}}</span>
              </span>
            </el-form-item>
            <el-form-item v-if="isShowBuyerNote" label="说明:" :label-width="formLabelWidth" required>
              <span>{{ form.buyerEntrustNote }}</span>
            </el-form-item>
            </div>
          </div>
        </el-form>
        <div class="end">
          <el-button type="primary" @click="goBack()">返 回</el-button>
        </div>
      </el-main>
      <div class="right">
        <el-aside width="500px" height="800px">
          <imageViewer v-if="showViewer" :preview-Index="0" :on-close="onClose" :on-switch="onSwitch"
            :url-list="viewerImgList" :initialIndex="initialIndex" :z-index="0" />
        </el-aside>
      </div>
    </el-container>
  </div>
</template>

<script>
  import {
    getRequest,
    postRequest,
    postJson
  } from '@/utils/request';
  import imageViewer from '../../../components/image-viewer/image-viewer.vue';
  import {
    getAppQualificationById,
    getVerifyRefuseReasonList
  } from '@/api/user'
  import {
    QUALIFICATION_STATUS,
    SEARCH_DEBOUNCE_TIME,
    OPERATE_QUALIFICATION_TYPE,
    BUYER_QUALIFICATION_STATUS,
    VERIFY_REASON_TYPE,
    PAGE_SIZE_ARR
  } from '@/utils/constant'
  import keymap from '@/utils/keymap'
  import {
    timestampToTime
  } from '@/utils/index'
  import {
    CodeToText
  } from 'element-china-area-data'
  import {
    regionData
  } from 'element-china-area-data'
  export default {
    components: {
      imageViewer
    },
    filters: {
      formatTime(time) {
        return timestampToTime(time)
      }
    },
    data() {
      return {
        keymap,
        OPERATE_QUALIFICATION_TYPE,
        CodeToText,
        medicalPermitStatusSwitch: false,
        buyerCardStatusSwitch: false,
        buyerEntrustStatusSwitch: false,
        operateStatus: null, // 0 查看 1 审核
        id: null,
        form: {},
        previewImgList: [],
        formLabelWidth: '120px',
        options: regionData,
        selectedOptions: [],
        passStataus: 1,
        medicalReasons: [],
        buyerReasons: [],
        cardReasons: [],
        isShowMedicalNote: false,
        isShowBuyerNote: false,
        isShowCardNote: false,
        uniqueKey: 0,
        expireTimeOption: {
          disabledDate(date) {
            var nowTime = Date.now() - 24 * 60 * 60 * 1000
            return date.getTime() < nowTime.toString();
          }
        },
        showViewer: true,
        previewIndex: 0,
        viewerImgList: [],
        popUpShow: false,
        popUpDesc: '',
        srcIndex: 2,
        initialIndex: 0,
        buyerCardImg: []
      }
    },
    created() {
      var id = this.$route.query.id
      this.getDetail(id);
      this.getReasonList()
    },
    methods: {
      getDetail(id) {
        getAppQualificationById({
          id
        }).then(res => {
          var medicalPermit = res.data.medicalPermit
          if ( res.data.buyerCard ) {
            var buyerCardList = res.data.buyerCard.split(',')
          } else {
             var buyerCardList = res.data.buyerCard
          }
          var buyerEntrust = res.data.buyerEntrust
          this.form = res.data
          this.form.provincesCode = this.form.provincesCode.split(',')
          if ( medicalPermit ) {
            this.form.medicalPermit = this.form.medicalPermit.split(',')[0] + ''
          }
          this.form.medicalPermit = medicalPermit
          this.buyerCardImg = this.form.buyerCard.split(',')
          var imgList = []
          if (buyerCardList.length > 1) {
            imgList.push(medicalPermit, buyerCardList[0], buyerCardList[1], buyerEntrust)
            this.previewImgList = imgList
            this.viewerImgList = imgList
            this.srcIndex = 3
          } else {
            imgList.push(medicalPermit, buyerCardList[0], buyerEntrust)
            this.previewImgList = imgList
            this.viewerImgList = imgList
          }
          this.selectedOptions = res.data.provincesCode
          this.switcher()
          this.isShowExplain()
        })
      },
      // 获取理由列表数据
      getReasonList() {
        const defaultReason = {
          id: '',
          reason: '其他'
        }
        return new Promise(resolve => {
          Promise.all([
            getVerifyRefuseReasonList({
              type: VERIFY_REASON_TYPE.MEDICAL
            }),
            getVerifyRefuseReasonList({
              type: VERIFY_REASON_TYPE.BUYER
            }),
            getVerifyRefuseReasonList({
              type: VERIFY_REASON_TYPE.CARD
            })
          ]).then(res => {
            res[0].data.list.push(defaultReason)
            res[1].data.list.push(defaultReason)
            res[2].data.list.push(defaultReason)
            this.medicalReasons = res[0].data.list
            this.cardReasons = res[1].data.list
            this.buyerReasons = res[2].data.list
            resolve(res)
          })
        })
      },
      // 是否显示理由
      isShowExplain() {
        if (this.form.medicalPermitStatus == 2 && this.form.medicalPermitCause == '') {
          this.isShowMedicalNote = true
        }

        if (this.form.buyerCardStatus == 2 && this.form.buyerCardCause == '') {
          this.isShowCardNote = true
        }

        if (this.form.buyerEntrustStatus == 2 && this.form.buyerEntrustCause == '') {
          this.isShowBuyerNote = true
        }

      },
      switcher() {
        var medicalSwitch = this.form.medicalPermitStatus
        var buyerSwitch = this.form.buyerCardStatus
        var buyenSwitch = this.form.buyerEntrustStatus
        if (medicalSwitch == 0 || medicalSwitch == 2 || medicalSwitch == 4) {
          this.medicalPermitStatusSwitch = false
        }
        if (medicalSwitch == 1 || medicalSwitch == 3) {
          this.medicalPermitStatusSwitch = true
        }
        if (buyerSwitch == 0 || buyerSwitch == 2 || buyerSwitch == 4) {
          this.buyerCardStatusSwitch = false
        }
        if (buyerSwitch == 1 || buyerSwitch == 3) {
          this.buyerCardStatusSwitch = true
        }
        if (buyenSwitch == 0 || buyenSwitch == 2 || buyenSwitch == 4) {
          this.buyerEntrustStatusSwitch = false
        }
        if (buyenSwitch == 1 || buyenSwitch == 3) {
          this.buyerEntrustStatusSwitch = true
        }
      },
      onClose() {
        this.showViewer = false
      },
      // 切换图片 index为图片下标值
      onSwitch(index) {
        this.initialIndex = index
      },
      goBack() {
        this.$router.go(-1);
      }
    }
  }
</script>
<style lang='scss' scoped>
  .detail {
    .form-content {
      /* max-height: 500px; */
      overflow: auto;

      .divide {
        padding-bottom: 30px;

        .flex {
          float: left;
        }
      }

      .txt-input {
        width: 500px;
      }
    }

    .right {
      margin-top: 40px;
      margin-right: 60px;
      width: 760px;
      height: 820px;
      background-color: #F1F1F1;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;


      ::v-deep .el-image-viewer__mask {
        display: none;
      }

      ::v-deep .el-image-viewer__wrapper {
        display: block;
        position: static;
        z-index: 0;
        max-height: 800px;
        max-width: 500px;
        /* height: 800px;
        width: 600px; */
      }

      ::v-deep .el-image-viewer__btn {
        /* position: fixed; */
      }

      ::v-deep .el-image-viewer__close {
        display: none;
      }

      /*      ::v-deep .el-image-viewer__prev {
        left: 10px;
      } */

      /*      ::v-deep .el-image-viewer__next {
        right: 10px;
      } */

      ::v-deep .el-image-viewer__actions {
        margin-top: 100px;
      }


    }


    .sample-img {
      width: 74px;
      height: 74px;
      margin-right: 16px;
      float: left;
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

    .el-form-item {
      margin-bottom: 14px !important;
    }

    .el-select,
    .el-cascader,
    .el-date-editor {
      width: 500px;
    }

    ::v-deep .el-upload--picture-card {
      width: 74px !important;
      height: 74px !important;
    }

    .end {
      display: flex;
      justify-content: flex-end;
    }
  }

  .el-carousel__item h3 {
    color: #475669;
    font-size: 18px;
    opacity: 0.75;
    line-height: 300px;
    margin: 0;
  }

  .el-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
  }

  .el-carousel__item:nth-child(2n+1) {
    background-color: #d3dce6;
  }
</style>
