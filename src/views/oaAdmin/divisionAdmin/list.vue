<template>
  <div class="member-admin">
    <el-container>
      <el-main>
        <div class="operate-part">
          <div>
            <el-input v-model="queryParam.deptName" placeholder="搜索事业部名称/负责人" @input="searchDebounce" />
            <!-- <el-input v-model="queryParam.employeeName" placeholder="搜索负责人名称" @input="searchDebounce" /> -->
          </div>
          <el-button type="primary" @click="add" v-has-permission="'oaDepartment:insert'">新增事业部</el-button>
        </div>
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column prop="deptName" label="事业部名称" />
          <el-table-column prop="employeeName" label="负责人" />
          <el-table-column label="状态">
            <template slot-scope="scope">
              <span>{{ keymap.getValue('DEPARTMENT_STATUS', scope.row.status) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="updater" label="更新人" />
          <el-table-column prop="updateTime" label="更新时间" />
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="regManage(scope.row)" v-has-permission="'oaDepartment:update'">
                区域管理</el-button>
              <el-button type="primary" size="mini" @click="edit(scope.row)" v-has-permission="'oaDepartment:update'">编辑
              </el-button>
              <el-button type="primary" size="mini" @click="del(scope.row)" v-has-permission="'oaDepartment:delete'">删除
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
    <el-dialog :title="form.id ? '编辑事业部' : '新增事业部'" :visible.sync="dialogVisible">
      <el-form :model="form" ref="form" :rules="rules" label-width="100px">
        <el-form-item label="事业部名称" required prop="deptName">
          <el-input v-model="form.deptName" clearable maxlength="10"></el-input>
        </el-form-item>
        <el-form-item label="负责人" required prop="employeeId">
          <el-select v-model="form.employeeId" filterable>
            <el-option v-for="item in userList" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
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
    oaDepartmentList,
    oaDepartmentDelete,
    oaDepartmentUpdate,
    oaDepartmentInsert,
    getListByRole
  } from '@/api/oaAdmin'
  import keymap from '@/utils/keymap'
  export default {
    name: 'Department',
    data() {
      return {
        PAGE_SIZE_ARR,
        keymap,
        queryParam: {
          deptName: '',
          employeeName: ''
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
        form: {
          id: '',
          deptName: '',
          employeeId: '',
        },
        rules: {
          deptName: [{
            required: true,
            message: '请输入事业部',
            trigger: 'blur'
          }],
          employeeId: [{
            required: true,
            message: '请选择角色',
            trigger: 'change'
          }, ],
        },
      }
    },
    created() {
      this.getTableData()
      this.getUserList();
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
      edit(row) {
        this.$router.push({
          path: '/oaAdmin/divisionAdmin/edit',
          query: {
            id: row.id,
          },
        });
      },
      regManage(row) {
        console.log(row)
        this.$router.push({
          path: '/oaAdmin/divisionAdmin/regManage',
          query: {
            id: row.id,
          },
        });
      },
      del(row) {
        this.$confirm("是否确定删除？", "删除", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }).then(() => {
          oaDepartmentDelete({
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
              oaDepartmentUpdate(this.form).then((res) => {
                if (res.success === 1) {
                  this.$message.success(res.msg);
                  this.dialogVisible = false;
                  this.getTableData();
                }
              });
            } else {
              oaDepartmentInsert(this.form).then((res) => {
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
        const res = await oaDepartmentList(this.queryParam)
        this.tableData = res.data.list
        this.totalPageNum = res.data.total
      },
      getUserList() {
        getListByRole({
          roleId: 1,
        }).then((res) => {
          if (res.success === 1) {
            this.userList = res.data;
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
