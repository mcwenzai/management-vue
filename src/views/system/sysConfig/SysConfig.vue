<template>
  <div>
    <el-container>
      <el-main>
        <el-form size="mini" :inline="true" class="demo-form-inline">
          <el-form-item>
            <el-input v-model="queryParam.tag" placeholder="输入配置标识"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="query()">查询</el-button>
            <el-button type="info" @click="reload()">重置</el-button>
            <el-button type="primary" @click="addOrUpdate(null)" v-has-permission="'sysConfig:insert'">添加</el-button>
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
            prop="tag"
            label="配置标识"
          >
          </el-table-column>
          <el-table-column
            prop="name"
            label="配置名称"
          >
          </el-table-column>
          <el-table-column
            prop="param"
            label="配置参数"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="createTime"
            label="创建时间"
          >
          </el-table-column>
          <el-table-column
            prop="updater"
            label="修改人"
          >
          </el-table-column>
          <el-table-column
            label="操作"
            width="280">
            <template slot-scope="scope">
              <div>
                <el-button v-if="scope.row.state===1" type="warning" size="mini"
                  @click="changeState(scope.row.id,0)" v-has-permission="'sysConfig:update'">
                  停用
                </el-button>
                <el-button v-if="scope.row.state===0" type="success" size="mini"
                  @click="changeState(scope.row.id,1)" v-has-permission="'sysConfig:update'">
                  启用
                </el-button>
                <el-button v-if="scope.row.state===0" type="primary" size="mini"
                  @click="addOrUpdate(scope.row)" v-has-permission="'sysConfig:update'">编辑
                </el-button>
                <el-button v-if="scope.row.state===0" type="danger" size="mini"
                  @click="deleteRecord(scope.row.id)" v-has-permission="'sysConfig:delete'">删除
                </el-button>
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
    <SysConfigModal ref="entityModal" @reload="getList"></SysConfigModal>
  </div>
</template>

<script>
  import SysConfigModal from './SysConfigModal'

  export default {
    name: "SysConfig",
    components: {SysConfigModal},
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
              this.$get('/system/sysConfig/delete/' + primaryKey).then(res => {
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
        that.$postJson('/system/sysConfig/list', that.queryParam).then(res => {
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
      },
      changeState(id, state) {
        var entity = {
          id:id,
          state:state
        }
        var text = "启用配置"
        if(state===0){
          text = "停用配置"
        }
        this.$confirm('确定'+text+'吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true;
              this.$postJson('/system/sysConfig/update',entity).then(res => {
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
              done();
            }
          }
        }).catch(()=>{})
      }
    }
  }
</script>

<style scoped>

</style>
