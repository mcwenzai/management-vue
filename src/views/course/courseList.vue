<template>
  <div class="theme">
    <el-container>
      <el-main>
        <div class="operate-part">
          <div>
            <el-input v-model="queryParam.courseName" placeholder="搜索课程名称" @input="searchDebounce" />
          </div>
          <div>
            <el-button type="primary" @click="goBack()">返回</el-button>
            <el-button type="primary" @click="add(queryParam.specialId)" v-has-permission="'specialCourse:insert'">添加课程
            </el-button>
          </div>
        </div>
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column prop="courseName" label="课程名称" />
          <el-table-column prop="courseCover" label="课程封面" />
          <el-table-column prop="sort" label="排序" />
          <el-table-column prop="price" label="展示价格" :formatter="rounding" />
          <el-table-column label="状态">
            <template slot-scope="scope">
              <span v-if="scope.row.status == 0">下架</span>
              <span v-if="scope.row.status == 1">上架</span>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="edit(scope.row)" v-has-permission="'specialCourse:update'">
                编辑
              </el-button>
              <el-button type="primary" size="mini" @click="del(scope.row)" v-has-permission="'specialCourse:delete'">删除
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
    <el-dialog :title="form.id ? '编辑课程' : '新增课程'" :visible.sync="dialogVisible">
      <el-form :model="form" ref="form" :rules="rules" label-width="100px">
        <el-form-item label="课程名称" required prop="courseName">
          <el-input v-model="form.courseName" clearable maxlength="10"></el-input>
        </el-form-item>
        <el-form-item label="老师" required prop="employeeId">
          <el-select v-model="form.employeeId" filterable>
            <el-option v-for="item in userList" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="formValidation">提 交</el-button>
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
          courseName: '',
          specialId: ''
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
          courseName: '',
          employeeId: '',
        },
        rules: {
          courseName: [{
            required: true,
            message: '请输入课程名称',
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
      var id = this.$route.query.id
      this.queryParam.specialId = id
      this.getTableData(id)
      this.searchDebounce = debounce(this.handleConditionQuery, SEARCH_DEBOUNCE_TIME, false)
    },
    methods: {
      add(id) {
        this.$router.push({
          path: '/course/courseAdd',
          query: {
            id: id,
          },
        });
      },
      edit(row) {
        this.$router.push({
          path: '/course/courseEdit',
          query: {
            id: row.id
          },
        });
      },
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

      goBack() {
        this.$router.push({
          path: '/course/themeList'
        });
      },
      rounding(row, column) {
        return parseFloat(row[column.property]).toFixed(2)
      },

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
