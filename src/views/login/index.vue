<template>
  <div class="container">
    <div class="content-wrap">
      <div class="introduction">
        <div class="welcome">欢迎登录</div>
        <div class="line"></div>
        <div class="title1">禾大夫APP</div>
        <div class="title2"><span>后台管理系统</span><span>Ｖ1.0.0</span></div>
        <div class="explain">基层医生一站式服务平台</div>
        <div class="tel-wrap">
          <div class="tel-label">联系我们</div>
          <div class="tel">
            <img src="@/assets/login/tel.png" />
            <span>400 9689658</span>
          </div>
        </div>
      </div>
      <div class="card">
        <el-form
          ref="loginForm"
          :model="loginForm"
          :rules="loginRules"
          autocomplete="on"
        >
          <div class="logo">
            <img src="@/assets/login/logo.png" />
          </div>
          <el-form-item prop="username">
            <el-input
              ref="username"
              v-model="loginForm.username"
              placeholder="输入后台登录账号"
              name="username"
              type="text"
              tabindex="1"
              style="font-size:23px"
            ></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              :key="passwordType"
              ref="password"
              v-model="loginForm.password"
              :type="passwordType"
              placeholder="输入登录密码"
              name="password"
              tabindex="2"
              style="font-size:23px"
              @keyup.enter.native="handleLogin"
            />
          </el-form-item>

          <el-form-item prop="verifyCode">
            <el-input
              ref="verifyCode"
              v-model="loginForm.verifyCode"
              placeholder="输入验证码"
              name="verifyCode"
              type="text"
              tabindex="3"
              @keyup.enter.native="handleLogin"
              style="font-size:23px;width:60%"
            />
            <img
              style="margin-bottom: -3%;margin-left:21px"
              title="点击刷新验证码"
              height="37"
              width="29%"
              :src="verifyImg"
              alt="验证码"
              @click="getVerifyCode"
            />
          </el-form-item>

          <el-button
            :loading="loading"
            type="primary"
            @click.native.prevent="handleLogin"
            >登录</el-button
          >
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import { Message } from "element-ui";
export default {
  name: "Login",
  data() {
    return {
      verifyImg: "",
      loginForm: {
        username: "",
        password: "",
        verifyCode: "",
        uuid: ""
      },
      loginRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" }
        ],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }],
        verifyCode: [
          { required: true, message: "请输入验证码", trigger: "blur" }
        ]
      },
      loading: false,
      passwordType: "password",
      redirect: undefined
    };
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true
    }
  },
  created() {
    var type = this.$route.query.type;
    var unAuthMsg = localStorage.getItem("unAuthMsg");
    if (type === "reLogin") {
      if (!unAuthMsg) {
        unAuthMsg = "请登录";
      }
      Message({
        message: unAuthMsg,
        type: "error",
        duration: 2000 // ms
      });
    }
    this.getVerifyCode();
  },
  methods: {
    getVerifyCode() {
      var that = this;
      that.$get("/verifyCode", { random: Math.random() }).then(res => {
        /* var blob = new Blob([res])
        that.verifyImg = URL.createObjectURL(blob)*/
        that.verifyImg = res.data.base64;
        that.loginForm.uuid = res.data.uuid;
      });
    },
    handleLogin() {
      var that = this;
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true;
          // BASE64编码一次
          var param = {
            username: that.loginForm.username,
            password: window.btoa(that.loginForm.password),
            verifyCode: that.loginForm.verifyCode,
            uuid: that.loginForm.uuid
          };
          this.$store
            .dispatch("user/login", param)
            .then(res => {
              if (res.success === 1) {
                this.$router.push({ path: this.redirect || "/" });
                window.location.reload();
              } else {
                this.getVerifyCode();
              }
              this.loading = false;
            })
            .catch(() => {
              this.loading = false;
            });
        } else {
          return false;
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100%;
  background-image: url("../../assets/login/bg.png");
  background-size: 100% 100%;
  background-position: 0 0;
  background-repeat: no-repeat;
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.content-wrap {
  height: 556px;
  width: 1249px;
  transform: scale(0.8);
  background-image: url("../../assets/login/wrap-bg.png");
  background-size: 100% 100%;
  background-position: 0 0;
  background-repeat: no-repeat;
  position: relative;
  .introduction {
    margin: 80px 0 0 100px;
    color: #fff;
    .welcome {
      font-size: 38px;
      font-family: SourceHanSansCN, SourceHanSansCN-Light;
      font-weight: 300;
      color: #ffffff;
      letter-spacing: 3px;
    }
    .line {
      width: 37px;
      height: 3px;
      background: #ffffff;
      margin-top: 23px;
    }
    .title1 {
      font-size: 60px;
      font-family: Source Han Sans CN, Source Han Sans CN-Bold;
      font-weight: 700;

      color: #ffffff;
      letter-spacing: 3px;
      margin-top: 34px;
    }
    .title2 {
      margin-top: 22px;
      font-weight: 700;
      span:first-child {
        font-size: 48px;
        font-family: Source Han Sans CN, Source Han Sans CN-Bold;

        color: #ffffff;
        letter-spacing: 2px;
      }
      span:last-child {
        font-size: 24px;
        font-family: PingFang SC, PingFang SC-Bold;
        color: #ffffff;
        letter-spacing: -2px;
      }
    }
    .explain {
      font-size: 26px;
      font-family: PingFang SC, PingFang SC-Regular;
      font-weight: 400;
      text-align: left;
      color: #f0f0f0;

      letter-spacing: 9px;
      margin-top: 30px;
    }
    .tel-wrap {
      display: flex;
      align-items: center;
      margin-top: 50px;
      .tel-label {
        width: 109px;
        height: 42px;
        border: 1px solid #ffffff;
        border-radius: 4px;
        font-size: 20px;
        font-family: Source Han Sans CN, Source Han Sans CN-Regular;
        font-weight: 400;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .tel {
        margin-left: 23px;
        font-size: 20px;
        font-family: PingFang SC, PingFang SC-Bold;
        font-weight: 700;

        color: #ffffff;

        letter-spacing: 2px;
        img {
          margin-right: 0px;
          width: 16px;
        }
      }
    }
  }
  .card {
    position: absolute;
    top: -14px;
    right: 102px;
    width: 470px;
    height: 560px;
    border-radius: 16px;
    background-color: #fff;
    padding: 0 43px;
    .logo {
      text-align: center;
      margin-top: 45px;
      margin-bottom: 42px;
      img {
        width: 239px;
      }
    }
    >>> .el-form-item {
      margin-bottom: 30px;
      font-size: 20px !important;
    }
    >>> .el-input {
      font-size: 20px !important;
      background-color: #fff;
    }
    >>> .el-input::-webkit-scrollbar-thumb {
      background-color: #fff;
    }
    >>> .el-input input {
      height: 60px;
      border-radius: 30px;
      font-size: 20px !important;
      color: #a5a5a5;
      padding: 0 38px;
      background-color: #fff !important;
    }
    >>> .el-input input:focus {
      border-color: #ff763a;
    }
    >>> .el-input input:-webkit-autofill {
      box-shadow: 0 0 0px 1000px #fff inset !important; //改成你想要的背景色
      -webkit-text-fill-color: #000 !important;
      font-size: 20px;
    }
    >>> .el-input input:-webkit-autofill::first-line {
      font-size: 20px;
    }
    >>> .el-form-item__error {
      font-size: 14px;
      top: 110%;
      left: 33px;
    }

    >>> .el-button {
      width: 383px;
      height: 56px;
      background: #ff763a;
      border-radius: 28px;
      box-shadow: 0px 10px 10px 0px rgba(255, 117, 57, 0.28);
      border-color: #ff763a;
      margin-top: 8px;

      font-size: 24px;
      font-family: Microsoft YaHei, Microsoft YaHei-Regular;
      font-weight: 400;
      text-align: center;
      color: #ffffff;
      letter-spacing: 6px;
    }
  }
}
</style>
