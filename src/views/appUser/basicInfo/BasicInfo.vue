<template>
  <div>
    <el-container>
      <el-main>
        <el-form :inline="true" class="demo-form-inline">
          <el-form-item>
            <el-row :gutter="60">
              <el-col :span="4">
                <el-input v-model="queryParam.phone" placeholder="搜索手机号码" @input="searchDebounce" />
              </el-col>
              <el-col :span="7">
                <el-date-picker v-model="registerTimeRange" type="daterange" align="right" unlink-panels
                  range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions"
                  value-format="yyyy-MM-dd HH:mm:ss" @change="selectRegisterTime" />
              </el-col>
              <el-col :span="4">
                <el-select v-model="userTypeValue" multiple placeholder="筛选用户类型" @change="userTypeChange">
                  <el-option v-for="item in userTypeList" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-col>
              <el-col :span="4">
                <!-- :props="{ checkStrictly: true }" clearable -->
                <el-cascader :options="treeList" @change="treeChange" :props="{ checkStrictly: true }" clearable
                  placeholder="筛选位置">
                </el-cascader>
              </el-col>
              <el-col :span="4">
                <!-- multiple -->
                <el-select v-model="bindingValue" placeholder="是否绑定合伙人" @change="bindingChange" clearable>
                  <el-option v-for="item in bindingList" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-col>
            </el-row>
          </el-form-item>
        </el-form>
        <el-table v-loading="listTableLoading" :data="tableData" border style="width: 100%">
          <el-table-column prop="phone" label="登录手机号" width="180" />
          <el-table-column prop="name" label="昵称" width="180" />
          <el-table-column prop="nickname" label="微信" width="180" />
          <el-table-column prop="address" label="位置" width="180" />
          <!-- <template slot-scope="scope">
              <span v-for="item in scope.row.provincesCode" :key="item">{{ CodeToText[item] }}</span>
            </template> -->
          <!-- </el-table-column> -->
          <el-table-column prop="status" label="用户类型" width="180">
            <template slot-scope="scope">
              <span>{{ keymap.getValue('USER_TYPE', scope.row.type) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="isBindEmployee" label="是否绑定合伙人" width="180">
            <template slot-scope="scope">
              <span>{{ keymap.getValue('BIND_EMPLOYEE', scope.row.type) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="注册时间" prop="createTime" />
          <el-table-column prop="status" label="状态" width="180">
            <template slot-scope="scope">
              <span>{{ keymap.getValue('USER_STATUS', scope.row.status) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" v-has-permission="'appUser:update'"
                @click="editLocation(scope.row)">编辑</el-button>
              <el-button type="primary" v-if="scope.row.isBindEmployee" size="mini"
                v-has-permission="'appUser:employeeList'" @click="goPartner(scope.row)">
                合伙人</el-button>
            </template>
          </el-table-column>
        </el-table>
        <br>
        <el-pagination :current-page="pagination.pageNum" :page-sizes="PAGE_SIZE_ARR" :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper" :total="totalPageNum" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </el-main>
    </el-container>
    <BasicInfoSelectArea ref="selectAreaDialog" @confirmSelectArea="emitConfirmSelectArea" />
  </div>
</template>

<script>
  import {
    CodeToText
  } from 'element-china-area-data'
  import BasicInfoSelectArea from './BasicInfoSelectArea'
  import {
    getAppUserList,
    updateAppUser,
    getFindTree
  } from '@/api/user';
  import {
    debounce,
    deepClone
  } from '@/utils/index'
  import {
    SEARCH_DEBOUNCE_TIME,
    PAGE_SIZE_ARR
  } from '@/utils/constant'
  import keymap from '@/utils/keymap';
  export default {
    name: 'BasicInfo',
    components: {
      BasicInfoSelectArea
    },
    data() {
      return {
        CodeToText,
        keymap,
        listTableLoading: false,
        queryParam: {},
        pagination: {
          pageNum: 1,
          pageSize: 10
        },
        totalPageNum: 0,
        tableData: [],
        searchDebounce: null,
        pickerOptions: {
          shortcuts: [{
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }]
        },
        registerTimeRange: '',
        PAGE_SIZE_ARR,
        userTypeValue: '',
        userTypeList: [{
            value: '0',
            label: '普通用户'
          },
          {
            value: '1',
            label: '医疗机构'
          },
          {
            value: '2',
            label: '游客'
          }
        ],
        treeList: [],
        bindingValue: '',
        bindingList: [{
          value: '1',
          label: '是'
        }, {
          value: '0',
          label: '否'
        }]
      }
    },
    created() {
      this.getList();
      this.findTree()
      this.searchDebounce = debounce(this.handleConditionQuery, SEARCH_DEBOUNCE_TIME, false)
    },
    methods: {
      handleCurrentChange(newPage) {
        this.pagination.pageNum = newPage
        this.getList()
      },
      handleSizeChange(newSize) {
        this.pagination.pageSize = newSize
        this.getList()
      },
      selectRegisterTime() {
        this.queryParam.beginDate = this.registerTimeRange && this.registerTimeRange[0]
        this.queryParam.endDate = this.registerTimeRange && this.registerTimeRange[1]
        this.handleConditionQuery()
      },
      async emitConfirmSelectArea({
        selectedOptions,
        id,
        status
      }) {
        const area = selectedOptions[selectedOptions.length - 1]
        const postData = {
          id,
          cityCode: area,
          status
        }
        await updateAppUser(postData)
        this.getList()
      },
      updateAppUser(val) {
        return new Promise(async resolve => {
          await updateAppUser(val)
          resolve()
        })
      },
      handleConditionQuery() {
        this.initPageParam()
        this.getList()
      },
      editLocation(row) {
        const targetData = this.$refs.selectAreaDialog
        targetData.dialogVisible = true
        targetData.userInfo = deepClone(row)
        targetData.form.selectedOptions = row.provincesCode
        targetData.form.status = row.status
      },
      reload() {
        this.initPageParam()
        this.queryParam = {}
        this.getList()
      },
      initPageParam() {
        this.pagination = {
          pageNum: 1,
          pageSize: 10
        }
      },

      findTree() {
        getFindTree().then(res => {
          var treeList = res.data.tree
          var option = this.eachReplaceKey(treeList)
          console.log(option)
          this.treeList = option
        })
      },

      eachReplaceKey(city) {
        let item = [];
        city.map(list => {
          let newData = {};
          newData.label = list.name;
          newData.value = list.code;
          if (list.cityTrees) {
            newData.children = this.eachReplaceKey(list.cityTrees)
          }
          item.push(newData);
        })
        return item;
      },
      getList() {
        this.listTableLoading = true
        Object.assign(this.queryParam, this.pagination)
        getAppUserList(this.queryParam).then(res => {
          var targetData = res.data.list
          this.tableData = targetData
          this.totalPageNum = res.data.total
        }).finally(() => {
          this.listTableLoading = false
        })
      },
      goPartner(id) {
        this.$router.push({
          path: '/appUser/basicInfo/basicInfoPartner',
          query: {
            id: id
          }
        });
      },
      treeChange(value) {
        this.queryParam.province = value[0]
        this.queryParam.city = value[1]
        this.queryParam.county = value[2]
        this.getList()
      },
      bindingChange(value) {
        this.queryParam.isBindEmployee = value
        this.getList()
      },
      userTypeChange(value) {
        this.queryParam.typeList = value
        this.getList()
      }
    }
  }
</script>

<style scoped>
  .demo-form-inline {
    padding-top: 20px;
  }
</style>
