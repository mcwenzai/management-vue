<template>
  <div class="refund-container">
    <div class="store-info">
      <div class="header-left">
        <span>编辑订单</span>

        <span class="store-name">
          店铺名称：<span>{{
            info.ordersSub && info.ordersSub.storeName
          }}</span>
        </span>
      </div>
      <div class="header-right">
        <template
          v-if="
            info.ordersSub &&
              (info.ordersSub.status === 2 || info.ordersSub.status === 3)
          "
        >
          <el-button size="small" type="primary" @click="handleRefund('all')"
            >整单退款</el-button
          >
          <el-button size="small" type="primary" @click="cancelRefund"
            >取消</el-button
          >
          <el-button size="small" type="primary" @click="handleRefund"
            >确定</el-button
          >
        </template>
        <template v-else>
          <el-button size="small" type="primary" @click="cancelRefund"
            >返回</el-button
          >
        </template>
      </div>
    </div>

    <div class="order-table">
      <!-- 颗粒 -->
      <div v-if="type === 1">
        <el-table
          :data="info.detailList"
          border
          style="width: 100%;margin-top:20px"
        >
          <el-table-column prop="goodsName" label="商品名称"> </el-table-column>
          <el-table-column label="店铺商品编码" prop="goodsId">
          </el-table-column>
          <el-table-column label="规格当量">
            <template slot-scope="scope">
              {{ scope.row.skuName }}/{{ scope.row.effectRatio }}
            </template>
          </el-table-column>
          <el-table-column label="单价(元)" prop="price"> </el-table-column>
          <el-table-column label="数量" prop="amount"> </el-table-column>
          <el-table-column label="金额(元)" prop="money"> </el-table-column>
          <el-table-column label="退款数量" prop="refundAmount">
            <template slot-scope="scope">
              <div>
                <div
                  v-if="
                    info.ordersSub.status === 2 || info.ordersSub.status === 3
                  "
                >
                  <el-input-number
                    :value="scope.row.refundAmount"
                    @change="
                      e => {
                        handleChange(e, scope.row);
                      }
                    "
                    :min="0"
                    :max="scope.row.amount + scope.row.refundAmount"
                    label="描述文字"
                    size="small"
                    :step="1"
                  ></el-input-number>
                </div>
                <div v-else>{{ scope.row.refundAmount }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="退款金额(元)" prop="refundMoney">
          </el-table-column>
        </el-table>
      </div>
      <!-- 饮片 -->
      <div v-if="type === 2">
        <el-table
          :data="info.detailList"
          border
          style="width: 100%;margin-top:20px"
        >
          <el-table-column prop="goodsName" label="商品名称"> </el-table-column>
          <el-table-column label="店铺商品编码" prop="goodsId">
          </el-table-column>
          <el-table-column label="规格包装信息" prop="skuName">
          </el-table-column>
          <el-table-column label="产地" prop="place"> </el-table-column>
          <el-table-column label="单价(元)" prop="price"> </el-table-column>
          <el-table-column label="数量" prop="amount"> </el-table-column>
          <el-table-column label="金额(元)" prop="money"> </el-table-column>
          <el-table-column label="退款数量" prop="refundAmount">
            <template slot-scope="scope">
              <div>
                <div
                  v-if="
                    info.ordersSub.status === 2 || info.ordersSub.status === 3
                  "
                >
                  <el-input-number
                    :value="scope.row.refundAmount"
                    @change="
                      e => {
                        handleChange(e, scope.row);
                      }
                    "
                    :min="0"
                    :max="scope.row.amount + scope.row.refundAmount"
                    label="描述文字"
                    size="small"
                    :step="1"
                  ></el-input-number>
                </div>
                <div v-else>{{ scope.row.refundAmount }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="退款金额(元)" prop="refundMoney">
          </el-table-column>
        </el-table>
      </div>
      <!-- 成药 -->
      <div v-if="type === 0">
        <el-table
          :data="info.detailList"
          border
          style="width: 100%;margin-top:20px"
        >
          <el-table-column prop="goodsName" label="商品名称"> </el-table-column>
          <el-table-column label="店铺商品编码" prop="goodsId">
          </el-table-column>
          <el-table-column label="规格包装信息" prop="skuName">
          </el-table-column>
          <el-table-column label="单价(元)" prop="price"> </el-table-column>
          <el-table-column label="数量" prop="amount"> </el-table-column>
          <el-table-column label="金额(元)" prop="money"> </el-table-column>
          <el-table-column label="退款数量" prop="refundAmount">
            <template slot-scope="scope">
              <div>
                <div
                  v-if="
                    info.ordersSub.status === 2 || info.ordersSub.status === 3
                  "
                >
                  <el-input-number
                    :value="scope.row.refundAmount"
                    @change="
                      e => {
                        handleChange(e, scope.row);
                      }
                    "
                    :min="0"
                    :max="scope.row.amount + scope.row.refundAmount"
                    label="描述文字"
                    size="small"
                    :step="1"
                  ></el-input-number>
                </div>
                <div v-else>{{ scope.row.refundAmount }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="退款金额(元)" prop="refundMoney">
          </el-table-column>
        </el-table>
      </div>

      <!-- 最终金额显示区域 -->
      <div class="total-price-wrap">
        <div>
          总金额：<span
            >￥{{ info.ordersSub && info.ordersSub.payableMoney }}</span
          >
        </div>
        <div>
          (含快递金额￥{{ info.ordersSub && info.ordersSub.deliveryFee }})
        </div>
        <div>
          调整后总金额：<span>￥{{ finalPrice }}</span>
        </div>
        <div v-if="finalPrice">
          (含快递金额￥{{ info.ordersSub && info.ordersSub.deliveryFee }})
        </div>
        <div>
          需退款总金额：<span
            >￥{{
              finalPrice
                ? refundPrice
                : info.ordersSub && info.ordersSub.payableMoney
            }}</span
          >
        </div>
        <div v-if="!finalPrice">
          (含快递金额￥{{ info.ordersSub && info.ordersSub.deliveryFee }})
        </div>
      </div>
      <!-- 退款记录 -->
      <div class="refund-order-wrap" v-if="orderList.length">
        <div class="refund-title">
          <el-divider></el-divider>
          <div class="refund-title-text">退款记录</div>
        </div>
        <el-table :data="orderList" border style="width: 100%;margin-top:20px">
          <el-table-column type="index" label="序号" width="50">
          </el-table-column>
          <el-table-column label="变更时间" prop="createTime">
          </el-table-column>

          <el-table-column label="变更人" prop="creator"> </el-table-column>
          <el-table-column label="操作前订单总金额(元)" prop="originMoney">
          </el-table-column>
          <el-table-column label="退款后订单总金额(元)" prop="finalMoney">
          </el-table-column>

          <el-table-column label="退款金额(元)" prop="refundMoney">
          </el-table-column>
        </el-table>
      </div>
      <!-- 退款提示 -->
      <refund-tip-compon
        :showDialog="showRefundTip"
        @closeDialog="closeSumbitTip"
        :info="submitInfo"
        @clickConfirm="confirmSubmit"
      ></refund-tip-compon>
    </div>
  </div>
</template>

<script>
import refundTipCompon from "./components/refundTip.vue";
export default {
  data() {
    return {
      info: {},
      type: 0,
      orderList: [],
      orderSubId: null,
      showRefundTip: false,
      submitInfo: {}
    };
  },
  created() {
    this.getInfo();
  },
  components: {
    refundTipCompon
  },
  computed: {
    refundPrice() {
      const list = this.info.detailList || [];
      if (!list.length) return 0;
      let total = 0;
      list.forEach(item => {
        total += Math.round(item.refundAmount * item.price * 100) / 100;
      });
      return Math.round(total * 100) / 100;
    },
    finalPrice() {
      const obj = { ...this.info.ordersSub };
      if (!obj.payableMoney) return 0;
      const res = obj.payableMoney - this.refundPrice;

      if (res === obj.deliveryFee) return 0;
      return Math.round(res * 100) / 100;
    }
  },
  methods: {
    handleChange(e, row) {
      const v = Math.round(e);
      const o = row.refundAmount + row.amount;
      row.refundAmount = v;
      row.refundMoney = Math.round(v * row.price * 100) / 100;
      row.amount = o - v;
      row.money = Math.round(row.amount * row.price * 100) / 100;
    },
    async getInfo() {
      const infoStr = this.$route.query.info || "{}";
      const info = JSON.parse(infoStr);

      this.type = info.goodsType;
      this.orderSubId = info.id;
      const res = await this.$get("/order/ordersRefund/orderSubDetail", {
        orderSubId: info.id
      });
      if (res.success !== 1) return;
      // console.log(res.data);
      const data = res.data;

      if (data.detailList) {
        data.detailList.forEach(item => {
          item.refundAmount = item.refundAmount || 0;
          item.amount = item.amount || 0;
          if (item.amount === item.refundAmount) item.amount = 0;
          item.money =
            Math.round((item.price || 0) * (item.amount || 0) * 100) / 100;
          item.refundMoney =
            Math.round((item.price || 0) * (item.refundAmount || 0) * 100) /
            100;
        });
      } else {
        data.detailList = [];
      }

      if (data.ordersRefund && data.ordersRefund.creator) {
        this.orderList = [
          {
            ...data.ordersRefund,
            originMoney: data.ordersSub.payableMoney || 0,
            refundMoney: data.ordersSub.refundMoney || 0,
            finalMoney:
              Math.round(
                ((data.ordersSub.payableMoney || 0) -
                  (data.ordersSub.refundMoney || 0)) *
                  100
              ) / 100
          }
        ];
      }

      this.info = data;
      // console.log(data);
    },
    cancelRefund() {
      this.$router.go(-1);
    },
    handleRefund(type) {
      const obj = {
        orderSubId: this.orderSubId
      };
      const h = this.$createElement;

      if (type === "all") {
        obj.isAll = 1;
      } else {
        if (this.refundPrice === 0) return this.$message.error("退款金额为0");
        obj.isAll = 0;
        const list = [];
        this.info.detailList.forEach(item => {
          if (item.refundAmount > 0) {
            list.push({
              orderDetailId: item.id,
              amount: item.refundAmount
            });
          }
        });
        obj.refundList = list;
      }
      this.submitInfo = {
        ...obj,
        deliveryPrice: this.info.ordersSub
          ? this.info.ordersSub.deliveryFee || 0
          : 0,
        finalPrice: this.finalPrice,
        refundPrice: this.refundPrice,
        storeName: (this.info.ordersSub && this.info.ordersSub.storeName) || "",
        deliveryName: this.info.deliveryName
      };
      // console.log(this.submitInfo);
      this.showRefundTip = true;
    },
    async confirmSubmit() {
      const obj = { ...this.submitInfo };
      // console.log(obj);
      const res = await this.$postJson("/order/ordersRefund/refund", obj);
      if (res.success !== 1) {
        // this.$message.error("退款操作失败");
        return;
      }

      this.getInfo();
      setTimeout(() => {
        this.$message.success("退款操作成功");
        this.closeSumbitTip();
      }, 1000);
      // this.info.ordersSub.status === 5;
      // if (obj.isAll === 1) {
      //   this.info.detailList.forEach(item => {
      //     item.refundAmount = item.amount;
      //     item.amount = 0;
      //   });
      // }
      // const userInfo = localStorage.getItem('userInfo')
      // this.orderList=[
      //   {

      //   }
      // ]
    },
    closeSumbitTip() {
      this.showRefundTip = false;
      this.submitInfo = {};
    }
  }
};
</script>

<style scoped lang="scss">
.refund-container {
  padding: 30px 20px;
  color: #666;
}
.store-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .store-name {
    margin-left: 20px;
    span {
      font-weight: bold;
    }
  }
}
.total-price-wrap {
  text-align: right;
  margin-top: 30px;
  div {
    margin-top: 10px;
  }
  span {
    font-weight: bold;
  }
}
.refund-order-wrap {
  margin-top: 40px;
  .refund-title {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    .refund-title-text {
      position: absolute;
      background-color: #666;
      color: #fff;
      padding: 10px 20px;
      border-radius: 20px;
    }
  }
}
</style>
