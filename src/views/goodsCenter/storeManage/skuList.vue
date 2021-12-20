<template>
  <div class="store-manage">
    <el-container>
      <el-main>
        <div class="operate-part">
          <span>{{storeName}}-{{goodsName}}</span>
          <div>
            <el-button @click="$router.back()">返回</el-button>
            <el-button type="primary" @click="addSku" v-has-permission="'storeGoodsSku:insert'">添加SKU</el-button>
          </div>
        </div>
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column prop="skuName" label="SKU" />
          <el-table-column prop="stockAmount" label="库存" />
          <el-table-column prop="status" label="是否上架">
            <template slot-scope="{ row }">
              <el-switch v-model="row.status" active-color="#5FC971" inactive-color="#DDDFE5" :active-value="1"
                :inactive-value="0" @change="handleChangeStatus(row)">
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="添加时间" />
          <el-table-column label="操作" width="240">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="stock(scope.row)" v-has-permission="'storeGoodsSku:update'">
                库存</el-button>
              <el-button type="primary" size="mini" @click="deleteStoreGoodsSku(scope.row)"
                v-has-permission="'storeGoodsSku:delete'">删除</el-button>
              <el-button type="primary" size="mini" @click="skuManage(scope.row)"
                v-has-permission="'storeGoodsPrice:list'">管理</el-button>
            </template>
          </el-table-column>
        </el-table>
        <br />
        <el-pagination :current-page="pagination.pageNum" :page-sizes="PAGE_SIZE_ARR" :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper" :total="totalPageNum" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </el-main>
    </el-container>
    <el-dialog title="添加SKU" :visible.sync="dialogSkuFormVisible">
      <el-form :model="skuForm" ref="skuForm" :rules="rules" label-width="100px">
        <el-form-item label="SKU" required>
          <el-select v-model="skuForm.skuId" filterable>
            <el-option v-for="item in skuList" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="库存" required prop="stockAmount">
          <el-input-number :min="0" :step-strictly="true" v-model="skuForm.stockAmount" :step="1"></el-input-number>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogSkuFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleAddSku">提 交</el-button>
      </div>
    </el-dialog>
    <el-dialog title="库存" :visible.sync="dialogSkuVisible">
      <el-form :model="sku" ref="sku" label-width="100px">
        <el-form-item label="库存" required prop="stockAmount">
          <el-input-number :min="0" :step-strictly="true" v-model="sku.stockAmount" :step="1"></el-input-number>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogSkuVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleUpdateSku">提 交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {
    storeGoodsSkuList,
    deleteStoreGoodsSku,
    storeGoodsSkuUpdateStatus,
    getSkuByGoodsId,
    storeGoodsSkuInsert,
    storeGoodsSkuUpdate
  } from '@/api/goodsCenter'
  import {
    PAGE_SIZE_ARR,
  } from "@/utils/constant";



  export default {
    name: "storeManage",
    props: [],
    data() {
      return {
        storeName: '',
        goodsName: '',
        goodsId: '',
        totalPageNum: 0,
        tableData: [],
        PAGE_SIZE_ARR,
        queryParam: {
          storeGoodsId: '',
        },
        pagination: {
          pageNum: 1,
          pageSize: 10,
        },
        dialogSkuFormVisible: false,
        skuForm: {
          skuId: '',
          stockAmount: 1,
        },
        rules: {
          skuId: [{
            required: true,
            message: '请选择规格',
            trigger: 'change'
          }],
          stockAmount: [{
            required: true,
            message: '请输入库存',
            trigger: 'blur'
          }, ],
        },
        skuList: [],
        dialogSkuVisible: false,
        sku: {
          stockAmount: '',
          skuId: '',
          id: '',
        },
      };
    },

    created() {
      this.queryParam.storeGoodsId = this.$route.query.storeGoodsId;
      this.goodsId = this.$route.query.goodsId;
      this.storeName = this.$route.query.storeName;
      this.goodsName = this.$route.query.goodsName;
      this.getTableData();
    },

    methods: {
      addSku() {
        this.getSkuList();
        this.skuForm.skuId = '';
        this.dialogSkuFormVisible = true;
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
        const res = await storeGoodsSkuList(this.queryParam);
        if (res.success == 1) {
          this.tableData = res.data.list;
          this.totalPageNum = res.data.total;
        }
      },
      stock(row) {
        this.sku.stockAmount = row.stockAmount;
        this.sku.skuId = row.skuId;
        this.sku.id = row.id;
        this.dialogSkuVisible = true;
      },
      // 删除
      deleteStoreGoodsSku(row) {
        this.$confirm("是否确定删除？", "删除", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }).then(() => {
          deleteStoreGoodsSku({
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
      handleChangeStatus(row) {
        if (row.status === 1) {
          storeGoodsSkuUpdateStatus({
            id: row.id,
            status: 1
          }).then((res) => {
            if (res.success === 1) {
              this.$message.success(res.msg);
              this.getTableData();
            } else {
              row.status = !row.status;
            }
          }).catch((err) => {
            this.$message.error(err.msg);
          });
        } else {
          storeGoodsSkuUpdateStatus({
            id: row.id,
            status: 0
          }).then((res) => {
            if (res.success === 1) {
              this.$message.success(res.msg);
              this.getTableData();
            } else {
              row.status = !row.status;
            }
          }).catch((err) => {
            this.$message.error(err.msg);
          });
        }
      },
      getSkuList() {
        getSkuByGoodsId({
          goodsId: this.goodsId
        }).then((res) => {
          if (res.success === 1) {
            this.skuList = res.data;
          }
        });
      },
      handleAddSku() {
        this.$refs.skuForm.validate((valid) => {
          if (valid) {
            storeGoodsSkuInsert({
              storeGoodsId: this.queryParam.storeGoodsId,
              stockAmount: this.skuForm.stockAmount,
              skuId: this.skuForm.skuId,
            }).then((res) => {
              if (res.success === 1) {
                this.$message.success(res.msg);
                this.dialogSkuFormVisible = false;
                this.getTableData();
              }
            }).catch((err) => {
              this.$message.error(err.msg);
            });
          }
        });
      },
      handleUpdateSku() {
        storeGoodsSkuUpdate({
          storeGoodsId: this.queryParam.storeGoodsId,
          stockAmount: this.sku.stockAmount,
          skuId: this.sku.skuId,
          id: this.sku.id,
        }).then((res) => {
          if (res.success === 1) {
            this.$message.success(res.msg);
            this.dialogSkuVisible = false;
            this.getTableData();
          }
        }).catch((err) => {
          this.$message.error(err.msg);
        });
      },
      skuManage(row) {
        this.$router.push({
          path: '/goodsCenter/storeManage/skuManage',
          query: {
            storeGoodsId: row.storeGoodsId,
            storeGoodsSkuId: row.id,
            skuId: row.skuId,
            goodsId: row.goodsId,
            storeId: row.storeId,
            goodsName: row.goodsName,
            storeName: row.storeName,
            skuName: row.skuName,
          },
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
