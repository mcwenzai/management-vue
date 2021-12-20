<template>
  <div class="member-admin">
    <el-container>
      <el-main>
        <div class="operate-part">
          <div>
            <el-input v-model="queryParam.employeeName" placeholder="搜索姓名" @input="searchDebounce" />
            <el-input v-model="queryParam.employeePhone" placeholder="搜索手机号" @input="searchDebounce" />
            <!-- <el-input v-model="queryParam.employeeName" placeholder="搜索姓名" @input="searchDebounce" /> -->
            <!-- <el-input v-model="queryParam.employeePhone" placeholder="搜索手机号" @input="searchDebounce" />
            <el-input v-model="queryParam.deptName" placeholder="搜索事业部名称" @input="searchDebounce" /> -->
            <el-select v-model="queryParam.deptId" placeholder="搜索事业部" @change="selectDepart" filterable>
              <el-option v-for="(item,index) in departmentList" :key="index" :label="item.deptName" :value="item.id">
              </el-option>
            </el-select>
            <el-cascader :options="treeList" @change="treeChange" :disabled="isDisabled"
              :props="{ checkStrictly: true }" clearable placeholder="筛选区域">
            </el-cascader>

            <el-select v-model="queryParam.roleIdList" multiple filterable placeholder="筛选角色" @change="searchDebounce">
              <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id">
              </el-option>
            </el-select>

            <el-select v-model="queryParam.perType" placeholder="请选择业绩类型" @change="selectPerType">
              <el-option v-for="item in perTypeList" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
            <el-date-picker v-model="value2" type="daterange" align="right" unlink-panels range-separator="至"
              start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions" @change="datePicker">
            </el-date-picker>

          </div>
        </div>
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column prop="deptName" label="事业部" />
          <el-table-column prop="areaName" label="区域" />
          <el-table-column prop="employeeName" label="姓名" />
          <el-table-column prop="employeePhone" label="手机号" />
          <el-table-column prop="sellMoney" label="销售业绩" />
          <el-table-column prop="clearingMoney" label="结算业绩" />
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="see(scope.row)"
                v-has-permission="'oaEmployeePerformanceLog:list'">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
        <br>
        <el-pagination :current-page="pagination.pageNum" :page-sizes="PAGE_SIZE_ARR" :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper" :total="totalPageNum" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </el-main>
    </el-container>
    <el-dialog title="查看" :visible.sync="dialogVisible">
      <div class="">
        <el-table :data="detail">
          <el-table-column property="areaName" label="区域名称"></el-table-column>
          <el-table-column property="sellMoney" label="销售业绩"></el-table-column>
          <el-table-column property="clearingMoney" label="结算业绩"></el-table-column>
        </el-table>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {
    debounce
  } from '@/utils/index'
  import {
    SEARCH_DEBOUNCE_TIME,
    PAGE_SIZE_ARR
  } from '@/utils/constant'
  import {
    controllerformanceLogList,
    postControllerPerformance,
    postOaRoleList,
    oaDepartmentList,
    getPubOaTree,
    getOARoles
  } from '@/api/oaAdmin'
  import keymap from '@/utils/keymap'
  export default {
    name: 'Department',
    data() {
      return {
        PAGE_SIZE_ARR,
        keymap,
        queryParam: {
          employeeName: '',
          employeePhone: '',
          deptName: '',
          roleIdList: [],
          perType: ''
        },
        rolesList: [],
        searchDebounce: null,
        pagination: {
          pageNum: 1,
          pageSize: 10
        },
        totalPageNum: 0,
        tableData: [],
        userList: [],
        dialogVisible: false,
        detail: '',
        treeList: [],
        perTypeList: [{
          value: '1',
          label: '销售业绩'
        }, {
          value: '0',
          label: '结算业绩'
        }],
        pickerOptions: {
          shortcuts: [{
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }]
        },
        value2: '',
        departmentList: [],
        isDisabled: true
      }
    },
    created() {
      this.getTableData()
      this.loadOARoles()
      this.getDepartmentList()
      this.searchDebounce = debounce(this.handleConditionQuery, SEARCH_DEBOUNCE_TIME, false)
    },
    methods: {
      see(row) {
        console.log(row)
        console.log(this.queryParam.perType)
        if (this.queryParam.perType == '') {
           this.$message({
              message: '请先选择业绩类型',
              type: 'warning'
            });
        } else{
          this.$router.push({
            path: 'detail',
            query: {
                id: row.id,
                deptName: row.deptName,
                areaName: row.areaName,
                employeeName: row.employeeName,
                roleName: row.roleName,
                perType: this.queryParam.perType,
                sellMoney: row.sellMoney,
                deptId: row.deptId,
                areaId: row.areaId,
                employeeId: row.employeeId
            }
          });
        }

        // postPartnerPerformance(row.deptId, row.employeeId).then((res) => {
        //   this.detail = res.data;
        //   this.dialogVisible = true;
        // });
      },
      // oaRoleList() {
      //   postOaRoleList().then((res) => {
      //     console.log(res)
      //   })
      // },

      // 获取下拉数据
      getDepartmentList() {
        oaDepartmentList({
          pageNum: 1,
          pageSize: 999,
        }).then((res) => {
          this.departmentList = res.data.list;
        });
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

      async loadOARoles() {
        const res = await getOARoles()
        this.rolesList = res.data;
      },

      selectPerType(value) {
        console.log(value)
        this.queryParam.perType = value
        this.getTableData()
      },

      datePicker(value) {
        console.log(value)

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

      treeChange(value) {
        this.queryParam.province = value[0]
        this.queryParam.city = value[1]
        this.queryParam.county = value[2]
        this.getTableData()
      },
      selectRegisterTime(value) {
        console.log(value)
      },
      initPageParam() {
        this.pagination = {
          pageNum: 1,
          pageSize: 10
        }
      },
      async getTableData() {
        Object.assign(this.queryParam, this.pagination)
        const res = await controllerformanceLogList(this.queryParam)
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
