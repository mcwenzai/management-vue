<template>
  <div>
    <el-container>
      <el-main>
        <el-form size="mini" :inline="true" class="demo-form-inline">
          <el-form-item>
            <el-input v-model="queryParam.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="query()">查询</el-button>
            <el-button type="info" @click="reload()">重置</el-button>
            <el-button v-has-permission="'sysUser:insert'" type="primary" @click="addOrUpdate(null)">添加</el-button>
          </el-form-item>
        </el-form>
        <el-table v-loading="loading" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" />
          <el-table-column prop="username" label="用户名" width="180" />
          <el-table-column prop="nickname" label="昵称" width="180" />
          <el-table-column prop="headimg" label="头像">
            <template slot-scope="scope">
              <img v-if="scope.row.headimg" style="width: 50px;height: 50px" :src="scope.row.headimg" class="avatar">
              <span v-else>未上传</span>
            </template>
          </el-table-column>
          <el-table-column prop="state" label="状态" width="180">
            <template slot-scope="scope">
              <el-switch v-if="scope.row.username!=='admin'" v-model="scope.row.state===1" active-text="正常" inactive-text="禁用" @change="changeState(scope.row)" />
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180" />
          <el-table-column label="操作" width="180">
            <template slot-scope="scope">
              <div v-if="scope.row.username!=='admin'">
                <el-button type="primary" size="mini" @click="addOrUpdate(scope.row)" v-has-permission="'sysUser:update'">编辑</el-button>
                <el-button type="danger" size="mini" @click="deleteRecord(scope.row.id)" v-has-permission="'sysUser:delete'">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <br>
        <el-pagination background :current-page="pagination.pageNum" @size-change="handleSizeChange" :page-sizes="[10, 20, 50, 100]" @current-change="handleCurrentChange" :page-size="pagination.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total" />
      </el-main>
    </el-container>
    <SysUserModal ref="entityModal" @reload="getList" />
  </div>
</template>

<script>
import SysUserModal from './SysUserModal'

export default {
  name: 'SysUser',
  components: { SysUserModal },
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
  created() {
    this.getList()
  },
  methods: {
    changeState(entity) {
      var id = entity.id
      var state = entity.state
      var change = 1
      if (state === 1) {
        change = 0
      }
      var param = {
        id: id,
        state: change
      }
      this.loading = true
      this.$postJson('/system/sysUser/update', param).then(res => {
        this.loading = false
        if (res.success === 1) {
          this.$message({
            type: 'success',
            message: res.msg
          })
          this.getList()
        }
      })
    },
    addOrUpdate(row) {
      var entity = row || null
      this.$refs.entityModal.openModal(entity)
    },
    deleteRecord(primaryKey) {
      this.$confirm('确定删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            this.$get('/system/sysUser/delete/' + primaryKey).then(res => {
              instance.confirmButtonLoading = false
              if (res.success === 1) {
                this.$message({
                  type: 'success',
                  message: res.msg
                })
                done()
                this.getList()
              }
            })
          } else {
            this.$message({
              type: 'info',
              message: '已取消删除'
            })
            done()
          }
        }
      }).catch(() => { })
    },
    reload() {
      this.initPageParam()
      this.queryParam = {}
      this.getList()
    },
    initPageParam() {
      this.pagination = {
        pageNum: 1,
        pageSize: 10
      }
    },
    query() {
      this.initPageParam()
      this.getList()
    },
    getList() {
      var that = this
      that.loading = true
      Object.assign(that.queryParam, that.pagination)
      that.$postJson('/system/sysUser/list', that.queryParam).then(res => {
        that.loading = false
        that.tableData = res.data.list
        that.total = res.data.total
      })
    },
    handleSizeChange(val) {
      this.pagination.pageNum = 1
      this.pagination.pageSize = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.pagination.pageNum = val
      this.getList()
    }
  }
}
</script>

<style scoped>
</style>
