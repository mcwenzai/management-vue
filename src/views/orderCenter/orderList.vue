<template>
  <div class="member-admin">
    <el-container>
      <el-main>
        <div class="operate-part">
          <div>
            <el-input v-model="queryParam.keyWord" placeholder="搜索订单编号/收件人姓名/手机号" @input="searchDebounce" />
            <el-date-picker v-model="time" type="daterange" range-separator="至" start-placeholder="开始日期"
              end-placeholder="结束日期" value-format="yyyy-MM-dd HH:mm:ss" @change="handleChangeTime">
            </el-date-picker>
            <el-select v-model="queryParam.statusList" multiple filterable @change="searchDebounce">
              <el-option v-for="item in ORDER_STATUS" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </div>
        </div>
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column prop="id" label="订单编号" />
          <el-table-column prop="createTime" label="下单时间" />
          <el-table-column prop="actualMoney" label="实付金额" />
          <el-table-column prop="deliveryName" label="收件人姓名" />
          <el-table-column prop="deliveryPhone" label="收件人电话" />
          <el-table-column prop="isSplit" label="是否拆单">
            <template slot-scope="scope">
              {{ scope.row.isSplit === 1 ? '是' : '否'}}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="订单状态" :formatter="statusFormatter" />
          <el-table-column prop="payType" label="支付方式">
            <template slot-scope="scope">
              {{ scope.row.payType === 1 ? '支付宝' : scope.row.payType === 0 ? '微信' : ''}}
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="see(scope.row)" v-has-permission="'orders:list'">查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <br>
        <el-pagination :current-page="pagination.pageNum" :page-sizes="PAGE_SIZE_ARR" :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper" :total="totalPageNum" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </el-main>
    </el-container>
  </div>
</template>

<script>
  import {
    debounce
  } from '@/utils/index'
  import {
    SEARCH_DEBOUNCE_TIME,
    PAGE_SIZE_ARR,
    ORDER_STATUS
  } from '@/utils/constant'
  import {
    getOrders
  } from '@/api/orderCenter'
  import keymap from '@/utils/keymap'
  export default {
    name: 'Department',
    data() {
      return {
        PAGE_SIZE_ARR,
        ORDER_STATUS,
        keymap,
        time: [],
        queryParam: {
          keyWord: '',
          beginDate: '',
          endDate: '',
          statusList: []
        },
        searchDebounce: null,
        pagination: {
          pageNum: 1,
          pageSize: 10
        },
        totalPageNum: 0,
        tableData: [],
        userList: [],
        dialogVisible: false,
        deptName: '',
        detail: '',
        statusList: [],
      }
    },
    created() {
      this.queryParam.statusList = [this.ORDER_STATUS[2].value]
      this.getTableData()
      this.searchDebounce = debounce(this.handleConditionQuery, SEARCH_DEBOUNCE_TIME, false)
    },
    methods: {
      statusFormatter(row) {
        return this.ORDER_STATUS.find((item) => item.value === row.status).label;
      },
      see(row) {
        this.$router.push({
          path: '/orderCenter/orderDetail',
          query: {
            orderId: row.id
          },
        });
      },
      handleChangeTime(e) {
        if (e) {
          [this.queryParam.beginDate, this.queryParam.endDate] = e;
        } else {
          this.queryParam.beginDate = '';
          this.queryParam.endDate = '';
        }
        this.searchDebounce();
      },
      handleCurrentChange(newPage) {
        this.pagination.pageNum = newPage
        this.getTableData()
      },
      handleSizeChange(newSize) {
        this.pagination.pageSize = newSize
        this.getTableData()
      },
      handleConditionQuery() {
        this.initPageParam()
        this.getTableData()
      },
      initPageParam() {
        this.pagination = {
          pageNum: 1,
          pageSize: 10
        }
      },
      async getTableData() {
        Object.assign(this.queryParam, this.pagination)
        const res = await getOrders(this.queryParam)
        this.tableData = res.data.list
        this.totalPageNum = res.data.total
      },
    }
  }
</script>
<style lang='scss' scoped>
  .member-admin {
    .operate-part {
      display: flex;
      justify-content: space-between;
      padding: 20px 0;

      .el-input {
        width: 200px;
      }
    }
  }
</style>
