
<template>
  <div class="certification-container">
    <el-container>
      <el-main>
        <el-form size="mini" :inline="true" class="demo-form-inline">
          <el-form-item>
            <div class="filter-operate">
              <el-row :span="25">
                <el-input v-model="queryParam.keyWord" placeholder="搜索手机号/姓名/机构名称" clearable @input="searchDebounce" />
              </el-row>
              <el-row :span="20">
                <el-select v-model="queryParam.buyerQualificationStatus" placeholder="筛选采购资质状态" clearable @change="buyerQualificationStatusChange" filterable>
                  <el-option v-for="item in BUYER_QUALIFICATION_STATUS" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-row>
              <el-row :span="20">
                <el-select v-model="queryParam.qualificationStatus" placeholder="筛选个人中心资质状态" clearable @change="qualificationStatusChange" filterable>
                  <el-option v-for="item in QUALIFICATION_STATUS" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-row>
            </div>
          </el-form-item>
        </el-form>
        <el-table v-loading="listTableLoading" :data="tableData" border style="width: 100%">
          <el-table-column prop="createTime" width="160" label="提交时间" />
          <el-table-column prop="userPhone" label="登录手机号" />
          <el-table-column prop="name" label="联系人姓名" />
          <el-table-column prop="phone" label="联系人手机号" />
          <el-table-column prop="organName" label="机构名称" />
          <el-table-column prop="organType" label="机构类型">
            <template slot-scope="scope">
              <span>{{ keymap.getValue('ORGAN_TYPE', scope.row.organType) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="buyerQualificationStatus" label="采购资质状态">
            <template slot-scope="scope">
              <span>{{ keymap.getValue('BUYER_QUALIFICATION_STATUS', scope.row.buyerQualificationStatus) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="qualificationStatus" label="个人中心资质状态">
            <template slot-scope="scope">
              <span>{{ keymap.getValue('QUALIFICATION_STATUS', scope.row.qualificationStatus) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="operator" label="操作人" />
          <el-table-column prop="operatorTime" width="160" label="操作时间" />
          <el-table-column label="操作" width="220">
            <template slot-scope="scope">
              <el-button v-has-permission="'appQualification:list'" type="primary" size="mini" @click="lookDetail(scope.row)">查看</el-button>
              <el-button v-has-permission="'appQualification:audit'" v-if="judgeCanCheck(scope.row.qualificationStatus)" type="primary" size="mini" @click="toExamine(scope.row)">审核</el-button>
            </template>
          </el-table-column>
        </el-table>
        <br>
        <el-pagination :current-page="pagination.pageNum" :page-sizes="PAGE_SIZE_ARR" :page-size="pagination.pageSize" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" :total="totalPageNum" @current-change="handleCurrentChange" />
      </el-main>
    </el-container>

  </div>
</template>

<script>
import { getAppQualificationList, getAppQualificationById, getVerifyRefuseReasonList } from '@/api/user'
import keymap from '@/utils/keymap'
import { debounce } from '@/utils/index'
import { QUALIFICATION_STATUS, SEARCH_DEBOUNCE_TIME, BUYER_QUALIFICATION_STATUS, VERIFY_REASON_TYPE, PAGE_SIZE_ARR } from '@/utils/constant'
import loadingMixins from '@/utils/loadingMixins'
export default {
  name: 'CertificationInfo',
  mixins: [loadingMixins],
  data() {
    return {
      keymap,
      QUALIFICATION_STATUS,
      BUYER_QUALIFICATION_STATUS,
      PAGE_SIZE_ARR,
      listTableLoading: false,
      queryParam: {},
      pagination: {
        pageNum: 1,
        pageSize: 10
      },
      tableData: [],
      totalPageNum: 0
    }
  },
  created() {
    this.getList()
    this.searchDebounce = debounce(this.searchUser, SEARCH_DEBOUNCE_TIME, false)
  },
  methods: {
    judgeCanCheck(val) {
      return (val === 0)
    },
    handleCurrentChange(newPage) {
      this.pagination.pageNum = newPage
      this.getList()
    },
    handleSizeChange(newSize) {
      this.pagination.pageSize = newSize
      this.getList()
    },
    getDetail(id) {
      return new Promise(async resolve => {
        const res = await getAppQualificationById({ id })
        resolve(res)
      })
    },
    // 获取理由列表数据
    getReasonList() {
      return new Promise(resolve => {
        Promise.all([
          getVerifyRefuseReasonList({ type: VERIFY_REASON_TYPE.MEDICAL }),
          getVerifyRefuseReasonList({ type: VERIFY_REASON_TYPE.BUYER }),
          getVerifyRefuseReasonList({ type: VERIFY_REASON_TYPE.CARD })
        ]).then(res => {
          resolve(res)
        })
      })
    },
    // 查看详情
    lookDetail({ id }) {
      this.$router.push({
        path: '/appUser/certificationInfo/seeCertifiInfoExam',
        query: {id: id}
      });
    },
    // 审核
    toExamine({ id }) {
       this.$router.push({
         path: '/appUser/certificationInfo/certificationInfoExamine',
         query: {id: id}
       });
    },
    // 改写表单数据
    async handleDetailDialog(id, type) {
      const targetData = this.$refs.detailDialog
      this.openFullScreenMixin()
      const res = await this.getDetail(id)
      const reasons = await this.getReasonList()
      this.closeFullScreenMixin()
      const defaultReason = {
        id: '',
        reason: '其他'
      }
      targetData.detailDialogVisible = true
      targetData.operateStatus = type
      targetData.id = id
      targetData.medicalReasons = reasons[0].data.list
      targetData.medicalReasons.push(defaultReason)
      targetData.buyerReasons = reasons[1].data.list
      targetData.buyerReasons.push(defaultReason)
      targetData.cardReasons = reasons[2].data.list
      targetData.cardReasons.push(defaultReason)
      res.data.provincesCode = res.data.provincesCode.split(',')
      res.data.medicalPermit = res.data.medicalPermit.split(',')[0] + ''
      res.data.buyerCard = res.data.buyerCard.split(',')
      const temp = res.data
      targetData.form = temp
      if (temp.provincesCode[0]) {
        targetData.selectedOptions.push(temp.provincesCode[0])
      }
      if (temp.provincesCode[1]) {
        targetData.selectedOptions.push(temp.provincesCode[1])
      }
      if (temp.provincesCode) {
        targetData.selectedOptions.push(temp.provincesCode[2])
      }
    },
    buyerQualificationStatusChange() {
      this.handleConditionQuery()
    },
    qualificationStatusChange() {
      this.handleConditionQuery()
    },
    searchUser() {
      this.handleConditionQuery()
    },
    // 获取数据
    handleConditionQuery() {
      this.initPageParam()
      this.getList()
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
    // 获取列表数据
    getList() {
      this.listTableLoading = true
      Object.assign(this.queryParam, this.pagination)
      getAppQualificationList(this.queryParam).then(res => {
        this.tableData = res.data.list
        this.totalPageNum = res.data.total
      }).finally(() => {
        this.listTableLoading = false
      })
    }
  }
}

</script>
<style lang='scss' scoped>
.certification-container {
  .filter-operate {
    display: flex;
    align-items: center;
    .el-row {
      margin-right: 12px;
    }
  }
}
</style>
