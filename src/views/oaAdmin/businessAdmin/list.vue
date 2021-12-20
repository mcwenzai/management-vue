<template>
  <div class="member-admin">
    <el-container>
      <el-main>
        <div class="operate-part">
          <div>
            <el-input v-model="queryParam.businessName" placeholder="搜索业务线名称" @input="searchDebounce" />
            <el-input v-model="queryParam.storeName" placeholder="搜索事业部名称" @input="searchDebounce" />
            <el-input v-model="queryParam.deptName" placeholder="搜索店铺" @input="searchDebounce" />
          </div>
          <el-button type="primary" @click="add" v-has-permission="'oaBusiness:insert'">新增业务线</el-button>
        </div>
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column prop="businessName" label="业务线" />
          <el-table-column prop="deptName" label="事业部" />
          <el-table-column prop="storeName" label="店铺" />
          <el-table-column label="状态">
            <template slot-scope="scope">
              <span>{{ keymap.getValue('DEPARTMENT_STATUS', scope.row.status) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template slot-scope="scope">
              <!-- <el-button type="primary" size="mini" @click="statusUpdate(scope.row)">
                {{scope.row.status === 0 ? '启用' : '停用'}}
              </el-button> -->
              <el-button type="primary" size="mini" @click="edit(scope.row)" v-has-permission="'oaBusiness:update'">编辑
              </el-button>
              <el-button type="primary" size="mini" @click="del(scope.row)" v-has-permission="'oaBusiness:delete'">删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <br>
        <el-pagination :current-page="pagination.pageNum" :page-sizes="PAGE_SIZE_ARR" :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper" :total="totalPageNum" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </el-main>
    </el-container>
    <el-dialog :title="form.id ? '编辑业务线' : '新增业务线'" :visible.sync="dialogVisible">
      <el-form :model="form" ref="form" :rules="rules" label-width="100px">
        <el-form-item label="业务线名称" required prop="businessName">
          <el-input v-model="form.businessName" clearable maxlength="10"></el-input>
        </el-form-item>
        <el-form-item label="事业部" required prop="deptId">
          <el-select v-model="form.deptId" placeholder="请选择事业部" filterable>
            <el-option v-for="item in departmentList" :key="item.id" :label="item.deptName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="店铺" required prop="storeId">
          <el-select v-model="form.storeId" placeholder="请选择店铺" filterable>
            <el-option v-for="item in storeList" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" required prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">停用</el-radio>
            <el-radio :label="0">启用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submit">提 交</el-button>
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
    PAGE_SIZE_ARR
  } from '@/utils/constant'
  import {
    oaBusinessList,
    oaBusinessDelete,
    oaBusinessUpdate,
    oaBusinessInsert,
    getStoreList,
    oaDepartmentList
  } from '@/api/oaAdmin'
  import keymap from '@/utils/keymap'
  export default {
    name: 'business',
    data() {
      return {
        PAGE_SIZE_ARR,
        keymap,
        queryParam: {
          businessName: '',
          storeName: '',
          deptName: ''
        },
        searchDebounce: null,
        pagination: {
          pageNum: 1,
          pageSize: 10
        },
        totalPageNum: 0,
        tableData: [],
        storeList: [],
        departmentList: [],
        dialogVisible: false,
        form: {
          id: '',
          businessName: '',
          deptId: '',
          storeId: '',
          status: 1,
        },
        rules: {
          businessName: [{
            required: true,
            message: '请输入业务线名称',
            trigger: 'blur'
          }],
          deptId: [{
            required: true,
            message: '请选择事业部',
            trigger: 'change'
          }],
          storeId: [{
            required: true,
            message: '请选择店铺',
            trigger: 'change'
          }, ],
        },
      }
    },
    created() {
      this.getTableData();
      this.getStoreList();
      this.getDepartmentList();
      this.searchDebounce = debounce(this.handleConditionQuery, SEARCH_DEBOUNCE_TIME, false)
    },
    methods: {
      add() {
        this.form.id = '';
        this.dialogVisible = true;
        this.$nextTick(() => {
          this.$refs.form.resetFields();
        });
      },
      statusUpdate(row) {
        if (row.status === 0) {
          this.$confirm("是否确定启用？", "删除", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }).then(() => {
            oaBusinessUpdate({
              id: row.id,
              status: 1
            }).then((res) => {
              if (res.success === 1) {
                this.$message.success(res.msg);
                this.getTableData();
              }
            });
          });
        } else {
          this.$confirm("是否确定停用？", "删除", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }).then(() => {
            oaBusinessUpdate({
              id: row.id,
              status: 0
            }).then((res) => {
              if (res.success === 1) {
                this.$message.success(res.msg);
                this.getTableData();
              }
            });
          });
        }
      },
      // 解决表单重置不生效问题
      resetForm() {
        this.form.id = '';
        this.form.businessName = '';
        this.form.deptId = '';
        this.form.storeId = '';
        this.form.status = 1;
      },
      edit(row) {
        this.resetForm();
        this.dialogVisible = true;
        this.getStoreList().then((res) => {
          this.storeList.push({
            name: row.storeName,
            id: row.storeId,
          });
          this.form.id = row.id;
          this.form.businessName = row.businessName;
          this.form.deptId = row.deptId;
          this.form.storeId = row.storeId;
          this.form.status = row.status;
        });
      },
      del(row) {
        this.$confirm("是否确定删除？", "删除", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }).then(() => {
          oaBusinessDelete({
            id: row.id,
          }).then((res) => {
            if (res.success === 1) {
              this.$message.success(res.msg);
              this.getTableData();
            }
          });
        });
      },
      submit() {
        this.$refs.form.validate((valid) => {
          if (valid) {
            if (this.form.id) {
              oaBusinessUpdate(this.form).then((res) => {
                if (res.success === 1) {
                  this.$message.success(res.msg);
                  this.dialogVisible = false;
                  this.getTableData();
                }
              });
            } else {
              oaBusinessInsert(this.form).then((res) => {
                if (res.success === 1) {
                  this.$message.success(res.msg);
                  this.dialogVisible = false;
                  this.getTableData();
                }
              });
            }
          }
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
        const res = await oaBusinessList(this.queryParam)
        this.tableData = res.data.list
        this.totalPageNum = res.data.total
      },
      getStoreList() {
        return new Promise((resolve, reject) => {
          getStoreList().then((res) => {
            if (res.success === 1) {
              this.storeList = res.data;
              resolve();
            }
          });
        });
      },
      getDepartmentList() {
        oaDepartmentList().then((res) => {
          if (res.success === 1) {
            this.departmentList = res.data.list;
          }
        });
      },
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
