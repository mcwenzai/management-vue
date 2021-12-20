<template>
  <div class="course-edit">
    <el-container>
      <el-header class="operate-part">
        <div class="flex">
          <div class="title">添加课程</div>
        </div>
        <span class="buttons">
          <el-button @click="goBack()">取消</el-button>
          <el-button @click="submitCertification()" type="primary"> 保存 </el-button>
        </span>
      </el-header>
      <el-main>
        <el-form ref="form" :model="form" label-width="80px" :rules="rules">
          <el-form-item label="课程名称" prop="courseName" :required="true">
            <el-input v-model="form.courseName" placeholder="请输入课程名称" style="width: 50%;" :maxlength="50"></el-input>
          </el-form-item>
          <el-form-item label="课程封面" prop="courseCover" :required="true">
            <div class="flex">
              <el-upload :class="{uoloadSty:showCoverImg,disUoloadSty:noneCoverImg}"
                action="/admin/system/sysFile/uploadImg" list-type="picture-card" :on-success="coverUpSu"
                :before-upload="(file)=>coverOrIntroCert(file,'img',3)" :on-remove="coverRemove"
                :on-preview="handlePictureCardPreview" :on-change="coverChange" :limit="1">
                <i slot="default" class="el-icon-plus"></i>
              </el-upload>
            </div>
          </el-form-item>
          <el-form-item label="章节" :required="true">
            <div class="section">
              <div class="sort">
                <span>排序</span>
              </div>
              <div class="name">
                <span>章节名称</span>
              </div>
              <div class="medio">
                <span>章节视频</span>
              </div>
              <div class="add">
                <i class="el-icon-circle-plus-outline" @click="addSection()"></i>
              </div>
            </div>
            <div class="input-flex" v-for="(i,j) in form.specialCourseSectionList">
              <el-input v-model="i.sort" style="width: 60px;margin-right: 30px;text-align: center;"
                onkeyup="value=value.replace(/[^\d]/g,'')" maxlength="3"></el-input>
              <el-input v-model="i.sectionName" placeholder="请输入章节名称" style="width: 340px;margin-right: 30px;"
                :maxlength="50">
              </el-input>
              <el-image v-if="i.sectionUrl" class="sample-img" :src="i.sectionUrl" fit="fill">
                <div slot="error" class="image-slot">
                  <i class="el-icon-video-camera"></i>
                </div>
              </el-image>
              <el-upload :class="{uoloadSty:!i.sectionUrl,disUoloadSty:i.sectionUrl}" v-else
                action="/admin/system/sysFile/uploadImg" list-type="picture-card"
                :on-success="(res,file)=>sectionUpSu(res,file,j)" accept=".mp4" :before-upload="sectionUpBe"
                :on-remove="(res,file)=>sectionMedioRemove(res,file,j)" :limit="1">
                <i slot="default" class="el-icon-plus"></i>
              </el-upload>
              <i class="el-icon-remove-outline" @click="removeSection(j)"></i>
            </div>
          </el-form-item>
          <el-form-item label="课程介绍" prop="courseIntro" :required="true">
            <el-upload :class="{uoloadSty:showIntroImg,disUoloadSty:noneIntroImg}"
              action="/admin/system/sysFile/uploadImg" list-type="picture-card" :on-success="introUpSu"
              :before-upload="(file)=>coverOrIntroCert(file,'img',3)" :on-remove="introRemove"
              :on-preview="handlePictureCardPreview" :on-change="introChange" :limit="9">
              <i slot="default" class="el-icon-plus"></i>
            </el-upload>
          </el-form-item>
          <el-form-item label="展示价格" :required="true">
            <el-input-number v-model="form.price" :min="1" :precision="2" :step="1" :max="9999">
            </el-input-number>
          </el-form-item>
          <el-form-item label="排序" :required="true">
            <el-input-number v-model="form.sort" :min="1" :max="999">
            </el-input-number>
          </el-form-item>
          <el-form-item label="状态" :required="true">
            <el-radio v-model="form.status" label="1">上架</el-radio>
            <el-radio v-model="form.status" label="0">下架</el-radio>
          </el-form-item>
        </el-form>
      </el-main>
      <el-footer>
        <el-button @click="goBack()">取消</el-button>
        <el-button @click="submitCertification()" type="primary"> 保存 </el-button>
      </el-footer>
    </el-container>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="大图模式">
    </el-dialog>
  </div>
</template>

<script>
  import imgUpload from '@/components/ImgUpload';
  import {
    postCourseAdd,
    getCourseById
  } from '@/api/course';
  export default {
    components: {
      imgUpload
    },
    data() {
      return {
        form: {
          specialId: '',
          courseName: '',
          courseCover: '',
          specialCourseSectionList: [],
          courseIntro: '',
          price: '',
          sort: '',
          status: '1',
        },
        sectionSort: '',
        sectionName: '',
        sectionUrl: '',
        introArray: [],
        sectionfile: [],
        coverFile: '',
        showCoverImg: true,
        showSectionImg: true,
        showIntroImg: true,
        noneCoverImg: false,
        noneSectionImg: false,
        noneIntroImg: false,
        limitCoverImg: 1,
        limitSectionImg: 1,
        limitIntroImg: 9,
        state: '1',
        priceNum: 1,
        sortNum: 1,
        dialogImageUrl: '',
        dialogVisible: false,
        disabled: false,
        fileUrl: '',
        introFileUrl: '',
        medioIsShow: true,
        rules: {
          courseName: [{
            required: true,
            message: '请输入课程名称',
            trigger: 'blur'
          }],
          courseCover: [{
            required: true,
            message: '请上传课程封面',
            trigger: 'blur'
          }],
          courseIntro: [{
            required: true,
            message: '请上传课程介绍图',
            trigger: 'change'
          }],
          price: [{
            required: true,
            message: '请填写课程价格',
            trigger: 'change'
          }],
          sort: [{
            required: true,
            message: '请选择课程排序',
            trigger: 'change'
          }],
          status: [{
            required: true,
            message: '请选择课程状态',
            trigger: 'change'
          }],
          specialCourseSectionList: [{
            required: true,
            message: '请上传课程章节',
            trigger: 'change'
          }]
        }
      };
    },
    created() {
      var id = this.$route.query.id
      this.form.specialId = id
    },
    methods: {
      handlePictureCardPreview(file) {
        this.dialogImageUrl = file.url;
        this.dialogVisible = true;
      },
      coverOrIntroCert(file, type, limit) {
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
      coverUpSu(res, file, filedName) {
        this.fileUrl = file.url
        if (res.success === 1) {
          this.form.courseCover = res.data.url
        } else {
          this.$message({
            type: 'error',
            message: res.msg
          })
        }
      },
      // 封面上传钩子
      coverChange(file, fileList) {
        this.noneCoverImg = fileList.length >= this.limitCoverImg;
      },
      // 封面移除
      coverRemove(file, fileList) {
        this.noneCoverImg = fileList.length >= this.limitCoverImg;
      },
      // 介绍上传成功
      introUpSu(res, file, fileList) {
        this.introFileUrl = file.url
        if (res.success === 1) {
          var introArr
          introArr = fileList.map(item => {
            return item.response.data.url
          })
          this.form.courseIntro = introArr.join(',')
        } else {
          this.$message({
            type: 'error',
            message: res.msg
          })
        }
      },
      // 介绍上传钩子
      introChange(file, fileList) {
        this.noneIntroImg = fileList.length >= this.limitIntroImg;
      },
      // 介绍删除
      introRemove(file, fileList) {
        this.noneIntroImg = fileList.length >= this.limitIntroImg;
      },
      // 章节视频上传判断
      sectionUpBe(file) {
        const extension = file.type
        if (extension != 'video/mp4') {
          this.$message({
            message: '请上传mp4视频',
            type: 'error'
          })
          return extension
        }
      },
      // 章节视频上传成功
      sectionUpSu(res, file, i) {
        this.sectionfile = file;
        if (res.success === 1) {
          this.form.specialCourseSectionList[i].sectionUrl = res.data.url;
        } else {
          this.$message({
            type: 'error',
            message: res.msg
          })
        }
      },
      // 章节媒体删除
      sectionMedioRemove(file, fileList, i) {
        this.form.specialCourseSectionList[i].sectionUrl = '';
      },
      // 表单验证
      submitCertification() {
        if (this.form.courseName == '') {
          return this.$message({
            type: 'error',
            message: '请填写课程标题'
          })
          return false
        }
        if (this.form.courseCover == '') {
          return this.$message({
            type: 'error',
            message: '请上传课程封面'
          })
          return false
        }
        if (this.form.courseIntro == '') {
          return this.$message({
            type: 'error',
            message: '请上传课程介绍图'
          })
          return false
        }
        if (this.form.price == '') {
          return this.$message({
            type: 'error',
            message: '请填写课程价格'
          })
          return false
        }

        if (this.form.sort == '') {
          return this.$message({
            type: 'error',
            message: '请填写课程排序'
          })
          return false
        }

        if (this.form.specialCourseSectionList.length == 0) {
          return this.$message({
            type: 'error',
            message: '请上传课程章节'
          })
          return false
        }
        var sectionName, sectionUrl, sort
        var speSectionList = this.form.specialCourseSectionList
        for (let i = 0; i < speSectionList.length; i++) {
          sectionName = speSectionList[i].sectionName
          sectionUrl = speSectionList[i].sectionUrl
          sort = speSectionList[i].sort
        }

        if (sectionName == '') {
          return this.$message({
            type: 'error',
            message: '请填写章节名称'
          })
          return false
        }

        if (sectionUrl == '') {
          return this.$message({
            type: 'error',
            message: '请上传章节媒体文件'
          })
          return false
        }

        if (sort == null || sort == '') {
          return this.$message({
            type: 'error',
            message: '请填写章节排序'
          })
          return false
        }
        this.submitForm()
      },
      // 表单提交
      submitForm() {
        postCourseAdd(this.form).then((res) => {
          setTimeout(() => {
            this.goBack();
          }, 400);
        });
      },
      // 添加章节
      addSection() {
        var sectionData = {
          sectionName: '',
          sectionUrl: '',
          sort: null
        }
        this.form.specialCourseSectionList.push(sectionData)
      },
      // 删除章节
      removeSection(j) {
        var specialData = this.form.specialCourseSectionList
        specialData.splice(j, 1)
      },
      // 返回上一页
      goBack() {
        this.$router.go(-1);
      }
    }
  };
</script>

<style lang="scss" scoped>
  .operate-part {
    display: flex;
    justify-content: space-between;
    padding: 30px 20px 20px 30px;
    text-align: center;

    .el-input {
      width: 200px;
    }
  }

  .bg-purple {
    font-size: 16px;
    color: #414141;

    i {
      font-size: 30px;
      line-height: 40px;
    }
  }

  .section {
    display: flex;
    height: 40px;
    line-height: 40px;
    font-size: 15px;
    line-height: 40px;
    align-items: center;

    .sort {
      width: 90px;
    }

    .name {
      width: 370px;
    }

    .medio {
      width: 130px;
    }

    .add {
      width: 60px;

      .el-icon-circle-plus-outline {
        font-size: 28px;
      }
    }
  }

  .el-icon-video-camera-solid {
    font-size: 40px;
    text-align: center;
    line-height: 70px;
  }

  .input-flex {
    display: flex;
    align-items: center;
  }

  .sample-img {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 80px;
    height: 80px;
    background: #f5f7fa;
    color: #909399;
    font-size: 25px;
    margin-right: 50px;
  }

  ::v-deep .el-form-item__content {
    margin-left: 30px;
  }

  ::v-deep .el-upload--picture-card {
    width: 80px;
    height: 80px;
    line-height: 88px;
    margin-right: 50px;
  }

  ::v-deep .uploadBox {
    width: 80px;
    height: 80px;
  }

  ::v-deep .cover .el-upload-list--picture-card .el-upload-list__item {
    width: 80px;
    height: 80px;
  }

  ::v-deep .introduce .el-upload-list--picture-card .el-upload-list__item {
    width: 80px;
    height: 80px;
  }

  ::v-deep .uoloadSty .el-upload-list--picture-card .el-upload-list__item {
    width: 80px;
    height: 80px;
  }

  ::v-deep .disUoloadSty .el-upload-list--picture-card .el-upload-list__item {
    width: 80px;
    height: 80px;
    margin-right: 20px;
  }

  ::v-deep .el-footer {
    width: 1600px;
    text-align: center;
    height: 40px;
  }

  .picture-card {
    margin-right: 30px;
  }

  .el-icon-remove-outline {
    font-size: 30px;
  }

  ::v-deep .uoloadSty .el-upload--picture-card {
    width: 80px;
    height: 80px;
    line-height: 88px;
    margin-right: 50px;
  }

  ::v-deep .disUoloadSty .el-upload--picture-card {
    display: none;
  }
</style>
