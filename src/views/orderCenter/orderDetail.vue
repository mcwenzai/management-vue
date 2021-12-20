<template>
  <div class="member-admin">
    <!--     <div class="operate-part">
      <span></span>
      <div>
        <el-button @click="$router.back()">返回</el-button>
      </div>
    </div> -->
    <el-container>
      <el-main v-if="orderDetail">
        <div>
          <div class="info-title">订单（{{ orderDetail.id }}）</div>
          <div class="info-item flex">
            <span>订单金额：¥{{ orderDetail.payMoney }}</span>
            <span>下单时间：{{ orderDetail.createTime }}</span>
            <span
              >支付方式：{{
                keymap.ClientKeyMap.PAY_TYPE[orderDetail.payType]
              }}</span
            >
            <span
              >是否拆单：{{
                keymap.ClientKeyMap.IS_SPLIT[orderDetail.isSplit]
              }}</span
            >
          </div>
          <div class="info-title">用户信息</div>
          <div class="info-item flex">
            <span>用户昵称：{{ orderDetail.userName }}</span>
            <span>手机号：{{ orderDetail.userPhone }}</span>
            <span>机构名称：{{ orderDetail.organName }}</span>
            <span>机构地址：{{ orderDetail.organAddress }}</span>
          </div>
          <div class="info-title">收货信息</div>
          <div class="info-item flex">
            <span>收货人：{{ orderDetail.deliveryName }}</span>
            <span>手机号：{{ orderDetail.deliveryPhone }}</span>
            <span style="width: 50%"
              >收货地址：{{ orderDetail.deliveryCityCode }}
              {{ orderDetail.deliveryAddress }}</span
            >
          </div>
          <div class="info-title" v-if="orderDetail.invoiceInfo">发票信息</div>
          <div class="info-item flex" v-if="orderDetail.invoiceInfo">
            <span
              >发票类型：{{
                INVOICE_TYPE[orderDetail.invoiceInfo.type].label
              }}</span
            >
            <span>发票抬头：{{ orderDetail.invoiceInfo.invoiceHeader }}</span>
            <span>税号：{{ orderDetail.invoiceInfo.invoiceNo }}</span>
            <span>电话号码：{{ orderDetail.invoiceInfo.phone }}</span>
            <span>开户银行：{{ orderDetail.invoiceInfo.bankName }}</span>
            <span>营业执照：</span>
            <span>营业执照有效期：</span>
          </div>
          <div
            class="sub-order"
            v-for="(order, index) in orderDetail.ordersSubDTOList"
            :key="index"
          >
            <div class="info-title">
              子订单{{ index + 1 }}（{{ order.id }}）
            </div>
            <div class="sub-flex">
              <div class="sub-flex-info">
                <span
                  >订单状态：{{
                    keymap.ClientKeyMap.ORDER_STATUS[order.status]
                  }}</span
                >
                <span>快递单号：{{ order.expressNo }}</span>
                <span>店铺：{{ storeName }}</span>
                <span
                  >商品类型：{{
                    keymap.ClientKeyMap.GOODS_TYPE[order.goodsType]
                  }}</span
                >
              </div>
              <div
                class="sub-flex-refund"
                v-if="
                  order.status === 2 || order.status === 3 || order.status === 5
                "
              >
                <el-button
                  type="primary"
                  @click="goPage({ info: order })"
                  v-has-permission="'specialCourse:insert'"
                >
                  {{ order.status < 4 ? "退款" : "退款详情" }}
                </el-button>
              </div>
            </div>
            <el-table
              :data="order.ordersDetailDTOList"
              v-if="order.goodsType === GOODS_TYPE[0].value"
            >
              <el-table-column
                prop="goodsId"
                label="商品编号"
                show-overflow-tooltip
              />
              <el-table-column prop="storeName" label="店铺" />
              <el-table-column prop="goodsName" label="商品名称" />
              <el-table-column prop="skuName" label="规格包装信息" />
              <el-table-column prop="price" label="单价" />
              <el-table-column prop="amount" label="数量" />
              <el-table-column prop="" label="实付金额">
                <template slot-scope="scope">
                  <span>{{
                    (scope.row.price * scope.row.amount).toFixed(2)
                  }}</span>
                </template>
              </el-table-column>
            </el-table>
            <el-table
              :data="order.ordersDetailDTOList"
              v-else-if="order.goodsType === GOODS_TYPE[2].value"
            >
              <el-table-column
                prop="goodsId"
                label="商品编号"
                show-overflow-tooltip
              />
              <el-table-column prop="storeName" label="店铺" />
              <el-table-column prop="goodsName" label="商品名称" />
              <el-table-column prop="skuName" label="规格包装信息" />
              <el-table-column prop="place" label="产地" />
              <el-table-column prop="price" label="单价" />
              <el-table-column prop="amount" label="数量" />
              <el-table-column prop="" label="实付金额">
                <template slot-scope="scope">
                  <span>{{
                    (scope.row.price * scope.row.amount).toFixed(2)
                  }}</span>
                </template>
              </el-table-column>
            </el-table>
            <el-table
              :data="order.ordersDetailDTOList"
              v-else-if="order.goodsType === GOODS_TYPE[1].value"
            >
              <el-table-column
                prop="goodsId"
                label="商品编号"
                show-overflow-tooltip
              />
              <el-table-column prop="storeName" label="店铺" />
              <el-table-column prop="goodsName" label="商品名称" />
              <el-table-column prop="skuName" label="规格/当量">
                <template slot-scope="scope">
                  <span
                    >{{ scope.row.skuName }}/{{ scope.row.effectRatio }}</span
                  >
                </template>
              </el-table-column>
              <!-- <el-table-column prop="place" label="产地" /> -->
              <el-table-column prop="price" label="单价" />
              <el-table-column prop="amount" label="数量" />
              <el-table-column prop="" label="实付金额">
                <template slot-scope="scope">
                  <span>{{
                    (scope.row.price * scope.row.amount).toFixed(2)
                  }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="info-title">费用信息</div>
          <div class="table">
            <div class="tr"><span>费用类型</span><span>金额</span></div>
            <div class="tr">
              <span>商品金额</span><span>¥{{ orderDetail.goodsMoney }}</span>
            </div>
            <div class="tr">
              <span>快递金额</span><span>¥{{ orderDetail.deliveryFee }}</span>
            </div>
          </div>
          <div class="total-money flex-end-center">
            应付金额：¥ {{ orderDetail.payableMoney }}
          </div>
          <div class="info-title">付款信息</div>
          <div class="info-item flex">
            <span
              >支付方式：{{
                keymap.ClientKeyMap.PAY_TYPE[orderDetail.payType]
              }}</span
            >
            <span>支付订单号：{{ orderDetail.id }}</span>
            <span>支付创建时间：{{ orderDetail.createTime }}</span>
            <span>支付时间：{{ orderDetail.payTime }}</span>
            <span
              >支付状态：{{
                keymap.ClientKeyMap.ORDER_STATUS[orderDetail.status]
              }}</span
            >
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { getOrderById } from "@/api/orderCenter";
import keymap from "@/utils/keymap";
import { GOODS_TYPE, ORDER_STATUS, INVOICE_TYPE } from "@/utils/constant";
export default {
  name: "Department",
  data() {
    return {
      GOODS_TYPE,
      ORDER_STATUS,
      INVOICE_TYPE,
      keymap,
      orderId: "",
      orderDetail: null,
      storeName: ""
    };
  },
  created() {
    this.orderId = this.$route.query.orderId;
    this.getOrderById();
  },
  methods: {
    getOrderById() {
      getOrderById(this.orderId).then(res => {
        if (res.success === 1) {
          if (res.data.invoiceInfo)
            res.data.invoiceInfo = JSON.parse(res.data.invoiceInfo);
          this.orderDetail = res.data;
          // console.log(res.data);
        }
      });
    },
    goPage({ info }) {
      this.$router.push({
        path: "/orderCenter/refund",
        query: {
          info: JSON.stringify(info)
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.member-admin {
  .operate-part {
    display: flex;
    justify-content: space-between;
    padding: 20px 30px 0;
  }

  .info-title {
    padding: 30px 0;
  }

  .info-item {
    span {
      margin-bottom: 20px;
      display: inline-block;
      width: 25%;
    }
  }

  .flex {
    display: flex;
    flex-wrap: wrap;
    padding: 0 50px;
  }

  .table {
    border: 1px solid #ddd;
    border-right: 0;
    border-bottom: 0;

    .tr {
      display: flex;
      border-bottom: 1px solid #ddd;

      span {
        border-right: 1px solid #ddd;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px 0;
        flex: 1;
      }
    }
  }

  .total-money {
    display: flex;
    justify-content: flex-end;
    padding: 20px 30px 40px;
  }

  .sub-flex {
    display: flex;
    justify-content: space-between;

    &-info {
      span {
        display: inline-block;
        margin: 0 30px 30px 0;
      }
    }

    &-refund {
    }
  }
}
</style>
