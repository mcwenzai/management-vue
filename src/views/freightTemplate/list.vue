<template>
  <div class="member-admin">
    <el-container>
      <el-main>
        <div class="operate-part">
          <div>
            <el-input v-model="queryParam.name" placeholder="搜索模版名称" @input="searchDebounce" />
          </div>
          <el-button type="primary" @click="edit()" v-has-permission="'freightTemplate:insert'">新增模版</el-button>
        </div>
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column prop="name" label="模版名称" />
          <el-table-column prop="status" label="状态">
            <template slot-scope="{ row }">
              {{ GOODS_STATUS2[row.status || 0].label }}
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" />
          <el-table-column prop="updateTime" label="更新时间" />
          <el-table-column prop="updater" label="更新人" />
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="edit(scope.row)"
                v-has-permission="'freightTemplate:update'">编辑</el-button>
              <el-button type="primary" size="mini" @click="del(scope.row)" v-has-permission="'freightTemplate:delete'"
                v-if="scope.row.status === GOODS_STATUS2[1].value">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <br>
        <el-pagination :current-page="pagination.pageNum" :page-sizes="PAGE_SIZE_ARR" :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper" :total="totalPageNum" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </el-main>
    </el-container>
    <el-dialog :title="title" :visible.sync="dialogVisible" width="65%">
      <el-form :model="form" ref="form" :rules="rules" label-width="130px">
        <el-form-item label="模版名称" required prop="name">
          <el-input v-model="form.name" clearable maxlength="10" :disabled="Boolean(form.id)"></el-input>
        </el-form-item>
        <el-form-item label="发货说明" required prop="explains">
          <el-input v-model="form.explains" clearable maxlength="10"></el-input>
        </el-form-item>
        <el-form-item label="邮费设置"></el-form-item>
        <div style="padding-left: 40px" v-for="(item, index) in form.freightTemplateDetailList" :key="index">
          <el-form-item label="选择区域" required :prop="'freightTemplateDetailList.' + index + '.cityCodeList'"
            label-width="160px" :rules="{ required: true, message: '选择区域', trigger: 'change'}">
            <el-select v-model="item.cityCodeList" multiple filterable placeholder="请选择" style="margin-right: 30px; width: 400px">
              <el-option v-for="item in regionData" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
            <el-button icon="el-icon-minus" @click.stop="handleDel(index)" v-if="index > 0"></el-button>
            <el-button icon="el-icon-plus" type="primary" @click.stop="handleAdd"></el-button>
          </el-form-item>
          <el-form-item label="运费" :prop="'freightTemplateDetailList.' + index + '.deliveryFee'" label-width="160px"
            :rules="{ validator: check, required: true, trigger: 'change'}">
            <el-input-number :min="0" :precision="2" v-model="item.deliveryFee"></el-input-number>
          </el-form-item>
          <el-form-item label="包邮条件(满足任一)" label-width="160px">
            <div style="display: flex;">
              <el-form-item :prop="'freightTemplateDetailList.' + index + '.fullStore'" style="margin-right: 30px">
                <el-checkbox :true-label="1" v-model="item.fullStore">满店铺起批包邮</el-checkbox>
              </el-form-item>
              <el-form-item :prop="'freightTemplateDetailList.' + index + '.fullGoods'" style="margin-right: 30px">
                <el-checkbox :true-label="1" v-model="item.fullGoods">满单品起批包邮</el-checkbox>
              </el-form-item>
              <el-form-item :prop="'freightTemplateDetailList.' + index + '.isFullAmount'" style="margin-right: 10px">
                <el-checkbox :true-label="1" v-model="item.isFullAmount">
                  满固定金额包邮
                </el-checkbox>
              </el-form-item>
              <el-form-item :prop="'freightTemplateDetailList.' + index + '.fullAmount'">
                <el-input-number :min="0" :precision="2" v-model="item.fullAmount" @change="fullAmountChange(item)">
                </el-input-number>
              </el-form-item>
            </div>
          </el-form-item>
        </div>
        <el-form-item label="状态" required prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="0">启用</el-radio>
            <el-radio :label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">提 交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {
    debounce
  } from '@/utils/index'
  import {
    SEARCH_DEBOUNCE_TIME,
    PAGE_SIZE_ARR,
    GOODS_STATUS2
  } from '@/utils/constant'
  import {
    freightTemplateList,
    freightTemplateDelete,
    freightTemplateUpdate,
    freightTemplateInsert,
    getFreightTemplateById
  } from '@/api/orderCenter'
  import keymap from '@/utils/keymap'
  import {
    regionData
  } from 'element-china-area-data';
  export default {
    name: '',
    data() {
      const check = (rule, value, callback) => {
        if (value === 0) {
          return callback(new Error('运费不能为0'));
        }
        callback();
      };
      return {
        PAGE_SIZE_ARR,
        GOODS_STATUS2,
        keymap,
        regionData,
        check,
        time: [],
        queryParam: {
          name: '',
        },
        searchDebounce: null,
        pagination: {
          pageNum: 1,
          pageSize: 10
        },
        totalPageNum: 0,
        tableData: [],
        userList: [],
        dialogVisible: false,
        title: '编辑',
        form: {
          id: '',
          name: '',
          explains: '',
          status: null,
          freightTemplateDetailList: [{
            cityCode: '',
            cityCodeList: [],
            deliveryFee: 0,
            fullStore: 0,
            fullGoods: 0,
            isFullAmount: 0,
            fullAmount: '',
          }],
        },
        rules: {
          name: [{
            required: true,
            message: '请输入模版名称',
            trigger: 'blur'
          }],
          explains: [{
            required: true,
            message: '请输入发货说明',
            trigger: 'blur'
          }],
          status: [{
            required: true,
            message: '请选择状态',
            trigger: 'change'
          }],
        },
      }
    },
    created() {
      this.getTableData()
      this.searchDebounce = debounce(this.handleConditionQuery, SEARCH_DEBOUNCE_TIME, false)
    },
    methods: {
      edit(row) {
        if (row) {
          this.resetForm();
          this.title = '编辑模版';
          this.dialogVisible = true;
          getFreightTemplateById(row.id).then((res) => {
            if (res.success === 1) {
              this.form.id = res.data.id;
              this.form.name = res.data.name;
              this.form.explains = res.data.explains;
              this.form.status = res.data.status;
              res.data.freightTemplateDetailList.forEach((item) => {
                item.cityCodeList = item.cityCode.split(',');
                this.fullAmountChange(item);
              })
              this.form.freightTemplateDetailList = res.data.freightTemplateDetailList;
            }
          });
        } else {
          this.title = '新增模版';
          this.form.id = '';
          this.dialogVisible = true;
          this.$nextTick(() => {
            this.$refs.form.resetFields();
            this.form.freightTemplateDetailList.forEach((item) => {
              item.id = '';
              item.templateId = '';
            })
          });
        }
      },
      fullAmountChange(item) {
        if (item.fullAmount > 0) {
          item.isFullAmount = 1;
        } else {
          item.isFullAmount = 0;
        }
      },
      resetForm() {
        this.form.id = '';
        this.form.name = '';
        this.form.explains = '';
        this.form.status = null;
        this.form.freightTemplateDetailList = [{
          cityCode: '',
          cityCodeList: [],
          deliveryFee: 0,
          fullStore: 0,
          fullGoods: 0,
          isFullAmount: 0,
          fullAmount: '',
        }];
      },
      del(row) {
        this.$confirm("是否确定删除？", "删除", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }).then(() => {
          freightTemplateDelete({
            id: row.id,
          }).then((res) => {
            if (res.success === 1) {
              this.$message.success(res.msg);
              this.getTableData();
            } else {
              this.$message.error(res.msg);
            }
          });
        });
      },
      handleCurrentChange(newPage) {
        this.pagination.pageNum = newPage
        this.getTableData()
      },
      handleSizeChange(newSize) {
        this.pagination.pageSize = newSize
        this.getTableData()
      },
      handleConditionQuery() {
        this.initPageParam()
        this.getTableData()
      },
      initPageParam() {
        this.pagination = {
          pageNum: 1,
          pageSize: 10
        }
      },
      async getTableData() {
        Object.assign(this.queryParam, this.pagination)
        const res = await freightTemplateList(this.queryParam)
        this.tableData = res.data.list
        this.totalPageNum = res.data.total
      },
      handleAdd() {
        this.form.freightTemplateDetailList.push({
          cityCode: '',
          cityCodeList: [],
          deliveryFee: 0,
          fullStore: 0,
          fullGoods: 0,
          isFullAmount: 0,
          fullAmount: '',
        });
      },
      handleDel(index) {
        this.form.freightTemplateDetailList.splice(index, 1);
      },
      handleSubmit() {
        this.$refs.form.validate((valid) => {
          if (valid) {
            this.form.freightTemplateDetailList.forEach((item) => {
              item.cityCode = item.cityCodeList.join(',');
            });
            if (this.form.id) {
              freightTemplateUpdate(this.form).then((res) => {
                if (res.success === 1) {
                  this.$message.success(res.msg);
                  this.dialogVisible = false;
                  this.getTableData()
                }
              });
            } else {
              freightTemplateInsert(this.form).then((res) => {
                if (res.success === 1) {
                  this.$message.success(res.msg);
                  this.dialogVisible = false;
                  this.getTableData()
                }
              });
            }
          }
        });
      }
    }
  }
</script>
<style lang='scss' scoped>
  .member-admin {
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
