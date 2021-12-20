<template>
  <div>
    <el-container>
      <el-main>
        <el-form size="mini" :inline="true" class="demo-form-inline">
          <el-form-item>
            <el-input v-model="queryParam.roleName" placeholder="请输入角色名"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="query()">查询</el-button>
            <el-button type="info" @click="reload()">重置</el-button>
            <el-button v-has-permission="'sysRole:insert'" type="primary" @click="addOrUpdate(null)">添加</el-button>
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
            prop="roleName"
            label="角色名"
          >
          </el-table-column>
          <el-table-column
            prop="createTime"
            label="创建时间"
            width="180">
          </el-table-column>
          <el-table-column
            label="操作"
            width="180">
            <template slot-scope="scope">
              <!--超级管理员角色不能更改或删除-->
              <div v-if="scope.row.id!==1">
                <el-button type="primary" size="mini" @click="addOrUpdate(scope.row)" v-has-permission="'sysRole:update'">编辑</el-button>
                <el-button type="danger" size="mini" @click="deleteRecord(scope.row.id)" v-has-permission="'sysRole:delete'">删除</el-button>
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
    <SysRoleModal ref="entityModal" @reload="getList"></SysRoleModal>
  </div>
</template>

<script>
  import SysRoleModal from './SysRoleModal'
  const listUrl = '/system/sysRole/list';
  const deleteUrl = '/system/sysRole/delete';
  export default {
    name: "SysRole",
    components: {SysRoleModal},
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
              this.$get(deleteUrl+'/' + primaryKey).then(res => {
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
        that.$postJson(listUrl, that.queryParam).then(res => {
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
