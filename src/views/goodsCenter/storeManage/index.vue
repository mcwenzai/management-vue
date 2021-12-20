<template>
  <div class="store-manage">
    <el-container>
      <el-main>
        <div class="operate-part">
          <el-input v-model="queryParam.name" placeholder="搜索店铺名称" @input="searchDebounce" />
          <el-button type="primary" @click="see" v-has-permission="'store:insert'">新增店铺</el-button>
        </div>
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column prop="name" label="店铺名称" />
          <el-table-column label="logo">
            <template slot-scope="scope">
              <el-image class="sample-img" :src="scope.row.logoUrl" fit="fill" />
            </template>
          </el-table-column>
          <el-table-column prop="operator" label="经营者" />
          <el-table-column prop="status" label="状态">
            <template slot-scope="{ row }">
              {{ GOODS_STATUS2[row.status || 0].label }}
            </template>
          </el-table-column>
          <el-table-column prop="showModel" label="店铺展示模式">
            <template slot-scope="scope">
              <span>{{scope.row.state? '商品分类':'商品图片'}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" />
          <el-table-column prop="updateTime" label="更新时间" />
          <el-table-column label="操作" width="340">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="manageGoods(scope.row)"
                v-has-permission="'storeGoods:list'">管理商品</el-button>
              <el-button type="primary" size="mini" @click="see(scope.row)" v-has-permission="'store:update'">编辑
              </el-button>
              <el-button type="primary" size="mini" @click="deleteStore(scope.row)" v-has-permission="'store:delete'">删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <br />
        <el-pagination :current-page="pagination.pageNum" :page-sizes="PAGE_SIZE_ARR" :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper" :total="totalPageNum" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </el-main>
    </el-container>
  </div>
</template>

<script>
  import {
    debounce
  } from "@/utils/index";
  import {
    getStoreList,
    deleteStore
  } from '@/api/goodsCenter'
  import {
    GOODS_STATUS2,
    SEARCH_DEBOUNCE_TIME,
    PAGE_SIZE_ARR,
  } from "@/utils/constant";



  export default {
    name: "storeManage",
    props: [],
    data() {
      return {
        GOODS_STATUS2,
        totalPageNum: 0,
        tableData: [],
        PAGE_SIZE_ARR,
        queryParam: {
          name: '',
        },
        searchDebounce: null,
        pagination: {
          pageNum: 1,
          pageSize: 10,
        },
      };
    },

    created() {
      this.getTableData();
      // this.getTree();
      this.searchDebounce = debounce(
        this.handleConditionQuery,
        SEARCH_DEBOUNCE_TIME,
        false
      );
    },

    methods: {
      manageGoods(row) {
        this.$router.push(
          `/goodsCenter/storeManage/goodsList?storeId=${row.id}&storeName=${row.name}`
        );
      },
      see(row) {
        this.$router.push(
          `/goodsCenter/storeManage/edit?id=${row.id ? row.id : ""}`
        );
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
        // console.log('param',this.queryParam);
        const res = await getStoreList(this.queryParam);

        if (res.success == 1) {
          this.tableData = res.data.list;
          this.totalPageNum = res.data.total;
        }
      },
      // 删除
      deleteStore(row) {
        this.$confirm("是否确定删除？", "删除", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }).then(() => {
          deleteStore({
            id: row.id,
          }).then((res) => {
            if (res.success === 1) {
              this.$message.success(res.msg);
              this.getTableData();
            }
          }).catch((err) => {
            this.$message.error(err.msg);
          });
        });
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
