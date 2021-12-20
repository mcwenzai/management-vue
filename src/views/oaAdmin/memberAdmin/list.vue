<template>
  <div class="member-admin">
    <el-container>
      <el-main>
        <div class="operate-part">
          <div>
            <el-input v-model="queryParam.name" placeholder="搜索姓名" @input="searchDebounce" />
            <el-input v-model="queryParam.phone" placeholder="搜索手机号" @input="searchDebounce" />
            <el-select v-model="queryParam.roleIdList" multiple filterable placeholder="筛选角色" @change="searchDebounce">
              <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id">
              </el-option>
            </el-select>
          </div>
          <el-button type="primary" @click="add" v-has-permission="'oaEmployee:insert'">新增成员</el-button>
        </div>
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column prop="name" label="姓名" />
          <el-table-column prop="phone" label="手机号" />
          <el-table-column label="角色">
            <template slot-scope="scope">
              <!-- <span>{{ keymap.getValue('USER_TYPE', scope.row.roleId) }}</span> -->
              <span>{{ scope.row.oaEmployeeRoleList && scope.row.oaEmployeeRoleList.map(item => item.roleName).join(',') }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态">
            <template slot-scope="scope">
              <span>{{ keymap.getValue('WORK_STATUS', scope.row.status) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" />
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="edit(scope.row)" v-has-permission="'oaEmployee:update'">编辑
              </el-button>
              <el-button type="primary" size="mini" @click="del(scope.row)" v-has-permission="'oaEmployee:delete'">删除
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
    <el-dialog :title="form.id ? '编辑成员' : '新增成员'" :visible.sync="dialogVisible">
      <el-form :model="form" ref="form" :rules="rules" label-width="100px">
        <el-form-item label="姓名" required prop="name">
          <el-input type="text" v-model="form.name" clearable maxlength="10"></el-input>
        </el-form-item>
        <el-form-item label="手机号" required prop="phone">
          <el-input type="tel" v-model="form.phone" clearable maxlength="11"></el-input>
        </el-form-item>
        <el-form-item label="特殊权限" required prop="specialPower">
          <el-radio-group v-model="form.specialPower" :disabled="Boolean(form.id)">
            <el-radio :label="0" @change="falseSale">无</el-radio>
            <el-radio :label="1" @change="selectSale">超级合伙人</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="角色" v-if="form.specialPower == 1">
          <el-select v-model="saleList" disabled multiple filterable>
            <el-option v-for="item in saleList" :key="item.id" :label="item.roleName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="角色" required v-else>
          <el-select v-model="roleList" multiple filterable placeholder="请选择">
            <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="状态" required prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="0">在职</el-radio>
            <el-radio :label="1">停职</el-radio>
            <el-radio :label="2">离职</el-radio>
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
    getOAMembers,
    getOARoles,
    oaUserDelete,
    oaUserUpdate,
    oaUserInsert
  } from '@/api/oaAdmin'
  import keymap from '@/utils/keymap'
  export default {
    name: 'MemberAdmin',
    data() {
      const checkPhone = (rule, value, callback) => {
        if (!/^1\d{10}$/.test(value)) {
          callback(new Error('请输入正确的手机号'));
        } else {
          callback();
        }
      };
      return {
        PAGE_SIZE_ARR,
        keymap,
        queryParam: {
          name: '',
          phone: '',
          roleIdList: []
        },
        searchDebounce: null,
        pagination: {
          pageNum: 1,
          pageSize: 10
        },
        totalPageNum: 0,
        tableData: [],
        rolesList: [],
        dialogVisible: false,
        form: {
          id: '',
          name: '',
          phone: '',
          specialPower: 0,
          oaEmployeeRoleList: [],
          status: 0,
        },
        rules: {
          name: [{
            required: true,
            message: '请输入姓名',
            trigger: 'blur'
          }],
          phone: [{
            required: true,
            validator: checkPhone,
            trigger: 'blur'
          }, ],
          roleList: [{
            required: true,
            message: '请选择角色',
            trigger: 'change'
          }, ],
        },
        saleValue: [],
        roleList: [],
        saleList: [],
        selectIndex: 0
      }
    },
    created() {
      this.loadOARoles()
      this.getTableData()
      this.searchDebounce = debounce(this.handleConditionQuery, SEARCH_DEBOUNCE_TIME, false)
    },
    methods: {
      resetForm() {
        this.form.id = '';
        this.form.name = '';
        this.form.phone = '';
        this.saleValue = []
        this.form.oaEmployeeRoleList = [];
        this.roleList = [];
        this.saleList = [];
        this.form.status = 0;
      },
      add() {
        this.resetForm();
        this.dialogVisible = true;
        this.$nextTick(() => {
          this.$refs.form.resetFields();
        });
      },
      edit(row) {
        console.log(row.oaEmployeeRoleList)
        this.dialogVisible = true;
        this.resetForm();
        this.$nextTick(() => {
          this.form.id = row.id;
          this.form.name = row.name;
          this.form.phone = row.phone;
          this.form.specialPower = row.specialPower
          this.form.oaEmployeeRoleList = [];
          this.roleList = row.oaEmployeeRoleList ? row.oaEmployeeRoleList.map(item => item.roleId) : [];
          this.saleList = row.oaEmployeeRoleList ? row.oaEmployeeRoleList.map(item => item.roleId) : [];
          this.form.status = row.status;
        });
      },
      del(row) {
        if (row.status !== 2) {
          this.$message.warning('该成员目前未离职，不可被删除');
          return;
        }
        this.$confirm("是否确定删除？", "删除", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }).then(() => {
          oaUserDelete({
            id: row.id,
          }).then((res) => {
            if (res.success === 1) {
              this.$message.success(res.msg);
              this.getTableData();
            }
          });
        });
      },
      selectSale(e) {
        var indexLabel = [{
          id: "6",
          roleName: "合伙人"
        }]
        this.saleValue = indexLabel
        this.saleList = indexLabel
        this.selectIndex = e
      },
      falseSale(e) {
        this.saleValue = []
        this.saleList = ['6']
        this.selectIndex = e
      },
      submit() {
        this.$refs.form.validate((valid) => {
          if (valid) {
            if (this.selectIndex == 0) {
              this.roleList.forEach((id) => {
                this.form.oaEmployeeRoleList.push({
                  roleId: id,
                });
              });
            } else if (this.selectIndex == 1) {
              if (this.saleList.length) {
                this.form.oaEmployeeRoleList.push({
                  roleId: this.saleList[0].id
                })
              }
            }
            if (this.form.id) {
              oaUserUpdate(this.form).then((res) => {
                if (res.success === 1) {
                  this.$message.success(res.msg);
                  this.dialogVisible = false;
                  this.getTableData();
                }
              });
            } else {
              oaUserInsert(this.form).then((res) => {
                if (res.success === 1) {
                  this.$message.success(res.msg);
                  this.dialogVisible = false;
                  location.reload()
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
        const res = await getOAMembers(this.queryParam)
        this.tableData = res.data.list
        this.totalPageNum = res.data.total
      },
      async loadOARoles() {
        const res = await getOARoles()
        this.rolesList = res.data;
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
