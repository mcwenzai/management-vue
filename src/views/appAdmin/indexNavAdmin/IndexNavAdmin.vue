<template>
  <div class="banner-admin">
    <el-container>
      <el-main>
        <div class="operate-part">
          <el-button type="primary" @click="createBanner" v-has-permission="'indexConfig:insert'">新建分类导航</el-button>
        </div>
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column prop="name" label="分类导航名称" />
          <el-table-column label="分类导航图标">
            <template slot-scope="scope">
              <el-image class="sample-img" :src="scope.row.imgUrl" fit="fill" />
            </template>
          </el-table-column>
          <el-table-column prop="sort" label="权重" />
          <el-table-column label="状态">
            <template slot-scope="scope">
              <span>{{ keymap.getValue('INDEX_BANNER_ISDISPLAY', scope.row.isDisplay) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="creator" label="操作人" />
          <el-table-column prop="createTime" label="操作时间" />
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="edit(scope.row)" v-has-permission="'indexConfig:update'">编辑</el-button>
              <el-button v-if="scope.row.isDisplay === BANNER_CATEGORY_ISDISPLAY.SHOW" type="primary" size="mini"
                @click="toggleIsDisplay(scope.row, BANNER_CATEGORY_ISDISPLAY.HIDDEN)" v-has-permission="'indexConfig:display'">隐藏</el-button>
              <el-button v-if="scope.row.isDisplay === BANNER_CATEGORY_ISDISPLAY.HIDDEN" type="primary" size="mini"
                @click="toggleIsDisplay(scope.row, BANNER_CATEGORY_ISDISPLAY.SHOW)" v-has-permission="'indexConfig:display'">展示</el-button>
            </template>
          </el-table-column>
        </el-table>
        <br>
        <el-pagination :current-page="pagination.pageNum" :page-sizes="PAGE_SIZE_ARR" :page-size="pagination.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="totalPageNum" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </el-main>
    </el-container>
    <BannerCategoryDialog ref="BannerCategoryDialog" @updateSuccess="emitUpdateSuccess" />
  </div>
</template>

<script>
import { getIndexBanners, toggleIndexBannerDisplay } from '@/api/appAdmin'
import { PAGE_SIZE_ARR, APP_ADMIN_TYPE, BANNER_CATEGORY_ISDISPLAY } from '@/utils/constant'
import keymap from '@/utils/keymap'
import BannerCategoryDialog from '@/components/BannerCategoryDialog'
import { deepClone } from '@/utils'
export default {
  name: 'IndexNavAdmin',
  components: {
    BannerCategoryDialog
  },
  data() {
    return {
      keymap,
      pagination: {
        pageNum: 1,
        pageSize: 10
      },
      totalPageNum: 0,
      tableData: [],
      PAGE_SIZE_ARR,
      type: APP_ADMIN_TYPE.CATEGORY,
      BANNER_CATEGORY_ISDISPLAY
    }
  },
  created() {
    this.loadIndexBanners()
  },
  methods: {
    emitUpdateSuccess() {
      this.loadIndexBanners()
    },
    handleCurrentChange(newPage) {
      this.pagination.pageNum = newPage
      this.loadIndexBanners()
    },
    handleSizeChange(newSize) {
      this.pagination.pageSize = newSize
      this.loadIndexBanners()
    },
    async loadIndexBanners() {
      const postData = Object.assign({}, this.pagination, { type: this.type })
      const res = await getIndexBanners(postData)
      this.tableData = res.data.list
      this.totalPageNum = res.data.total
    },
    createBanner() {
      const targetCpn = this.$refs.BannerCategoryDialog
      targetCpn.form.type = this.type
      targetCpn.dialogVisible = true
    },
    edit(row) {
      const targetCpn = this.$refs.BannerCategoryDialog
      targetCpn.dialogVisible = true
      this.$nextTick(_ => {
        targetCpn.form = deepClone(row)
      })
    },
    async toggleIsDisplay(row, type) {
      const confirmTitle = type === this.BANNER_CATEGORY_ISDISPLAY.HIDDEN ? '隐藏' : '展示'
      const confirmContent = type === this.BANNER_CATEGORY_ISDISPLAY.HIDDEN ? '是否确定隐藏？' : '是否确定展示？'
      this.$confirm(confirmContent, confirmTitle, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await toggleIndexBannerDisplay({ id: row.id, isDisplay: type })
        this.loadIndexBanners()
      }).catch(() => {
        // do nothing
      })
    }
  }
}
</script>

<style scoped>
.operate-part {
  display: flex;
  justify-content: flex-end;
  padding: 20px 0;
}
.sample-img {
  width: 50px;
  height: 50px;
}
</style>
