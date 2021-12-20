<template>
  <div class="store-manage">
    <el-container>
      <el-main>
        <div class="operate-part">
          <div>
            <el-input
              v-model="queryParam.goodsName"
              clearable
              placeholder="搜索商品名称"
              @input="searchDebounce"
            />
            <el-input
              clearable
              v-model="queryParam.appUserName"
              placeholder="用户"
              @input="searchDebounce"
            />
            <el-input
              clearable
              v-model="queryParam.appUserPhone"
              placeholder="手机号"
              @input="searchDebounce"
            />
            <el-input
              clearable
              v-model="queryParam.organName"
              placeholder="机构名称"
              @input="searchDebounce"
            />
          </div>
        </div>
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column prop="appUserName" label="用户" />
          <el-table-column prop="appUserPhone" label="手机号" />
          <el-table-column prop="organName" label="机构名称" />
          <el-table-column prop="goodsName" label="申请商品" />
          <el-table-column prop="state" label="授权结果">
            <template slot-scope="{ row }">
              {{ QUALIFICATION_CHECK_STATUS[row.state || 0].label }}
            </template>
          </el-table-column>
          <el-table-column prop="authorUserName" label="授权人" />
          <el-table-column prop="authorUserPhone" label="授权人手机号" />
          <el-table-column prop="createTime" label="申请时间" />
          <el-table-column label="操作" width="200" align="center">
            <template slot-scope="scope">
              <el-button type="primary" size="mini"
              @click="check(scope.row, '审核')" v-has-permission="'goodsAuthorize:audit'" v-if="scope.row.state === QUALIFICATION_CHECK_STATUS[0].value">审核</el-button>
              <el-button type="primary" size="mini"
                @click="check(scope.row, '查看')" v-has-permission="'goodsAuthorize:list'" v-else>查看</el-button>
            </template>
          </el-table-column>
        </el-table>
        <br />
        <el-pagination
          :current-page="pagination.pageNum"
          :page-sizes="PAGE_SIZE_ARR"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalPageNum"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </el-main>
    </el-container>
    <el-dialog :title="title" :visible.sync="dialogFormVisible">
      <el-form :model="detail" label-width="100px">
        <el-form-item label="申请商品" required>
          <span>{{detail.goodsName}}</span>
        </el-form-item>
        <el-form-item label="授权结果" required prop="state">
          <el-radio v-model="detail.state" :label="1" :disabled="title === '查看'">通过</el-radio>
          <el-radio v-model="detail.state" :label="2" :disabled="title === '查看'">拒绝</el-radio>
        </el-form-item>
        <el-form-item label="备注" :required="detail.state === 2">
          <el-input v-model="detail.note" maxlength="100" :disabled="title === '查看'"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" v-if="title === '查看'">
        <el-button @click="dialogFormVisible = false">关 闭</el-button>
      </div>
      <div slot="footer" class="dialog-footer" v-else>
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleCheck">提 交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { debounce } from "@/utils/index";
import { getGoodsAuthorizeList, audit } from '@/api/goodsCenter'
import {
  QUALIFICATION_CHECK_STATUS,
  SEARCH_DEBOUNCE_TIME,
  PAGE_SIZE_ARR,
} from "@/utils/constant";

export default {
  name: "goodsAuthorize",
  props:[],
  data() {
    return {
        QUALIFICATION_CHECK_STATUS,
        totalPageNum: 0,
        tableData: [],
        PAGE_SIZE_ARR,
        queryParam: {
          goodsName:'',
          organName: '',
          appUserName: '',
          appUserPhone: '',
        },
        searchDebounce: null,
        pagination:{
          pageNum: 1,
          pageSize: 10,
        },
        title: '',
        dialogFormVisible: false,
        detail: {
          id: '',
          goodsName: '',
          state: 1,
          note: '',
        },
    };
  },

  created() {
    this.getTableData();
    this.searchDebounce = debounce(
      this.handleConditionQuery,
      SEARCH_DEBOUNCE_TIME,
      false
    );
  },

  methods: {
    check(row, title) {
      this.detail.id = row.id;
      this.detail.goodsName = row.goodsName;
      this.detail.note = row.note;
      this.detail.state = row.state;
      this.title = title;
      this.dialogFormVisible = true;
    },
    handleCheck() {
      if (this.detail.state !== 1 && this.detail.state !== 2) {
        this.$message.warning('请选择授权结果');
        return;
      }
      if (this.detail.state === 2 && (!this.detail.note || !this.detail.note.trim())) {
        this.$message.warning('请输入拒绝理由');
        return;
      }
      audit(this.detail).then((res) => {
        this.$message.success(res.msg);
        this.dialogFormVisible = false;
        this.getTableData();
      }).catch((err) => {
        this.$message.success(err.msg)
      });
    },
    handleCurrentChange(newPage) {
      this.pagination.pageNum = newPage;
      this.getTableData();
    },
    handleSizeChange(newSize) {
      this.pagination.pageSize = newSize;
      this.getTableData();
    },
    handleConditionQuery() {
      this.initPageParam();
      this.getTableData();
    },
    initPageParam() {
      this.pagination = {
        pageNum: 1,
        pageSize: 10,
      };
    },
    async getTableData() {
      Object.assign(this.queryParam, this.pagination);
      const res = await getGoodsAuthorizeList(this.queryParam);
      if (res.success == 1) {
        this.tableData = res.data.list;
        this.totalPageNum = res.data.total;
      }
    },
  },
};
</script>

<style lang='scss' scoped>
  .store-manage {
  .operate-part {
    display: flex;
    justify-content: space-between;
    padding: 20px 0;
    .el-input {
      width: 200px;
    }
  }
}
</style>