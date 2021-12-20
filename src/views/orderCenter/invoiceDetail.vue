<template>
  <div class="member-admin">
    <div class="operate-part">
      <span></span>
      <div>
        <el-button @click="$router.back()">返回</el-button>
      </div>
    </div>
    <el-container>
      <el-main v-if="orderDetail">
        <div>
          <div class="info-title">订单（{{orderDetail.id}}）</div>
          <div class="info-item flex">
            <span>订单金额：¥{{orderDetail.goodsMoney}}</span>
            <span>下单时间：{{orderDetail.createTime}}</span>
            <span>支付方式：{{keymap.ClientKeyMap.PAY_TYPE[orderDetail.payType]}}</span>
            <span>是否拆单：{{keymap.ClientKeyMap.IS_SPLIT[orderDetail.isSplit]}}</span>
          </div>
          <div class="info-title">收货信息</div>
          <div class="info-item flex">
            <span>收货人：{{orderDetail.deliveryName}}</span>
            <span>手机号：{{orderDetail.deliveryPhone}}</span>
            <span style="width: 50%">收货地址：{{orderDetail.deliveryCityCode}} {{orderDetail.deliveryAddress}}</span>
          </div>
          <div class="info-title">供应商信息</div>
          <div class="info-item flex">
            <span>供应商：{{orderDetail.storeName}}</span>
          </div>
          <div class="sub-order" v-for="(order, index) in orderDetail.ordersDeliveryExpressList" :key="index">
            <div class="info-title">物流信息</div>
            <div class="sub-order-info">
              <span>物流公司：{{order.expressCompany}}</span>
              <span>单号：{{order.expressNo}}</span>
              <span>状态：{{keymap.ClientKeyMap.EXPRESS_STATUS[order.status]}}</span>
            </div>
            <el-table :data="order.expressTrace">
              <el-table-column prop="context" label="内容" show-overflow-tooltip />
              <el-table-column prop="ftime" label="时间" width="200" />
            </el-table>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
  import {
    getOrdersDeliveryById
  } from '@/api/orderCenter'
  import keymap from '@/utils/keymap'
  import {
    INVOICE_STATUS,
    INVOICE_TYPE
  } from '@/utils/constant'
  export default {
    name: 'Department',
    data() {
      return {
        INVOICE_STATUS,
        INVOICE_TYPE,
        keymap,
        id: '',
        orderDetail: null,
      }
    },
    created() {
      this.id = this.$route.query.id;
      this.getOrdersDeliveryById();
    },
    methods: {
      getOrdersDeliveryById() {
        getOrdersDeliveryById(this.id).then((res) => {
          if (res.success === 1) {
            res.data.ordersDeliveryExpressList.forEach((item) => {
              if (item.expressTrace) {
                item.expressTrace = JSON.parse(item.expressTrace);
              } else {
                item.expressTrace = [];
              }
            });
            this.orderDetail = res.data;
          }
        });
      },
    }
  }
</script>
<style lang='scss' scoped>
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
          ;
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

    .sub-order-info {
      span {
        display: inline-block;
        margin: 0 30px 30px 0;
      }
    }
  }
</style>
