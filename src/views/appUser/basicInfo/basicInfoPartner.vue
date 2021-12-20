<template>
  <div class="member-admin">
    <el-container>
      <el-main>
        <div class="operate-part">
          <div>
            <span>{{partnerName}}</span>
            <span>的合伙人</span>
          </div>
          <div>
            <el-button type="primary" @click="goBack()">返回</el-button>
          </div>
        </div>
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column prop="deptName" label="事业部"></el-table-column>
          <el-table-column prop="employeeName" label="合伙人"></el-table-column>
          <el-table-column prop="employeePhone" label="合伙人手机号"></el-table-column>
          <el-table-column prop="employeeArea" label="合伙人区域"></el-table-column>
          <el-table-column prop="createTime" label="绑定时间"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="removeBind(scope.row)"
                v-has-permission="'appUser:removeBind'">解绑</el-button>
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
  } from '@/utils/index';
  import {
    SEARCH_DEBOUNCE_TIME,
    PAGE_SIZE_ARR
  } from '@/utils/constant';
  import {
    getEmployeeList,
    getRemoveBind
  } from '@/api/user';
  import {
    regionData
  } from 'element-china-area-data';
  import keymap from '@/utils/keymap';
  export default {
    name: 'salesmanAdmin',
    data() {

      return {
        PAGE_SIZE_ARR,
        keymap,
        regionData,
        queryParam: {
          deptId: '',
          areaName: '',
          oaEmployeeName: '',
        },
        searchDebounce: null,
        partnerName: '',

        pagination: {
          pageNum: 1,
          pageSize: 10
        },
        totalPageNum: 0,
        tableData: [],
        departmentList: [],
        userList: [],
        isPartnerValue: '',
        isPartnerList: [],
        rules: {
          deptId: [{
            required: true,
            message: '请选择事业部',
            trigger: 'change'
          }],
          areaId: [{
            required: true,
            message: '请选择区县',
            trigger: 'change'
          }, ],
          oaEmployeeIdList: [{
            required: true,
            message: '请选择合伙人',
            trigger: 'change'
          }, ],
        }
      }
    },
    created() {
      var user = this.$route.query.id
      this.userId = user.id
      this.partnerName = user.name
      this.getEmployee()
      this.searchDebounce = debounce(this.handleConditionQuery, SEARCH_DEBOUNCE_TIME, false)
    },
    methods: {
      getEmployee() {
        var userId = this.userId
        getEmployeeList(
          userId
        ).then((res) => {
          this.tableData = res.data
        })
      },

      removeBind(e) {
        console.log(e)
        var id = e.id
        getRemoveBind(id).then((res) => {
          if (res.success == 1) {
            this.$message.success(res.msg);
            this.dialogVisible = false;
            this.getEmployee();
          } else {
            this.$message.error(res.msg);
          }
        })
      },

      // 返回上一页
      goBack() {
        this.$router.go(-1);
      },

      handleCurrentChange(newPage) {
        this.pagination.pageNum = newPage
        this.getEmployee()
      },
      handleSizeChange(newSize) {
        this.pagination.pageSize = newSize
        this.getEmployee()
      },
      handleConditionQuery() {
        this.initPageParam()
        this.getEmployee()
      },
      // 初始页数
      initPageParam() {
        this.pagination = {
          pageNum: 1,
          pageSize: 10
        }
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

      span {
        color: #333333;
      }
    }
  }
</style>
