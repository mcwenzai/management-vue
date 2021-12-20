<template>
  <div class="banner-admin">
    <el-container>
      <el-main>
        <div class="operate-part">
          <el-select v-model="queryParam.type" placeholder="选择客户端" @change="filterByClientType" filterable>
            <el-option v-for="item in CLIENT_TYPE" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-button type="primary" @click="createVersion" v-has-permission="'appVersion:insert'">新建版本</el-button>
        </div>
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column label="客户端">
            <template slot-scope="scope">
              <span>{{ keymap.getValue('CLIENT_TYPE', scope.row.type) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="versionName" label="版本号名称" />
          <el-table-column prop="versionCode" label="数字版本号" />
          <el-table-column prop="versionDescribe" label="更新描述" show-overflow-tooltip/>
          <el-table-column prop="createTime" label="更新时间" />
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="edit(scope.row)" v-has-permission="'appVersion:update'">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
        <br>
        <el-pagination :current-page="pagination.pageNum" :page-sizes="PAGE_SIZE_ARR" :page-size="pagination.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="totalPageNum" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </el-main>
    </el-container>
    <VersionAdminDetailDialog ref="VersionAdminDetailDialog" @updateSuccess="emitUpdateSuccess" />
  </div>
</template>

<script>
import { getVersions } from '@/api/appAdmin'
import { PAGE_SIZE_ARR, CLIENT_TYPE } from '@/utils/constant'
import keymap from '@/utils/keymap'
import VersionAdminDetailDialog from './VersionAdminDetailDialog'
import { deepClone } from '@/utils'
export default {
  name: 'VersionAdmin',
  components: {
    VersionAdminDetailDialog
  },
  data() {
    return {
      pagination: {
        pageNum: 1,
        pageSize: 10
      },
      queryParam: {
        type: null
      },
      totalPageNum: 0,
      tableData: [],
      PAGE_SIZE_ARR,
      CLIENT_TYPE,
      keymap
    }
  },
  created() {
    this.loadVersions()
  },
  methods: {
    emitUpdateSuccess() {
      this.loadVersions()
    },
    filterByClientType() {
      this.loadVersions()
    },
    handleCurrentChange(newPage) {
      this.pagination.pageNum = newPage
      this.loadVersions()
    },
    handleSizeChange(newSize) {
      this.pagination.pageSize = newSize
      this.loadVersions()
    },
    async loadVersions() {
      Object.assign(this.queryParam, this.pagination)
      const res = await getVersions(this.queryParam)
      this.tableData = res.data.list
      this.totalPageNum = res.data.total
    },
    createVersion() {
      const targetData = this.$refs.VersionAdminDetailDialog
      targetData.dialogVisible = true
    },
    edit(row) {
      const targetData = this.$refs.VersionAdminDetailDialog
      targetData.dialogVisible = true
      this.$nextTick(_ => {
        targetData.form = deepClone(row)
      })
    }
  }
}
</script>

<style scoped>
.operate-part {
  display: flex;
  justify-content: space-between;
  padding: 20px 0;
}
.sample-img {
  width: 100px;
  height: 100px;
}
</style>
