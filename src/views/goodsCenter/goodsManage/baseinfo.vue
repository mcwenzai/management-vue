<template>
  <div class="baseinfo">
    <span class="input">
      <el-input v-model="form.goodsInfoList[index].title" maxlength="8"></el-input>
      <span></span>
      <el-input v-model="form.goodsInfoList[index].content" maxlength="200"></el-input>
    </span>
    <span class="buttons">
      <el-button v-if="index" @click="subInfo()" icon="el-icon-minus" type=""></el-button>
      <el-button @click="addInfo()" type="primary" icon="el-icon-plus"></el-button>
    </span>
  </div>
</template>

<script>
export default {
  props:["form", "index"],
  data() {
    return {};
  },

  methods: {
    addInfo() {
    //   console.log("发送事件", this.form);
      this.$emit("addInfo");
    },
    subInfo() {
    //   console.log("发送删除事件");
      this.$emit("subInfo");
    },
  },
};
</script>

<style lang='scss' scoped>
.baseinfo {
  display: flex;
  justify-content: space-between;
  //   padding: 30px;
  text-align: center;
  box-sizing: content-box;
  .input {
    flex: 1;
    display: flex;
    flex-wrap: nowrap;
    padding: 0px 165px 0px 100px;
    .el-input {
      padding-left: 20px;
    }
  }
}
.buttons {
  padding-right: 20px
}
</style>
