<template>
  <div class="member-admin">
    <el-container>
      <el-main>
        <div class="operate-part">
          <div>
            <el-select v-model="queryParam.deptId" placeholder="搜索事业部" @change="selectDepart" filterable>
              <el-option v-for="(item,index) in departmentList" :key="index" :label="item.deptName" :value="item.id">
              </el-option>
            </el-select>
            <!-- <el-input clearable v-model="queryParam.areaName" placeholder="搜索区域名称" @input="searchDebounce" /> -->
            <el-cascader :options="treeList" @change="treeChange" :disabled="isDisabled"
              :props="{ checkStrictly: true }" clearable placeholder="筛选区域">
            </el-cascader>
            <el-input clearable v-model="queryParam.oaEmployeeName" placeholder="搜索合伙人姓名" @input="searchDebounce" />
            <el-select v-model="isPartnerValue" placeholder="是否有合伙人" style="width: 140px;" @change="bindingChange">
              <el-option v-for="item in bindingList" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </div>
        </div>
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column prop="deptName" label="事业部"></el-table-column>
          <el-table-column prop="areaName" label="区域"></el-table-column>
          <el-table-column prop="isBindEmployee" label="是否有合伙人">
            <template slot-scope="scope">
              <span>{{ keymap.getValue('BIND_EMPLOYEE', scope.row.isBindEmployee) }}</span>
            </template>
          </el-table-column>
          <!-- isBindEmployee -->
          <el-table-column prop="oaEmployeeNameList" label="合伙人">
            <template slot-scope="scope">
              <span>{{scope.row.oaEmployeeNameList.join(',')}}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="edit(scope.row)" v-has-permission="'oaAreaEmployee:insert'">
                编辑</el-button>
              <!-- <el-button type="primary" size="mini" @click="del(scope.row)">删除</el-button> -->
            </template>
          </el-table-column>
        </el-table>
        <br>
        <el-pagination :current-page="pagination.pageNum" :page-sizes="PAGE_SIZE_ARR" :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper" :total="totalPageNum" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </el-main>
    </el-container>
    <el-dialog :title="form.id ? '编辑合伙人' : '新增合伙人'" :visible.sync="dialogVisible">
      <el-form :model="form" ref="form" :rules="rules" label-width="100px">
        <el-form-item label="事业部">
          <span>{{form.deptName}}</span>
        </el-form-item>
        <el-form-item label="区/县">
          <span>{{form.areaName}}</span>
        </el-form-item>

        <el-form-item label="合伙人" prop="oaEmployeeIdList">
          <el-select v-model="form.oaEmployeeIdList" filterable multiple>
            <el-option v-for="(item,index) in userList" :key="index" :label="item.employeeName"
              :value="item.employeeId">
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
  } from '@/utils/index';
  import {
    SEARCH_DEBOUNCE_TIME,
    PAGE_SIZE_ARR
  } from '@/utils/constant';
  import {
    oaDepartmentList,
    oaSalesmanList,
    oaSalesmanDelete,
    oaSalesmanUpdate,
    oaSalesmanInsert,
    getEmployeeByRole,
    getPubOaTree
  } from '@/api/oaAdmin';
  import {
    regionData
  } from 'element-china-area-data';
  import keymap from '@/utils/keymap';
  export default {
    name: 'salesmanAdmin',
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
        regionData,
        queryParam: {
          deptId: '',
          areaName: '',
          oaEmployeeName: '',
        },
        searchDebounce: null,
        pagination: {
          pageNum: 1,
          pageSize: 10
        },
        totalPageNum: 0,
        tableData: [],
        departmentList: [],
        userList: [],
        dialogVisible: false,
        isPartnerValue: '',
        treeList: [],
        form: {
          id: '',
          deptId: '',
          deptName: '',
          areaId: '',
          areaName: '',
          oaEmployeeIdList: [],
        },
        rules: {
          deptId: [{
            required: true,
            message: '请选择事业部',
            trigger: 'change'
          }],
          areaId: [{
            required: true,
            message: '请选择区县',
            trigger: 'change'
          }, ],
          oaEmployeeIdList: [{
            required: true,
            message: '请选择合伙人',
            trigger: 'change'
          }, ],
        },
        bindingList: [{
          value: '1',
          label: '是'
        }, {
          value: '0',
          label: '否'
        }],
        isDisabled: true
      }
    },
    created() {
      this.getTableData();
      this.getUserList();
      this.getDepartmentList();
      this.searchDebounce = debounce(this.handleConditionQuery, SEARCH_DEBOUNCE_TIME, false)
    },
    methods: {
      // 获取下拉数据
      getDepartmentList() {
        oaDepartmentList({
          pageNum: 1,
          pageSize: 999,
        }).then((res) => {
          this.departmentList = res.data.list;
        });
      },
      selectDepart(e) {
        this.isDisabled = false
        this.getOaAreaTree(e)
      },
      getOaAreaTree(e) {
        const deptId = e
        console.log(deptId)
        if (deptId == 'undefined') {
          this.$message.error('请先选择事业部');
        } else {
          getPubOaTree(deptId).then((res) => {
            console.log(res)
            var treeList = res.data
            var option = this.eachReplaceKey(treeList)
            console.log(option)
            this.treeList = option
          })
        }
      },
      eachReplaceKey(city) {
        let item = [];
        city.map(list => {
          let newData = {};
          newData.label = list.areaName;
          newData.value = list.id;
          if (list.children.length) {
            newData.children = this.eachReplaceKey(list.children)
          }
          item.push(newData);
        })
        return item;
      },
      // 编辑
      edit(row) {
        this.form.id = row.deptId;
        this.form.deptId = row.deptId;
        this.form.deptName = row.deptName;
        this.form.areaId = row.areaId;
        this.form.areaName = row.areaName;
        this.form.oaEmployeeIdList = row.oaEmployeeIdList;
        this.dialogVisible = true;
      },
      del(row) {
        this.$confirm("是否确定删除？", "删除", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }).then(() => {
          oaSalesmanDelete({
            id: row.id,
          }).then((res) => {
            if (res.success === 1) {
              this.$message.success(res.msg);
              this.getTableData();
            }
          });
        });
      },

      treeChange(value) {
        console.log(value)
        this.queryParam.regionId = value[0]
        this.queryParam.provinceId = value[1]
        this.queryParam.cityId = value[2]
        this.queryParam.countyId = value[3]
        this.getTableData()
      },
      bindingChange(value) {
        console.log(value)
        this.queryParam.isBindEmployee = value
        this.getTableData()
      },
      // 提交表单
      submit() {
        this.$refs.form.validate((valid) => {
          if (valid) {
            if (this.form.id) {
              oaSalesmanInsert(this.form).then((res) => {
                if (res.success === 1) {
                  this.$message.success(res.msg);
                  this.dialogVisible = false;
                  this.getTableData();
                }
              });
            } else {
              oaSalesmanInsert(this.form).then((res) => {
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
      // 初始页数
      initPageParam() {
        this.pagination = {
          pageNum: 1,
          pageSize: 10
        }
      },
      async getTableData() {
        Object.assign(this.queryParam, this.pagination)
        const res = await oaSalesmanList(this.queryParam)
        this.tableData = res.data.list
        this.totalPageNum = res.data.total
      },
      getUserList() {
        getEmployeeByRole().then((res) => {
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
