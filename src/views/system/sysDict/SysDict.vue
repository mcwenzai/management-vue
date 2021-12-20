<template>
  <div>
    <el-container>
      <el-main>
        <el-form size="mini" :inline="true" class="demo-form-inline">
          <el-form-item>
            <el-input v-model="queryParam.type" placeholder="请输入字典类型"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="query()">查询</el-button>
            <el-button type="info" @click="reload()">重置</el-button>
            <el-button type="primary" @click="addOrUpdate(null,null)" v-has-permission="'sysDict:insert'">添加</el-button>
          </el-form-item>
        </el-form>
        <el-table
          v-loading="loading"
          :data="tableData"
          border
          style="width: 100%">
          <el-table-column
            type="index"
            width="150">
            <template slot-scope="scope">
              <div>
                <el-button type="success" size="mini" @click="addOrUpdate(null,{type:scope.row.type,desc:scope.row.desc})" v-has-permission="'sysDict:insert'">添加同分类</el-button>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="type"
            label="字典类型"
          >
          </el-table-column>
          <el-table-column
            prop="desc"
            label="类型描述"
          >
          </el-table-column>
          <el-table-column
            prop="code"
            label="字典编码"
          >
          </el-table-column>
          <el-table-column
            prop="text"
            label="字典描述"
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
                <el-button type="primary" size="mini" @click="addOrUpdate(scope.row,null)" v-has-permission="'sysDict:update'">编辑</el-button>
                <el-button type="danger" size="mini" @click="deleteRecord(scope.row.id)" v-has-permission="'sysDict:delete'">删除</el-button>
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
    <SysDictModal ref="entityModal" @reload="getList"></SysDictModal>
  </div>
</template>

<script>
  import SysDictModal from './SysDictModal'

  export default {
    name: "SysDict",
    components: {SysDictModal},
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
      addOrUpdate(row,same) {
        var entity = row ? row : null;
        var isSame = same ? same : null;
        this.$refs.entityModal.openModal(entity,isSame);
      },
      deleteRecord(primaryKey) {
        this.$confirm('确定删除吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true;
              this.$get('/system/sysDict/delete/' + primaryKey).then(res => {
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
        that.$postJson('/system/sysDict/list', that.queryParam).then(res => {
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
