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
              <template v-if="!canEdit">
                <span v-for="item in form.provincesCode" :key="item.id"></span>
              </template>
              <template v-else>
                <el-cascader v-model="selectedOptions" size="large" :options="areaOptions" />
              </template>
            </el-form-item>
            <el-form-item label="详细地址:" :label-width="formLabelWidth" required>
              <template v-if="!canEdit">
                <span>{{ form.address }}</span>
              </template>
              <template v-else>
                <el-input v-model="form.address" class="txt-input" :maxlength="50" placeholder="请输入内容" />
              </template>
            </el-form-item>
          </div>
          <div class="divide">
            <el-form-item label="医疗执业许可证复印件:" :label-width="formLabelWidth" required>
              <template v-if="!canEdit">
                <el-image class="sample-img" :src="form.medicalPermit" fit="fill" @click="onSwitch(0)" />
              </template>
              <template v-else>
                <el-input v-model="form.medicalPermit" style="display: none" />
                <el-image v-if="form.medicalPermit" class="sample-img" :src="form.medicalPermit" @click="onSwitch(0)"
                  fit="fill" />
                <i v-else class="el-icon-plus avatar-uploader-icon" />
                <div class="flex">
                  <el-tooltip class="item" effect="dark" content="点击上传修改图片" placement="top" :enterable="false">
                    <el-upload class="click-uploader" action="/admin/system/sysFile/uploadImg" :show-file-list="false"
                      :on-success="(res,file)=>uploadSuccess(res,file,'medicalPermit')"
                      :before-upload="(file)=>uploadBefore(file,'img',2)">
                      <i class="el-icon-edit-outline avatar-uploader-icon" />
                    </el-upload>
                  </el-tooltip>
                </div>
              </template>
            </el-form-item>
            <el-form-item label="是否通过:" :label-width="formLabelWidth" :required="true">
              <el-switch v-model="medicalPermitStatusSwitch" :disabled="!canEdit" active-text="是" inactive-text="否" />
            </el-form-item>
            <el-form-item v-if="medicalPermitStatusSwitch" label="机构名称:" :label-width="formLabelWidth" required>
              <template v-if="!canEdit">
                <span>{{ form.organName }}</span>
              </template>
              <template v-else>
                <el-input v-model="form.organName" class="txt-input" :maxlength="50" placeholder="请输入内容" />
              </template>
            </el-form-item>
            <el-form-item v-if="medicalPermitStatusSwitch" label="登记号:" :label-width="formLabelWidth" required>
              <template v-if="!canEdit">
                <span>{{ form.organNo }}</span>
              </template>
              <template v-else>
                <el-input v-model="form.organNo" class="txt-input" :maxlength="50" placeholder="请输入内容" />
              </template>
            </el-form-item>
            <el-form-item v-if="medicalPermitStatusSwitch" label="有效期至:" :label-width="formLabelWidth">
              <template v-if="!canEdit">
                <span v-if="form.medicalPermitTime">{{ form.medicalPermitTime.slice(0,10) }}</span>
                <span v-else>暂无</span>
              </template>
              <template v-else>
                <el-date-picker v-model="form.medicalPermitTime" value-format="yyyy-MM-dd HH:mm:ss" type="date"
                  :picker-options="expireTimeOption" placeholder="选择日期" />
              </template>
            </el-form-item>

            <el-form-item v-if="!medicalPermitStatusSwitch" label="原因:" :label-width="formLabelWidth" required>
              <el-select v-model="form.medicalPermitCause" :disabled="!canEdit" placeholder="请选择" filterable>
                <el-option v-for="item in medicalReasons" :key="item.id" :label="item.reason" :value="item.id" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="isShowMedicalNote && canEdit" label="说明:" :label-width="formLabelWidth" required>
              <el-input v-model="form.medicalPermitNote" class="txt-input" :maxlength="100" placeholder="最多可输入100个字" />
            </el-form-item>
          </div>
          <div class="divide">
            <el-form-item label="采购人身份证复印件:" :label-width="formLabelWidth" :required="true">
              <template>
                <div v-if="buyerCardImg.length < 2">
                  <el-image class="sample-img" :src="buyerCardImg[0]" fit="fill" @click="onSwitch(1)" />
                </div>
                <div v-else>
                  <el-image class="sample-img" v-for="(url, index) in buyerCardImg" :key="index" :src="url" fit="fill"
                    @click="onSwitch(index+1)" />
                </div>
                <div class="flex">
                  <el-tooltip class="item" effect="dark" content="点击上传修改图片" placement="top" :enterable="false">
                    <el-upload class="click-uploader" action="/admin/system/sysFile/uploadImg" :show-file-list="false"
                      :on-success="(res,file)=>uploadSuccess(res,file,'buyerCard')"
                      :before-upload="(file)=>uploadBefore(file,'img',2)">
                      <i class="el-icon-edit-outline avatar-uploader-icon" />
                    </el-upload>
                  </el-tooltip>
                </div>
              </template>
            </el-form-item>
            <el-form-item label="是否通过:" :label-width="formLabelWidth" required>
              <el-switch v-model="buyerCardStatusSwitch" :disabled="!canEdit" active-text="是" inactive-text="否" />
            </el-form-item>
            <el-form-item v-if="buyerCardStatusSwitch" label="有效期至:" :label-width="formLabelWidth">
              <template v-if="!canEdit">
                <span v-if="form.buyerCardTime">{{ form.buyerCardTime.slice(0,10) }}</span>
                <span v-else>暂无</span>
              </template>
              <template v-else>
                <el-date-picker v-model="form.buyerCardTime" value-format="yyyy-MM-dd HH:mm:ss"
                  :picker-options="expireTimeOption" type="date" placeholder="选择日期" />
              </template>
            </el-form-item>
            <el-form-item v-if="!buyerCardStatusSwitch" label="原因:" :label-width="formLabelWidth" required>
              <el-select v-model="form.buyerCardCause" :disabled="!canEdit" placeholder="请选择" filterable>
                <el-option v-for="item in cardReasons" :key="item.id" :label="item.reason" :value="item.id" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="isShowCardNote && canEdit" label="说明:" :label-width="formLabelWidth" required>
              <el-input v-model="form.buyerCardNote" class="txt-input" :maxlength="100" placeholder="最多可输入100个字" />
            </el-form-item>
          </div>
          <div class="divide">
            <el-form-item label="采购委托书复印件:" :label-width="formLabelWidth" required>
              <template v-if="!canEdit">
                <el-image class="sample-img" :src="form.buyerEntrust" fit="fill" @click="onSwitch(srcIndex)" />
              </template>
              <template v-else>
                <el-input v-model="form.medicalPermit" style="display: none" />
                <el-image v-if="form.buyerEntrust" class="sample-img" @click="onSwitch(srcIndex)"
                  :src="form.buyerEntrust" fit="fill" />
                <i v-else class="el-icon-plus avatar-uploader-icon" />
                <div class="flex">
                  <el-tooltip class="item" effect="dark" content="点击上传修改图片" placement="top" :enterable="false">
                    <el-upload class="click-uploader" action="/admin/system/sysFile/uploadImg" :show-file-list="false"
                      :on-success="(res,file)=>uploadSuccess(res,file,'buyerEntrust')"
                      :before-upload="(file)=>uploadBefore(file,'img',2)">
                      <i class="el-icon-edit-outline avatar-uploader-icon" />
                    </el-upload>
                  </el-tooltip>
                </div>
              </template>
            </el-form-item>
            <el-form-item label="是否通过:" :label-width="formLabelWidth" required>
              <el-switch v-model="buyerEntrustStatusSwitch" :disabled="!canEdit" active-text="是" inactive-text="否" />
            </el-form-item>
            <el-form-item v-if="buyerEntrustStatusSwitch" label="有效期至:" :label-width="formLabelWidth">
              <template v-if="!canEdit">
                <span v-if="form.buyerEntrustTime">{{ form.buyerEntrustTime.slice(0,10) }}</span>
                <span v-else>暂无</span>
              </template>
              <template v-else>
                <el-date-picker v-model="form.buyerEntrustTime" value-format="yyyy-MM-dd HH:mm:ss"
                  :picker-options="expireTimeOption" type="date" placeholder="选择日期" />
              </template>
            </el-form-item>
            <el-form-item v-if="!buyerEntrustStatusSwitch" label="原因:" :label-width="formLabelWidth" required>
              <el-select v-model="form.buyerEntrustCause" :disabled="!canEdit" placeholder="请选择" filterable>
                <el-option v-for="item in buyerReasons" :key="item.id" :label="item.reason" :value="item.id" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="isShowBuyerNote && canEdit" label="说明:" :label-width="formLabelWidth" required>
              <el-input v-model="form.buyerEntrustNote" class="txt-input" :maxlength="100" placeholder="最多可输入100个字" />
            </el-form-item>
          </div>
        </el-form>
        <div class="end">
          <el-button type="primary" @click="goBack()">返 回</el-button>
          <el-button type="danger" @click="reject()">一键拒绝</el-button>
          <el-button type="primary" @click="submitCertification()">提 交</el-button>
        </div>
      </el-main>
      <div class="right">
        <el-aside width="500px" height="800px">
          <imageViewer v-if="showViewer" :preview-Index="0" :on-close="onClose" :on-switch="onSwitch"
            :url-list="viewerImgList" :initialIndex="initialIndex" :z-index="0" />
        </el-aside>
      </div>

      <el-dialog title="拒绝审核" :visible.sync="popUpShow" width="50%" :before-close="detailDialogClose">
        <el-form ref="form" :model="form" label-width="80px">
          <el-form-item label="原因" required>
            <el-input type="textarea" v-model="popUpDesc" :maxlength="100" placeholder="最多可输入100个字"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="popUpShow = false">取 消</el-button>
          <el-button type="primary" @click="submitForm()">确 定</el-button>
        </span>
      </el-dialog>

    </el-container>
  </div>
</template>

<script>
  import {
    postJson
  } from '@/utils/request';
  import imageViewer from '../../../components/image-viewer/image-viewer.vue';
  import {
    getAppQualificationById,
    getVerifyRefuseReasonList
  } from '@/api/user'
  import {
    OPERATE_QUALIFICATION_TYPE,
    VERIFY_REASON_TYPE
  } from '@/utils/constant'
  import keymap from '@/utils/keymap'
  import {
    timestampToTime
  } from '@/utils/index'
  // import {
  //   regionData
  // } from 'element-china-area-data'
  import {
    updateCertification,
    auditCertification
  } from '@/api/user';
  import {
    getFindTree
  } from '@/api/user';
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
        medicalPermitStatusSwitch: true,
        buyerCardStatusSwitch: true,
        buyerEntrustStatusSwitch: true,
        id: null,
        form: {},
        previewImgList: [],
        canEdit: true,
        formLabelWidth: '120px',
        areaOptions: [],
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
      this.findTree()
      this.getReasonList()
    },
    watch: {
      medicalPermitStatusSwitch: {
        handler(newVal) {
          this.isShowMedicalNote = !newVal && (this.form.medicalPermitCause === '')
        },
        immediate: true
      },
      buyerCardStatusSwitch: {
        handler(newVal) {
          this.isShowCardNote = !newVal && (this.form.buyerCardCause === '')
        },
        immediate: true
      },
      buyerEntrustStatusSwitch: {
        handler(newVal) {
          this.isShowBuyerNote = !newVal && (this.form.buyerEntrustCause === '')
        },
        immediate: true
      },
      'form.medicalPermitCause': {
        handler(newVal) {
          this.isShowMedicalNote = (newVal == '') && !this.medicalPermitStatusSwitch
        },
        immediate: true
      },
      'form.buyerCardCause': {
        handler(newVal) {
          this.isShowCardNote = (newVal == '') && !this.buyerCardStatusSwitch
        },
        immediate: true
      },
      'form.buyerEntrustCause': {
        handler(newVal) {
          this.isShowBuyerNote = (newVal == '') && !this.buyerEntrustStatusSwitch
        },
        immediate: true
      }
    },
    methods: {
      getDetail(id) {
        getAppQualificationById({
          id
        }).then(res => {
          var medicalPermit = res.data.medicalPermit
          var buyerCardList = res.data.buyerCard.split(',')
          var buyerEntrust = res.data.buyerEntrust
          this.form = res.data
          console.log(this.form.provincesCode)
          this.form.provincesCode = this.form.provincesCode.split(',')
          this.form.medicalPermit = this.form.medicalPermit.split(',')[0] + ''
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
        })
      },

      findTree() {
        getFindTree().then(res => {
          var treeList = res.data.tree
          var option = this.eachReplaceKey(treeList)
          console.log(option)
          this.areaOptions = option
        })
      },

      eachReplaceKey(city) {
        let item = [];
        city.map(list => {
          let newData = {};
          newData.label = list.name;
          newData.value = list.code;
          if (list.cityTrees) {
            newData.children = this.eachReplaceKey(list.cityTrees)
          }
          item.push(newData);
        })
        return item;
      },

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
      onClose() {
        this.showViewer = false
      },
      // 切换图片
      onSwitch(index) {
        this.initialIndex = index
      },

      goBack() {
        this.$router.go(-1);
      },

      async reject() {
        this.medicalPermitStatusSwitch = false
        this.buyerCardStatusSwitch = false
        this.buyerEntrustStatusSwitch = false
        this.form.medicalPermitCause = ''
        this.form.buyerCardCause = ''
        this.form.buyerEntrustCause = ''
        await this.handleUpdateCertification()
        this.popUpShow = true
      },

      detailDialogClose() {
        this.$confirm('确认关闭一键拒审？')
          .then(_ => {
            this.popUpShow = false
          })
          .catch(_ => {});
      },
      uploadBefore(file, type, limit) {
        if (type === 'img') {
          const pic = ['image/jpeg', 'image/jpg', 'image/png']
          const isPic = pic.indexOf(file.type) > -1
          if (!isPic) {
            this.$message.error('仅支持jpg/png格式')
            return false
          }
        }
        const isLt = file.size / 1024 / 1024 < limit
        if (!isLt) {
          this.$message.error('文件大小不能超过 ' + limit + 'MB!')
          return false
        }
        return true
      },
      uploadSuccess(res, file, filedName) {
        if (res.success === 1) {
          this.$message({
            message: '提交成功',
            type: 'success'
          })
          this.form[filedName] = res.data.url
        } else {
          this.$message({
            type: 'error',
            message: res.msg
          })
        }
      },
      handleUpdateCertification() {
        if (this.form.medicalPermitNote == 'undefined') {
          this.form.medicalPermitNote = false
        }
        return new Promise(resolve => {
          if (!this.form) {
            return this.$message({
              type: 'error',
              message: '请填写相关资料'
            })
          }
          if (!this.selectedOptions.length) {
            return this.$message({
              type: 'error',
              message: '请选择机构位置'
            })
          }
          if (this.form.address == null || !this.form.address.trim()) {
            return this.$message({
              type: 'error',
              message: '请填写详情地址'
            })
          }
          if (!this.form.medicalPermit) {
            return this.$message({
              type: 'error',
              message: '请上传医疗执业许可证复印件'
            })
          }

          if (!this.form.buyerCard) {
            return this.$message({
              type: 'error',
              message: '请上传采购人身份证复印件'
            })
          }

          if (!this.form.buyerEntrust) {
            return this.$message({
              type: 'error',
              message: '请上传采购委托书复印件'
            })
          }
          resolve()
        })
      },

      // async saveCertification() {
      //   await this.handleUpdateCertification()
      //   this.$message({
      //     message: '保存成功',
      //     type: 'success'
      //   })
      //   await updateCertification(this.form)
      // },
      // 表单验证
      async submitCertification() {
        if (this.medicalPermitStatusSwitch) {
          if (this.form.organName == null || !this.form.organName.trim()) {
            return this.$message({
              type: 'error',
              message: '请填写机构名称'
            })
          }
          if (this.form.organNo == null || !this.form.organNo.trim()) {
            return this.$message({
              type: 'error',
              message: '请填写登记号'
            })
          }
        } else {
          if (!this.medicalPermitStatusSwitch && this.form.medicalPermitCause == null || !this
            .medicalPermitStatusSwitch && this.form.medicalPermitCause == '') {
            if (this.form.medicalPermitNote == null || this.form.medicalPermitNote == '') {
              return this.$message({
                type: 'error',
                message: '请填写医疗执业许可证拒绝原因'
              })
            }
          }
        }
        if (!this.buyerCardStatusSwitch && this.form.buyerCardCause == null || !this.buyerCardStatusSwitch && this
          .form.buyerCardCause == '') {
          if (this.form.buyerCardNote == null || this.form.buyerCardNote == '') {
            return this.$message({
              type: 'error',
              message: '请填写采购人身份证拒绝原因'
            })
          }
        }

        if (!this.buyerEntrustStatusSwitch && this.form.buyerEntrustCause == null || !this
          .buyerEntrustStatusSwitch && this.form.buyerEntrustCause == '') {
          if (this.form.buyerEntrustNote == null || this.form.buyerEntrustNote == '') {
            return this.$message({
              type: 'error',
              message: '请填写采购委托书拒绝原因'
            })
          }
        }

        if (this.form.medicalPermitTime) {
          this.form.medicalPermitTime = this.form.medicalPermitTime
        } else if ( this.medicalPermitStatusSwitch ) {
          this.form.medicalPermitTime = '2050-12-31 23:59:59'
        }

        if (this.form.buyerCardTime) {
          this.form.buyerCardTime = this.form.buyerCardTime
        } else if ( this.buyerCardStatusSwitch ) {
          this.form.buyerCardTime = '2050-12-31 23:59:59'
        }

        if (this.form.buyerEntrustTime) {
          this.form.buyerEntrustTime = this.form.buyerEntrustTime
        } else if ( this.buyerEntrustStatusSwitch ) {
          this.form.buyerEntrustTime = '2050-12-31 23:59:59'
        }
        this.transformation()
        this.subimt()
      },
      // 表单提交
      submitForm() {
        if (this.popUpDesc == '') {
          return this.$message({
            type: 'error',
            message: '请填写一键拒绝原因'
          })
          return false
        }
        var note = this.popUpDesc
        this.form.medicalPermitNote = note
        this.form.buyerCardNote = note
        this.form.buyerEntrustNote = note
        this.transformation()
        this.subimt()
      },

      transformation() {
        this.form.medicalPermitStatus = (this.medicalPermitStatusSwitch ? 1 : 2)
        this.form.buyerCardStatus = (this.buyerCardStatusSwitch ? 1 : 2)
        this.form.buyerEntrustStatus = (this.buyerEntrustStatusSwitch ? 1 : 2)
        this.form.cityCode = this.selectedOptions[this.selectedOptions.length - 1]
        this.form.provincesCode = this.selectedOptions.join(',')
      },
      // 提交post
      subimt() {
        let that = this
        that.$postJson('/user/appQualification/audit', this.form).then(res => {
              console.log(res)
              if (res.success === 1) {
                this.$message({
                  type: 'success',
                  message: res.msg
                });
                setTimeout(() => {
                  this.goBack();
                }, 600);
              } else {
                this.$message({
                  type: 'success',
                  message: res.msg
                });
                this.form.medicalPermitNote = ''
                this.form.buyerCardNote = ''
                this.form.buyerEntrustNote = ''
              }
            })
          },
          // 一键拒绝
          oneClickReject() {
            return new Promise(resolve => {
              if (this.popUpDesc == '') {
                return this.$message({
                  type: 'error',
                  message: '请填写一键拒绝原因'
                })
              }
              resolve()
            })
          },
          resetVerifyForm() {
            this.$refs.verifyForm.resetFields()
            setTimeout(() => {
              this.uniqueKey++
            }, 0)
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
      }


      ::v-deep .el-image-viewer__mask {
        display: none;
      }

      ::v-deep .el-image-viewer__wrapper {
        display: block;
        position: static;
        z-index: 0;
        max-height: 800px;
        max-width: 500px;
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
