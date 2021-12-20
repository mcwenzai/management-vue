<template>
  <div class="member-admin">
    <el-container>
      <el-main>
        <div class="operate-part">
          <div>
            <el-input v-model="queryParam.keyWord" placeholder="搜索财务编号/交易号/付款人/收款人" @input="searchDebounce"
              style="width: 300px" />
            <el-select v-model="queryParam.typeList" multiple @change="searchDebounce" placeholder="筛选类型" filterable>
              <el-option v-for="item in FINANCE_TYPE" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
            <el-select v-model="queryParam.statusList" multiple @change="searchDebounce" placeholder="筛选支付状态"
              filterable>
              <el-option v-for="item in FINANCE_STATUS" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
            <el-date-picker v-model="time" type="daterange" range-separator="至" start-placeholder="开始日期"
              end-placeholder="结束日期" value-format="yyyy-MM-dd" @change="handleChangeTime">
            </el-date-picker>
          </div>
        </div>
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column prop="orderId" label="订单编号" />
          <el-table-column prop="tradeNo" label="财务编号" />
          <el-table-column prop="transactionId" label="交易编号" />
          <el-table-column prop="payerName" label="付款人" />
          <el-table-column prop="receiverName" label="收款人" />
          <el-table-column prop="type" label="类型" :formatter="typeFormatter" />
          <el-table-column prop="money" label="金额" />
          <el-table-column prop="payMethod" label="支付方式">
            <template slot-scope="scope">
              {{ scope.row.payMethod === 1 ? '支付宝' : scope.row.payMethod === 0 ? '微信' : ''}}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="支付状态" :formatter="statusFormatter" />
          <el-table-column prop="createTime" label="创建时间" />
          <el-table-column prop="payTime" label="支付时间" />
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
    FINANCE_STATUS,
    FINANCE_TYPE
  } from '@/utils/constant'
  import {
    financeList
  } from '@/api/orderCenter'
  import keymap from '@/utils/keymap'
  export default {
    name: 'Department',
    data() {
      return {
        PAGE_SIZE_ARR,
        FINANCE_STATUS,
        FINANCE_TYPE,
        keymap,
        time: [],
        queryParam: {
          keyWord: '',
          beginDate: '',
          endDate: '',
          typeList: [],
          statusList: [],
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
      this.getTableData()
      this.searchDebounce = debounce(this.handleConditionQuery, SEARCH_DEBOUNCE_TIME, false)
    },
    methods: {
      statusFormatter(row) {
        if (this.FINANCE_STATUS.find((item) => item.value === row.status)) {
          return this.FINANCE_STATUS.find((item) => item.value === row.status).label;
        }
        return '';
      },
      typeFormatter(row) {
        if (this.FINANCE_TYPE.find((item) => item.value === row.type)) {
          return this.FINANCE_TYPE.find((item) => item.value === row.type).label;
        }
        return '';
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
          [this.form.beginDate, this.form.endDate] = e;
        } else {
          this.form.beginDate = '';
          this.form.endDate = '';
        }
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
        const res = await financeList(this.queryParam)
        this.tableData = res.data.list
        this.totalPageNum = res.data.total
      }
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
