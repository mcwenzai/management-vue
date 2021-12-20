<template>
  <div class="theme">
    <el-container>
      <el-main>
        <div class="operate-part">
          <div>
            <span>超微事业部</span>
            <span>华中大区/浙江省/杭州市/西湖区</span>
            <span>张四</span>
            <span>合伙人</span>
          </div>
          <div>
            <span>2021-11-18～2021-11-28</span>
            <span>{{ keymap.getValue('DEPARTMENT_STATUS', scope.row.status) }}</span>
            <span>¥ 600.00</span>
            <!-- <el-button type="primary" @click="goBack()">返回</el-button> -->

          </div>
        </div>
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column prop="courseName" label="区域" />
          <el-table-column prop="courseCover" label="子订单编号" />
          <el-table-column prop="sort" label="联系人姓名" />
          <el-table-column prop="price" label="机构名称" :formatter="rounding" />
          <el-table-column prop="sort" label="下单时间" />
          <el-table-column prop="sort" label="实收金额" />
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="del(scope.row)" v-has-permission="'specialCourse:delete'">查看
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
    postCourseList,
    deteleCourseById
  } from '@/api/course'
  import keymap from '@/utils/keymap'
  export default {
    name: 'Department',
    data() {
      return {
        PAGE_SIZE_ARR,
        keymap,
        queryParam: {
          specialId: ''
        },
        pagination: {
          pageNum: 1,
          pageSize: 10
        },
        totalPageNum: 0,
        tableData: [],
        userList: [],
        form: {
          id: '',
          courseName: '',
          employeeId: '',
        },
        
      }
    },
    created() {
      var id = this.$route.query.id
      this.queryParam.specialId = id
      this.getTableData(id)
    },
    methods: {


      // 删除课程
      del(row) {
        this.$confirm("是否确定删除？", "删除", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }).then(() => {
          deteleCourseById({
            id: row.id,
          }).then((res) => {
            if (res.success === 1) {
              this.$message.success(res.msg);
              this.getTableData();
            }
          });
        });
      },
      // 返回专题页
      goBack() {
        this.$router.push({
          path: '/course/themeList'
        });
      },
      // 转换浮点型,保留两位小数
      rounding(row, column) {
        return parseFloat(row[column.property]).toFixed(2)
      },
      // 表单提交验证
      formValidation() {
        if (this.form.id == '') {
          return this.$message({
            type: 'error',
            message: 'id为空，无法保存提交'
          })
          return false
        }
        this.submit()
      },
      // 表单提交
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
      // 选择第几页
      handleCurrentChange(newPage) {
        this.pagination.pageNum = newPage
        this.getTableData()
      },
      // 每页请求数
      handleSizeChange(newSize) {
        this.pagination.pageSize = newSize
        this.getTableData()
      },
      // 条件查询
      handleConditionQuery() {
        this.initPageParam()
        this.getTableData()
      },
      // 初始请求第几页以及数量
      initPageParam() {
        this.pagination = {
          pageNum: 1,
          pageSize: 10
        }
      },
      // 列表数据请求
      async getTableData() {
        Object.assign(this.queryParam, this.pagination)
        const res = await postCourseList(this.queryParam)
        this.tableData = res.data.list
        this.totalPageNum = res.data.total
      },

    }
  }
</script>
<style lang='scss' scoped>
  .theme {
    .operate-part {
      display: flex;
      justify-content: space-between;
      padding: 20px 0;

      .el-input {
        width: 220px;
      }
    }
  }
</style>
