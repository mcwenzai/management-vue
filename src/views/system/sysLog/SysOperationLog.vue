<template>
  <div>
    <el-container>
      <el-main>
        <el-form size="mini" :inline="true" class="demo-form-inline">
          <el-form-item>
            <el-input v-model="queryParam.operModul" placeholder="请输入功能模块" style="width: 150px"></el-input>
            <el-input v-model="queryParam.operType" placeholder="请输入操作类型" style="width: 150px"></el-input>
            <el-input v-model="queryParam.operDesc" placeholder="请输入操作描述" style="width: 150px"></el-input>
            <el-input v-model="queryParam.operUrl" placeholder="请输入请求URL" style="width: 150px"></el-input>
            <el-input v-model="queryParam.operUserName" placeholder="请输入操作员名称" style="width: 150px"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="query()">查询</el-button>
            <el-button type="info" @click="reload()">重置</el-button>
          </el-form-item>
        </el-form>
        <el-table
          v-loading="loading"
          :data="tableData"
          border
          style="width: 100%">
          <el-table-column
            type="index"
            width="50">
          </el-table-column>
          <el-table-column
            prop="operModul"
            label="功能模块"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="operType"
            label="操作类型"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="operDesc"
            label="操作描述"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="operMethod"
            label="操作方法"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="operUrl"
            label="请求URL"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="operRequParam"
            label="请求参数"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="operRespParam"
            label="返回参数"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="operUserName"
            label="操作员名称"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="operIp"
            label="请求IP"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="createTime"
            label="创建时间"
          >
          </el-table-column>
        </el-table>
        <br>
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.pageNum"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </el-main>
    </el-container>
  </div>
</template>

<script>
  export default {
    name: "SysOperationLog",
    created() {
      this.getList()
    },
    data() {
      return {
        loading: false,
        queryParam: {},
        pagination: {
          pageNum: 1,
          pageSize: 10
        },
        total: 0,
        tableData: []
      }
    },
    methods: {
      reload() {
        this.initPageParam();
        this.queryParam = {};
        this.getList()
      },
      initPageParam() {
        this.pagination = {
          pageNum: 1,
          pageSize: 10
        }
      },
      query() {
        this.initPageParam();
        this.getList()
      },
      getList() {
        var that = this;
        that.loading = true;
        Object.assign(that.queryParam, that.pagination);
        that.$postJson('/system/sysOperationLog/list', that.queryParam).then(res => {
          that.loading = false;
          that.tableData = res.data.list;
          that.total = res.data.total
        })
      },
      handleSizeChange(val) {
        this.pagination.pageNum = 1;
        this.pagination.pageSize = val;
        this.getList()
      },
      handleCurrentChange(val) {
        this.pagination.pageNum = val;
        this.getList()
      }
    }
  }
</script>

<style scoped>

</style>
