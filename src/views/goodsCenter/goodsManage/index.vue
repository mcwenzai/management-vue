<template>
  <div class="brand-admin">
    <el-container>
      <el-main>
        <div class="operate-part">
          <div class="flex">
            <el-input
              clearable
              v-model="queryParam.goodsName"
              placeholder="搜索商品名称"
              @input="searchDebounce"
            />
            <el-input
              clearable
              v-model="queryParam.brandName"
              placeholder="搜索品牌"
              @input="searchDebounce"
            />
            <!-- <el-input
              v-model="queryParam.storeName"
              placeholder="搜索店铺"
              @input="searchDebounce"
            /> -->
            <el-select
              v-model="queryParam.type"
              placeholder="选择类型"
              clearable
              @change="handleChangeType"
              filterable
            >
              <el-option
                v-for="item in GOODS_TYPE"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>

            <el-select
              v-model="queryParam.isRecommend"
              placeholder="首页是否推荐"
              clearable
              @change="handleChangeType"
              filterable
            >
              <el-option label="否" :value="0"/>
              <el-option label="是" :value="1"/>
            </el-select>

            <!-- <el-cascader
              placeholder="请选择"
              clearable
              :options="treeList"
              :props="{ expandTrigger: 'hover', value: 'id', label: 'name' }"
              @change="onCascader"
            /> -->
          </div>
          <el-button type="primary" @click="see" v-has-permission="'goods:insert'">新增商品</el-button>
        </div>
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column prop="goodsName" label="商品名称" />
          <el-table-column prop="brandName" label="品牌" />
          <el-table-column prop="type" label="首页是否推荐">
            <template slot-scope="{ row }">
              {{ KeyMap.ClientKeyMap.IS_SPLIT[row.isRecommend] }}
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型">
            <template slot-scope="{ row }">
              {{ KeyMap.ClientKeyMap.GOODS_TYPE[row.type] }}
            </template>
          </el-table-column>
          <el-table-column prop="skuCount" label="规格数" />
          <el-table-column prop="status" label="状态">
            <template slot-scope="{ row }">
              {{ GOODS_STATUS2[row.status || 0].label }}
            </template>
          </el-table-column>

          <el-table-column prop="createTime" label="创建时间" />
          <el-table-column prop="updateTime" label="更新时间" />
          <el-table-column prop="updater" label="更新人" />
          <el-table-column label="操作" width="220">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="see(scope.row)"
                v-has-permission="'goods:update'">编辑</el-button
              >
              <el-button
                type="primary"
                size="mini"
                @click="deleteBrand(scope.row)"
                v-has-permission="'goods:delete'">删除</el-button
              >
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
  </div>
</template>

<script>
import { debounce } from "@/utils/index";
import {
  GOODS_STATUS2,
  SEARCH_DEBOUNCE_TIME,
  PAGE_SIZE_ARR,
  GOODS_TYPE,
} from "@/utils/constant";
import {
  getGoodsList,
  getClassifyTree,
  updateGoodsStatus,
  deleteGoods,
} from "@/api/goodsCenter";
import KeyMap from '@/utils/keymap';
export default {
  name: "goodsManage",
  data() {
    return {
      GOODS_STATUS2,
      GOODS_TYPE,
      KeyMap,
      treeList: [],

      PAGE_SIZE_ARR,
      queryParam: {
        goodsName: "",
        brandName: "",
        storeName: "",
        type: "",
        isRecommend: ''
      },
      searchDebounce: null,
      pagination: {
        pageNum: 1,
        pageSize: 10,
      },
      totalPageNum: 0,
      tableData: [],
      dialogVisible: false,
      readOnly: false,
    };
  },
  created() {
    this.getTableData();
    this.getTree();
    this.searchDebounce = debounce(
      this.handleConditionQuery,
      SEARCH_DEBOUNCE_TIME,
      false
    );
  },
  methods: {
    // 多级联动
    onCascader(e) {
      let classifyId = "";
      if (e[2]) {
        classifyId = e[2];
      }
      this.queryParam.classifyId = classifyId;

    },
    handleChangeType() {
      this.searchDebounce();
    },
    async getTree() {
      let res = await getClassifyTree();
      res = res.data || [];
      res.forEach((e) => {
        e.children.forEach((el) => {
          el.children.forEach((ele) => {
            delete ele.children;
          });
        });
      });
      this.treeList = res;
    },

    // 上架
    start(row) {
      this.$confirm("是否确定上架？", "上架", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        updateGoodsStatus({
          id: row.id,
          state: 1,
        }).then((res) => {
          if (res.success === 1) {
            this.getTableData();
            this.$message.success(res.msg);
          } else {
            this.$message.error(res.msg);
          }
        }).catch((err) => {
          this.$message.error(err.msg);
        });
      });
    },
    // 下架
    stop(row) {
      this.$confirm("是否确定下架？", "下架", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        updateGoodsStatus({
          id: row.id,
          state: 2,
        }).then((res) => {
          if (res.success === 1) {
            this.getTableData();
            this.$message.success(res.msg);
          } else {
            this.$message.error(res.msg);
          }
        }).catch((err) => {
          this.$message.error(err.msg);
        });
      });
    },
    // 编辑
    see(row) {
      this.$router.push(
        `/goodsCenter/goodsManage/edit?id=${row.id ? row.id : ""}`
      );
    },
    // 删除
    deleteBrand(row) {
      this.$confirm("是否确定删除？", "删除", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        deleteGoods({
          id: row.id,
        }).then((res) => {
          if (res.success === 1) {
            this.getTableData();
            this.$message.success(res.msg);
          } else {
            this.$message.error(res.msg);
          }
        }).catch((err) => {
          this.$message.error(err.msg);
        });
      });
    },

    async getTableData() {
      Object.assign(this.queryParam, this.pagination);
      // console.log('param',this.queryParam);
      const res = await getGoodsList(this.queryParam);

      if (res.success == 1) {
        this.tableData = res.data.list;
        // console.log("TableData", this.tableData);
        // date = date.substring(0, 19);
        // date = date.replace(/-/g, "/"); //必须把日期'-'转为'/'
        // var timestamp = new Date(date).getTime();
        // functino
        // this.tableData = this.tableData.sort(function (a, b) {
        //   let aTime = a.createTime.getTime();
        //   let bTime = b.createTime.getTime();
        //   if (bTime < aTime) {
        //     return -1;
        //   } else if (bTime > aTime) {
        //     return 1;
        //   }
        //   return 0;
        // });
        this.totalPageNum = res.data.total;
      }
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
  },
};
</script>
<style lang='scss' scoped>
.brand-admin {
  .operate-part {
    display: flex;
    justify-content: space-between;
    padding: 20px 0;
    .el-input {
      width: 200px;
    }
  }
}
.sample-img {
  width: 74px;
  height: 74px;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 74px;
  height: 74px;
  line-height: 74px;
  text-align: center;
  border: 1px solid #dcdfe6;
}
</style>
