<template>
  <div>
    <el-container>
      <el-main>
        <el-table
          v-loading="tableLoading"
          :data="tableData"
          border
          style="width: 100%"
        >
          <el-table-column type="index" width="50" label="序号">
          </el-table-column>
          <el-table-column
            prop="phone"
            label="手机号"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="verifyCode"
            label="验证码"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="createTime"
            label="创建时间"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
        </el-table>
        <br />
        <el-pagination
          background
          @size-change="changePageSize"
          @current-change="changePageNum"
          :current-page="pageNum"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalNum"
        >
        </el-pagination>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { tableMixins } from "@/utils/tableMixins";
export default {
  mixins: [tableMixins],
  data() {
    return {
      tableUrl: "/system/sms/list"
    };
  },
  created() {
    this.getTableData();
  },
  methods: {}
};
</script>

<style scoped></style>
