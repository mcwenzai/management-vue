<template>
  <div class="store-manage">
    <el-container>
      <el-main>
        <div class="operate-part">
          <span>{{storeName}}-{{goodsName}}-{{skuName}}</span>
          <div>
            <el-button @click="$router.back()">返回</el-button>
            <el-button type="primary" @click="add" v-has-permission="'storeGoodsPrice:insert'">新增</el-button>
          </div>
        </div>
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column prop="cityNameList" label="可售区域" />
          <el-table-column prop="purchasePrice" label="单价" />
          <el-table-column label="是否可兑换积分">
            <template slot-scope="{ row }">
              <span>{{row.givePoint > 0 ? '是' : '否'}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="givePoint" label="积分兑换比例" />
          <el-table-column prop="packageNum" label="起批量" />
          <el-table-column prop="createTime" label="添加时间" />
          <el-table-column label="操作" width="240">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="deleteStoreGoodsPrice(scope.row)"
                v-has-permission="'storeGoodsPrice:delete'">删除</el-button>
              <el-button type="primary" size="mini" @click="editStoreGoodsPrice(scope.row)"
                v-has-permission="'storeGoodsPrice:update'">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
        <br />
        <el-pagination :current-page="pagination.pageNum" :page-sizes="PAGE_SIZE_ARR" :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper" :total="totalPageNum" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </el-main>
    </el-container>
    <el-dialog :title="title" :visible.sync="dialogPriceFormVisible">
      <el-form :model="priceForm" ref="priceForm" :rules="rules" label-width="130px">
        <el-form-item label="可售区域" required prop="cityCodeList">
          <el-select v-model="priceForm.cityCodeList" multiple filterable placeholder="请选择">
            <el-option v-for="item in regionData" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="市场价" required prop="marketPrice">
          <el-input-number :min="0" :precision="2" v-model="priceForm.marketPrice"></el-input-number>
        </el-form-item> -->
        <el-form-item label="单价" required prop="purchasePrice">
          <el-input-number :min="0" :precision="2" v-model="priceForm.purchasePrice"></el-input-number>
        </el-form-item>
        <el-form-item label="是否可兑换积分" required prop="isGive">
          <el-radio-group v-model="priceForm.isGive" @change="pointChange">
            <el-radio :label="0">否</el-radio>
            <el-radio :label="1">是</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="可兑换积分" required prop="givePoint" v-show="priceForm.isGive">
          <el-input-number :min="priceForm.isGive ? 1 : 0" :precision="0" v-model="priceForm.givePoint">
          </el-input-number>
        </el-form-item>
        <el-form-item label="起批量" required prop="packageNum">
          <el-input-number :min="1" :precision="0" v-model="priceForm.packageNum"></el-input-number>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogPriceFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">提 交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {
    storeGoodsPriceList,
    deleteStoreGoodsPrice,
    storeGoodsPriceUpdate,
    storeGoodsPriceInsert,
    getStoreGoodsPriceById
  } from '@/api/goodsCenter'
  import {
    regionData
  } from 'element-china-area-data';
  import {
    PAGE_SIZE_ARR,
  } from "@/utils/constant";

  export default {
    name: "storeManage",
    props: [],
    data() {
      return {
        regionData,
        storeName: '',
        goodsName: '',
        skuName: '',
        totalPageNum: 0,
        tableData: [],
        PAGE_SIZE_ARR,
        queryParam: {
          storeGoodsSkuId: '',
          skuId: '',
        },
        pagination: {
          pageNum: 1,
          pageSize: 10,
        },
        dialogPriceFormVisible: false,
        priceForm: {
          id: '',
          storeId: '',
          goodsId: '',
          storeGoodsSkuId: '',
          storeGoodsId: '',
          cityCodeList: [],
          cityCode: '',
          packageNum: '',
          // marketPrice: '',
          purchasePrice: '',
          givePoint: 0,
          isGive: 0,
        },
        rules: {
          cityCodeList: [{
            type: 'array',
            required: true,
            message: '请选择区域',
            trigger: 'change'
          }],
        },
        areaList: [],
        title: '',
      };
    },
    mounted() {
      this.queryParam.storeGoodsSkuId = this.$route.query.storeGoodsSkuId;
      this.queryParam.skuId = this.$route.query.skuId;
      this.priceForm.storeGoodsId = this.$route.query.storeGoodsId;
      this.priceForm.storeId = this.$route.query.storeId;
      this.priceForm.goodsId = this.$route.query.goodsId;
      this.priceForm.storeGoodsSkuId = this.$route.query.storeGoodsSkuId;
      this.storeName = this.$route.query.storeName;
      this.goodsName = this.$route.query.goodsName;
      this.skuName = this.$route.query.skuName;
      this.getTableData();
    },
    methods: {
      resetForm() {
        this.priceForm.cityCode = '';
        this.priceForm.cityCodeList = [];
        this.priceForm.packageNum = ''
        this.priceForm.givePoint = 0;
        this.priceForm.isGive = 0;
        // this.priceForm.marketPrice = '';
        this.priceForm.purchasePrice = '';
      },
      add() {
        this.priceForm.id = '';
        this.priceForm.cityCode = '';
        this.dialogPriceFormVisible = true;
        this.title = '新增';
        this.$nextTick(() => {
          this.$refs.priceForm.resetFields();
          console.log(this.priceForm);
        })
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
        const res = await storeGoodsPriceList(this.queryParam);
        if (res.success == 1) {
          this.tableData = res.data.list;
          this.totalPageNum = res.data.total;
        }
      },
      // 删除
      deleteStoreGoodsPrice(row) {
        this.$confirm("是否确定删除？", "删除", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }).then(() => {
          deleteStoreGoodsPrice({
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
      pointChange(val) {
        if (val) {
          this.priceForm.givePoint = 1;
        } else {
          this.priceForm.givePoint = 0;
        }
      },
      editStoreGoodsPrice(row) {
        this.resetForm();
        this.dialogPriceFormVisible = true;
        getStoreGoodsPriceById(row.id).then((res) => {
          if (res.success === 1) {
            this.priceForm.id = res.data.id;
            this.priceForm.cityCode = res.data.cityCode;
            this.priceForm.cityCodeList = res.data.cityCode ? res.data.cityCode.split(',') : [];
            this.priceForm.packageNum = res.data.packageNum;
            this.priceForm.givePoint = res.data.givePoint;
            this.priceForm.isGive = res.data.givePoint ? 1 : 0;
            // this.priceForm.marketPrice = res.data.marketPrice;
            this.priceForm.purchasePrice = res.data.purchasePrice;
            this.title = '编辑';
          }
        }).catch((err) => {
          this.$message.error(err.msg);
        });
      },
      handleSubmit() {
        this.$refs.priceForm.validate((valid) => {
          if (valid) {
            this.priceForm.cityCode = this.priceForm.cityCodeList.join(',')
            if (this.priceForm.id) {
              storeGoodsPriceUpdate(this.priceForm).then((res) => {
                if (res.success === 1) {
                  this.$message.success(res.msg);
                  this.dialogPriceFormVisible = false;
                  this.getTableData();
                }
              }).catch((err) => {
                this.$message.error(err.msg);
              });
            } else {
              storeGoodsPriceInsert(this.priceForm).then((res) => {
                if (res.success === 1) {
                  this.$message.success(res.msg);
                  this.dialogPriceFormVisible = false;
                  this.getTableData();
                }
              }).catch((err) => {
                this.$message.error(err.msg);
              });
            }
          }
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
