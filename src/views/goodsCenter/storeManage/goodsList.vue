<template>
  <div class="store-manage">
    <el-container>
      <el-main>
        <div class="operate-part">
          <div>
            <el-input v-model="queryParam.goodsName" placeholder="搜索商品" @input="searchDebounce" />
            <el-input v-model="queryParam.no" placeholder="搜索店铺商品编码" @input="searchDebounce" />
          </div>
          <div>
            <el-button @click="$router.back()">返回</el-button>
            <el-button type="primary" @click="addGoods" v-has-permission="'storeGoods:insert'">添加商品
            </el-button>
          </div>
        </div>

        <el-table :data="tableData" border style="width: 100%" row-key="id" :span-method="objectSpanMethod"
          :tree-props="{children: 'storeGoodsSkuDTOList', hasChildren: 'hasChildren'}">
          <el-table-column prop="goodsName" label="商品">
          </el-table-column>
          <el-table-column prop="skuName" label="SKU" />
          <el-table-column prop="no" label="商品编码" />
          <el-table-column prop="stockAmount" label="库存" />
          <el-table-column prop="status" label="是否上架">
            <template slot-scope="{ row }">
              <el-switch v-model="row.status" active-color="#5FC971" inactive-color="#DDDFE5" :active-value="1"
                :inactive-value="0" @change="handleChangeStatus(row)">
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="添加时间" />
          <el-table-column label="操作" width="200">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="editStoreGoodsSku(scope.row)">编辑</el-button>
              <el-button type="primary" size="mini" v-has-permission="'storeGoodsSku:list'"
                @click="skuManage(scope.row)">
                管理</el-button>
              <el-button type="primary" size="mini" v-has-permission="'storeGoods:delete'"
                @click="deleteStoreGoodsSku(scope.row)">删除</el-button>
            </template>
          </el-table-column>
          <!-- </template> -->
        </el-table>
        <br />
        <el-pagination :current-page="pagination.pageNum" :page-sizes="PAGE_SIZE_ARR" :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper" :total="totalPageNum" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </el-main>
    </el-container>
    <el-dialog title="添加商品" :visible.sync="dialogGoodsFormAdd">
      <el-form :model="goodsForm" label-width="100px">
        <el-form-item label="类型" required>
          <el-radio-group v-model="goodsForm.type" @change="handleChangeType">
            <el-radio :label="type.value" v-for="(type, index) in GOODS_TYPE" :key="index">
              {{type.label}}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="商品" required>
          <el-select v-model="goodsForm.goodsId" style="width: 100%" @change="selectGoods">
            <el-option v-for="item in goodsList" :key="item.id" :label="item.goodsName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="SKU" required>
          <el-select v-model="goodsForm.goodsSku" multiple placeholder="请选择" @change="selectGoodsSku">
            <el-option v-for="item in goodsSkuList" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogGoodsFormAdd = false">取 消</el-button>
        <el-button type="primary" @click="handleAddGoods">提 交</el-button>
      </div>
    </el-dialog>

    <el-dialog title="编辑" :visible.sync="dialogSkuVisible">
      <el-form :model="goodsForm" label-width="100px">
        <el-form-item label="SKU" required>
          <el-select v-model="skuForm.skuName" disabled placeholder="请选择">
            <!-- <el-option v-for="item in goodsList" :key="item.value" :label="item.label" :value="item.value">
            </el-option> -->
          </el-select>
        </el-form-item>
        <el-form-item label="店铺商品编码" required>
          <el-input v-model="skuForm.no" clearable maxlength="50" placeholder="请输入店铺商品编码"></el-input>
        </el-form-item>
        <el-form-item label="库存" required>
          <el-input-number v-model="skuForm.stockAmount" :min="0" :step="1" :max="99999">
          </el-input-number>
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
    debounce
  } from "@/utils/index";
  import {
    storeGoodsList,
    deleteStoreGoodsSku,
    storeGoodsUpdate,
    getOpenGoodsList,
    storeGoodsInsert,
    storeGoodsSkuUpdate
  } from '@/api/goodsCenter';
  import {
    getSkuByGoodsId
  } from '@/api/goods'
  import {
    GOODS_EDIT_STATUS,
    SEARCH_DEBOUNCE_TIME,
    PAGE_SIZE_ARR,
    GOODS_TYPE,
  } from "@/utils/constant";


  export default {
    name: "storeManage",
    props: [],
    data() {
      return {
        storeName: '',
        GOODS_EDIT_STATUS,
        GOODS_TYPE,
        totalPageNum: 0,
        tableData: [],
        PAGE_SIZE_ARR,
        queryParam: {
          goodsName: '',
          storeId: '',
          no: ''
        },
        goodsSkuList: [],
        searchDebounce: null,
        pagination: {
          pageNum: 1,
          pageSize: 10,
        },
        dialogGoodsFormAdd: false,
        dialogSkuVisible: false,
        goodsForm: {
          type: GOODS_TYPE[0].value,
          goodsId: '',
          goodsSku: []
        },
        skuForm: {
          id: '',
          no: '',
          stockAmount: '',
          skuName: ''
        },
        goodsList: [],
        stockNum: 1,
        spanArr: [],
        selectSkuDTOList: [],
        goodsSkuDTOList: [],
        pos: 0
      };
    },

    created() {
      this.queryParam.storeId = this.$route.query.storeId;
      this.storeName = this.$route.query.storeName;
      this.getTableData();
      this.searchDebounce = debounce(
        this.handleConditionQuery,
        SEARCH_DEBOUNCE_TIME,
        false
      );
    },

    methods: {
      addGoods() {
        this.goodsForm.goodsId = ''
        this.goodsForm.goodsSku = []
        Object.assign(this.$data.goodsForm, this.$options.data().goodsForm)
        console.log(this.goodsForm)
        this.getGoodsList();
        this.dialogGoodsFormAdd = true;
      },
      handleChangeType() {
        this.goodsForm.goodsId = '';
        this.getGoodsList();
      },
      skuManage(row) {
        console.log(row)
        this.$router.push(
          `/goodsCenter/storeManage/skuManage?storeGoodsSkuId=${row.skuId}&skuName=${row.skuName}&goodsId=${row.goodsId}&goodsName=${row.goodsName}&storeGoodsId=${row.storeGoodsId}&storeId=${this.queryParam.storeId}&storeName=${this.storeName}`
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
        const res = await storeGoodsList(this.queryParam);
        if (res.success == 1) {
          var skuList = []
          var arr = res.data.list
          arr.forEach((e) => {
            e.storeGoodsSkuDTOList.forEach((el) => {
              el['goodsName'] = e.goodsName
              el['goodsId'] = e.goodsId
              skuList.push(el);
            });
          });
          console.log(skuList)
          this.tableData = skuList;
          this.totalPageNum = res.data.total;
          this.getSpanArr(skuList)
        }
      },

      editStoreGoodsSku(row) {
        this.skuForm.stockAmount = row.stockAmount;
        this.skuForm.no = row.no;
        this.skuForm.id = row.id;
        this.skuForm.skuName = row.skuName;
        this.dialogSkuVisible = true;
      },


      handleUpdateSku() {
        storeGoodsSkuUpdate({
          stockAmount: this.skuForm.stockAmount,
          no: this.skuForm.no,
          id: this.skuForm.id,
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

      // 删除
      deleteStoreGoodsSku(row) {
        console.log(row)
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

      getSpanArr(data) {
        console.log(data)
        for (let i = 0; i < data.length; i++) {
          if (i === 0) {
            this.spanArr.push(1);
            this.pos = 0;
          } else {
            if (data[i].goodsId === data[i - 1].goodsId) {
              this.spanArr[this.pos] += 1;
              this.spanArr.push(0);
            } else {
              this.spanArr.push(1);
              this.pos = i;
            }
          }
          console.log(this.spanArr);
        }
      },
      objectSpanMethod({
        row,
        column,
        rowIndex,
        columnIndex
      }) {
        if (columnIndex === 0) {
          const _row = this.spanArr[rowIndex];
          const _col = _row > 0 ? 1 : 0;
          console.log(`rowspan:${_row} colspan:${_col}`);
          return {
            rowspan: _row,
            colspan: _col
          };
        }
      },

      handleChangeStatus(row) {
        if (row.status === 1) {
          storeGoodsUpdate({
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
          storeGoodsUpdate({
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

      getGoodsList() {
        getOpenGoodsList({
          type: this.goodsForm.type
        }).then((res) => {
          if (res.success === 1) {
            this.goodsList = res.data;
          }
        });
      },
      getSkuList() {
        getSkuByGoodsId({
          storeId: this.queryParam.storeId,
          goodsId: this.goodsForm.goodsId
        }).then((res) => {
          if (res.success === 1) {
            this.goodsSkuList = res.data;
          }
        });
      },
      selectGoods(value) {
        this.goodsForm.goodsId = value
        this.getSkuList()
      },
      selectGoodsSku(value) {
        var itemArr = []
        value.map(item => {
          itemArr.push({
            skuId: item
          });
        })
        this.selectSkuDTOList = itemArr
      },
      handleAddGoods() {
        if (this.goodsForm.goodsId == '') {
          this.$message.warning('请选择商品');
          return;
        }
        storeGoodsInsert({
          storeId: this.queryParam.storeId,
          goodsId: this.goodsForm.goodsId,
          storeGoodsSkuDTOList: this.selectSkuDTOList
        }).then((res) => {
          if (res.success === 1) {
            this.goodsForm.goodsId = '';
            this.$message.success(res.msg);
            this.dialogGoodsFormAdd = false;
            this.getTableData();
          }
        }).catch((err) => {
          this.$message.error(err.msg);
        });
      }
    }
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
