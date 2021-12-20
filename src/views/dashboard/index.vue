<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card>
          <div slot="header">
            <span style="color: #898c93">当前用户信息</span>
          </div>
          <div style="text-align: center;">
            <el-image style="width:50%;border-radius: 90px"
              :src="userInfo.headimg?userInfo.headimg:'/images/default_head_img.jpg'" fit="fit">
            </el-image>
          </div>
          <div style="text-align: center;margin-top: 10px">
            <el-tag type="success" effect="plain">{{userInfo.username}}</el-tag>
          </div>

          <div>
            <el-divider content-position="center"><span style="color: #898c93">{{userInfo.nickname}}</span></el-divider>
            <el-tag>{{userInfo.menus[0].title}}</el-tag>
            <el-tag type="success">{{userInfo.menus[1].title}}</el-tag>
            <el-tag type="info">{{userInfo.menus[2].title}}</el-tag>
            <el-tag type="warning">{{userInfo.menus[3].title}}</el-tag>
            ...
          </div>

        </el-card>
      </el-col>
      <el-col :span="18">
        <el-card class="box-card">
          <el-tabs v-model="activeName">
            <el-tab-pane label="日历" name="first">
              <el-calendar v-model="currentDate">
              </el-calendar>
            </el-tab-pane>
            <el-tab-pane label="TimeLine" name="second">
              <el-timeline>
                <el-timeline-item timestamp="2021/10/19" placement="top">
                  <el-card>
                    <h4>更新正式版本1.0.2</h4>
                    <p>mc文仔 提交于 2021/10/19 12:46</p>
                  </el-card>
                </el-timeline-item>
                <el-timeline-item timestamp="2021/10/10" placement="top">
                  <el-card>
                    <h4>更新正式版本1.0.1</h4>
                    <p>mc文仔 提交于 2021/10/10 12:12</p>
                  </el-card>
                </el-timeline-item>
                <el-timeline-item timestamp="2021/10/05" placement="top">
                  <el-card>
                    <h4>更新正式版本1.0.0</h4>
                    <p>mc文仔 提交于 2021/10/05 16:45</p>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  export default {
    name: 'Dashboard',
    created() {
      this.userInfo = JSON.parse(localStorage.getItem('userInfo'))
    },
    data() {
      return {
        userInfo: {},
        currentDate: new Date(),
        activeName: 'first'
      }
    }
  }
</script>

<style lang="scss" scoped>
  .dashboard {
    &-container {
      margin: 30px;
    }
  }

  .el-carousel__item h3 {
    color: #475669;
    font-size: 14px;
    opacity: 0.75;
    line-height: 200px;
    margin: 0;
  }

  .el-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
  }

  .el-carousel__item:nth-child(2n+1) {
    background-color: #d3dce6;
  }
</style>
