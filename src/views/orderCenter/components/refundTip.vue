<template>
  <el-dialog
    title="提示"
    :visible.sync="showDialog"
    width="600px"
    :before-close="handleClose"
  >
    <div class="dialog-content-rap">
      <div>
        您将操作
        <span class="red-color">{{
          info.isAll === 1 ? "整单退款" : "退款"
        }}</span>
        给客户，<span class="red-color" v-if="info.isAll !== 1"
          >且只能退款一次</span
        >
        ，一旦确认将不可取消，请慎重操作！
      </div>
      <div>店铺：{{ info.storeName }}</div>
      <div>客户：{{ info.deliveryName }}</div>
      <div>
        实付金额：<span class="font-bold"
          >¥ {{ info.finalPrice + info.refundPrice }}</span
        >
      </div>
      <div class="price-explain">
        （商品金额：¥
        {{ info.finalPrice + info.refundPrice - info.deliveryPrice }}
        快递金额：¥ {{ info.deliveryPrice }}）
      </div>
      <template v-if="info.isAll !== 1">
        <div>
          调整后金额：<span class="font-bold">¥ {{ info.finalPrice }}</span>
        </div>
        <div class="price-explain">
          （商品金额：¥ {{ info.finalPrice - info.deliveryPrice }} 快递金额：¥
          {{ info.deliveryPrice }}）
        </div>
      </template>

      <div>
        退款金额：<span class="font-bold">¥ {{ info.refundPrice }}</span>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleClose">取 消</el-button>
      <el-button type="primary" size="small" @click="handleConfirm"
        >确 定</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
export default {
  props: {
    showDialog: {
      default: true,
      type: Boolean
    },
    info: {
      default: {},
      type: Object
    }
  },
  methods: {
    handleClose() {
      this.$emit("closeDialog");
    },
    handleConfirm() {
      this.$emit("clickConfirm");
    }
  }
};
</script>

<style scoped lang="scss">
.dialog-content-rap {
  > div {
    margin-top: 10px;
  }
  > div:first-child {
    margin-top: 0;
  }
  .red-color {
    color: #f40;
  }
  .price-explain {
    padding-left: 40px;
  }
  .font-bold {
    font-weight: bold;
  }
}
</style>
