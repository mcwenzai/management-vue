<template>
  <div>
    <el-container>
      <el-main>
        <el-form size="mini" :inline="true" class="demo-form-inline">
          <el-form-item>
            <el-input v-model="queryParam.module" placeholder="请输入业务模块"></el-input>
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
            prop="module"
            label="业务模块"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="requestUrl"
            label="请求URL"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="requestParam"
            label="请求参数"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="ip"
            label="IP地址"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="method"
            label="请求方法"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="content"
            label="日志内容"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="createTime"
            label="创建时间"
          >
          </el-table-column>
          <el-table-column
            label="操作"
            width="180">
            <template slot-scope="scope">
              <div>
                <el-button size="mini" @click="addOrUpdate(scope.row)" v-has-permission="'sysLog:list'">详情</el-button>
              </div>
            </template>
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
    <SysLogModal ref="entityModal" @reload="getList"></SysLogModal>
  </div>
</template>

<script>
  import SysLogModal from './SysLogModal'

  export default {
    name: "SysLog",
    components: {SysLogModal},
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
      addOrUpdate(row) {
        var entity = row ? row : null;
        this.$refs.entityModal.openModal(entity);
      },
      deleteRecord(primaryKey) {
        this.$confirm('确定删除吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true;
              this.$get('/system/sysLog/delete/' + primaryKey).then(res => {
                instance.confirmButtonLoading = false;
                if (res.success === 1) {
                  this.$message({
                    type: 'success',
                    message: res.msg
                  });
                  done();
                  this.getList();
                }
              });
            } else {
              this.$message({
                type: 'info',
                message: '已取消删除'
              });
              done();
            }
          }
        }).catch(()=>{})
      },
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
        that.$postJson('/system/sysLog/list', that.queryParam).then(res => {
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
