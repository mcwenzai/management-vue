<template>
  <div class="member-admin">
    <el-container>
      <el-main>
        <div class="operate-part">
          <div>
            <!-- <el-input v-model="queryParam.orderNumber" placeholder="搜索订单号" @input="searchDebounce" /> -->
            <el-input v-model="queryParam.storeName" placeholder="搜索店铺名称" @input="searchDebounce"
              style="width: 140px;" />
            <!-- <el-input v-model="queryParam.organName" placeholder="搜索机构名称" @input="searchDebounce" /> -->
            <el-input v-model="queryParam.deliveryName" placeholder="搜索收货人" @input="searchDebounce"
              style="width: 140px;" />
            <el-select v-model="queryParam.goodsTypeList" multiple filterable @change="searchDebounce"
              placeholder="商品类型" style="width: 140px;">
              <el-option v-for="item in GOODS_TYPE" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
            <el-select v-model="queryParam.statusList" multiple filterable @change="searchDebounce" placeholder="筛选订单状态"
              style="width: 140px;">
              <el-option v-for="item in ORDER_STATUS" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
            <el-select clearable v-model="queryParam.deptId" placeholder="搜索事业部" @change="selectDepart"
              style="width: 140px;">
              <el-option v-for="(item,index) in departmentList" :key="index" :label="item.deptName" :value="item.id">
              </el-option>
            </el-select>
            <el-cascader :options="treeList" @change="treeChange" :disabled="isDisabled"
              :props="{ checkStrictly: true }" clearable placeholder="筛选区域">
            </el-cascader>
            <!--            <el-cascader :options="treeList" @change="treeChange" :props="{ checkStrictly: true }" clearable placeholder="筛选位置" style="width: 140px;">
            </el-cascader> -->
            <el-date-picker v-model="time" type="daterange" range-separator="至" start-placeholder="开始日期"
              end-placeholder="结束日期" value-format="yyyy-MM-dd" @change="handleChangeTime">
            </el-date-picker>
          </div>
          <el-button type="primary" @click="exportOrder()" v-has-permission="'orders:export'">批量导出</el-button>
        </div>
        <el-table :data="tableData" border style="width: 100%" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" />
          <el-table-column prop="orderNumber" label="子订单编号" />
          <el-table-column prop="storeName" label="店铺名称" />
          <el-table-column prop="organName" label="机构名称" />
          <el-table-column prop="areaName" label="区域" />
          <el-table-column prop="employeeName" label="合伙人" />
          <el-table-column prop="goodsType" label="商品类型" :formatter="goodsTypeFormatter" />
          <el-table-column prop="deliveryName" label="收货人" />
          <el-table-column prop="deliveryPhone" label="收货人手机号" />
          <el-table-column prop="status" label="订单状态" :formatter="statusFormatter" />
          <el-table-column prop="moneySum" label="订单金额"></el-table-column>
          <el-table-column prop="goodsMoney" label="货款" />
          <el-table-column prop="deliveryFee" label="运费" />
          <el-table-column prop="payTime" label="支付时间" />
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="exportOrder(scope.row)" v-has-permission="'orders:export'">
                导出</el-button>
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
    ORDER_STATUS,
    GOODS_TYPE
  } from '@/utils/constant'
  import {
    getOrdersList,
    exportOrdersList
  } from '@/api/orderCenter';
  import {
    oaDepartmentList,
    getPubOaTree
  } from '@/api/oaAdmin';
  import keymap from '@/utils/keymap'
  export default {
    name: 'Department',
    data() {
      return {
        PAGE_SIZE_ARR,
        ORDER_STATUS,
        GOODS_TYPE,
        keymap,
        time: [],
        queryParam: {
          orderNumber: '',
          storeName: '',
          organName: '',
          deliveryName: '',
          goodsTypeList: [],
          statusList: [],
          beginDate: '',
          endDate: '',
          regionId: '',
          provinceId: '',
          cityId: '',
          countyId: '',
        },
        treeList: [],
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
        orderIdList: [],
        departmentList: [],
        isDisabled: true
      }
    },
    created() {
      this.queryParam.statusList = [this.ORDER_STATUS[2].value]
      this.getTableData()
      this.getDepartmentList();
      this.searchDebounce = debounce(this.handleConditionQuery, SEARCH_DEBOUNCE_TIME, false)
    },
    methods: {
      // 获取下拉数据
      getDepartmentList() {
        oaDepartmentList({
          pageNum: 1,
          pageSize: 999,
        }).then((res) => {
          this.departmentList = res.data.list;
        });
      },
      statusFormatter(row) {
        return this.ORDER_STATUS.find((item) => item.value === row.status).label;
      },
      goodsTypeFormatter(row) {
        return this.GOODS_TYPE.find((item) => item.value === row.goodsType).label;
      },

      selectDepart(e) {
        this.isDisabled = false
        this.getOaAreaTree(e)
      },

      getOaAreaTree(e) {
        console.log(e)
        const deptId = e
        if (deptId == 'undefined') {
          this.$message.error('请先选择事业部');
        } else {
          getPubOaTree(deptId).then((res) => {
            console.log(res)
            var treeList = res.data
            var option = this.eachReplaceKey(treeList)

            this.treeList = option
          })
        }
      },

      eachReplaceKey(city) {
        let item = [];
        city.map(list => {
          let newData = {};
          newData.label = list.areaName;
          newData.value = list.id;
          if (list.children.length) {
            newData.children = this.eachReplaceKey(list.children)
          }
          item.push(newData);
        })
        return item;
      },
      
      treeChange(value) {
        console.log(value)
        this.queryParam.regionId = value[0]
        this.queryParam.provinceId = value[1]
        this.queryParam.cityId = value[2]
        this.queryParam.countyId = value[3]
        this.getTableData()
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
      selectDepart(e) {
        this.isDisabled = false
        this.getOaAreaTree(e)
      },
      initPageParam() {
        this.pagination = {
          pageNum: 1,
          pageSize: 10
        }
      },
      async getTableData() {
        Object.assign(this.queryParam, this.pagination)
        const res = await getOrdersList(this.queryParam)
        this.tableData = res.data.list
        this.totalPageNum = res.data.total
      },
      handleSelectionChange(val) {
        const list = [];
        val.forEach((item) => {
          list.push({
            orderSubId: item.orderSubId,
            goodsType: item.goodsType,
            fileName: item.fileName,
          });
        })
        this.orderIdList = list;
      },
      exportOrder(row) {
        if (row) {
          const obj = {
            orderSubId: row.orderSubId,
            goodsType: row.goodsType,
          }
          this.exportOrdersList(obj, row.fileName);
        } else if (this.orderIdList.length === 0) {
          this.$message.warning('请选择导出订单');
        } else {
          this.orderIdList.forEach((item) => {
            this.exportOrdersList(item, item.fileName);
          });
        }
      },
      exportOrdersList(obj, fileName = '') {
        exportOrdersList(obj).then((res) => {
          let blob = new Blob([res], {
            type: 'application/xlsx'
          })
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(blob);
          link.download = fileName;
          link.click();
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
      align-items: center;
      padding: 20px 0;

      .el-input {
        width: 200px;
      }
    }
  }
</style>
