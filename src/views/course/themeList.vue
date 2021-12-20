<template>
  <div class="member-admin">
    <el-container>
      <el-main>
        <div class="operate-part">
          <div>
            <el-input v-model="queryParam.specialName" placeholder="搜索专题名称" @input="searchDebounce" />
          </div>
          <el-button type="primary" @click="add()" v-has-permission="'special:insert'">添加专题</el-button>
        </div>
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column prop="specialName" label="专题名称" />
          <el-table-column prop="sort" label="排序" />
          <el-table-column label="状态">
            <template slot-scope="scope">
              <span v-if="scope.row.status == 1">上架</span>
              <span v-if="scope.row.status == 0">下架</span>
            </template>
          </el-table-column>
          <el-table-column prop="courseSum" label="课程数量" />
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="edit(scope.row)" v-has-permission="'special:update'">编辑
              </el-button>
              <el-button type="primary" size="mini" @click="goTheme(scope.row)" v-has-permission="'specialCourse:list'">
                课程列表</el-button>
              <el-button type="primary" size="mini" @click="del(scope.row)" v-has-permission="'special:delete'">删除
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
    <el-dialog :title="form.id ? '编辑专题' : '新增专题'" :visible.sync="dialogVisible">
      <el-form :model="form" ref="form" :rules="rules" label-width="100px">
        <el-form-item label="专题名称" required prop="specialName">
          <el-input v-model="form.specialName" clearable maxlength="50"></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="1" :max="999"></el-input-number>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio v-model="form.status" label="1">上架</el-radio>
          <el-radio v-model="form.status" label="0">下架</el-radio>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submit()">保 存</el-button>
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
    postSpecialList,
    getThemeDelete,
    postThemeUpdate,
    postThemeAdd
  } from '@/api/course';
  import keymap from '@/utils/keymap'
  export default {
    name: 'Department',
    data() {
      return {
        PAGE_SIZE_ARR,
        keymap,
        queryParam: {
          specialName: ''
        },
        searchDebounce: null,
        pagination: {
          pageNum: 1,
          pageSize: 10
        },
        totalPageNum: 0,
        tableData: [],
        dialogVisible: false,
        num: 1,
        form: {
          specialName: '',
          sort: 1,
          status: '1'
        },
        rules: {
          specialName: [{
            required: true,
            message: '请输入专题名称',
            trigger: 'blur'
          }],
          sort: [{
            required: true,
            message: '请选择排序',
            trigger: 'change'
          }],
          status: [{
            required: true,
            message: '请选择上下架',
            trigger: 'change'
          }],
        }
      }
    },
    created() {
      this.getTableData()
      this.searchDebounce = debounce(this.handleConditionQuery, SEARCH_DEBOUNCE_TIME, false)
    },
    methods: {
      // 添加专题
      add() {
        this.$nextTick(() => {
          this.form.id = '';
          this.form.specialName = ''
          this.form.sort = 1,
            this.form.status = '1'
        });
        this.dialogVisible = true;
        this.$refs.form.resetFields();
      },
      // 编辑专题
      edit(row) {
        this.dialogVisible = true;
        this.form.id = row.id
        this.form.sort = row.sort
        this.form.status = row.status.toString()
        this.form.specialName = row.specialName;
      },
      // 删除专题
      del(row) {
        this.$confirm("是否确定删除？", "删除", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }).then(() => {
          getThemeDelete({
            id: row.id,
          }).then((res) => {
            if (res.success === 1) {
              this.$message.success(res.msg);
              this.getTableData();
            }
          });
        });
      },
      // 提交表单
      submit() {
        if (this.form.specialName == '') {
          return this.$message({
            type: 'error',
            message: '请上传章节媒体文件'
          })
          return false
        }
        this.$refs.form.validate((valid) => {
          if (valid) {
            if (this.form.id) {
              postThemeUpdate(this.form).then((res) => {
                if (res.success === 1) {
                  this.$message.success(res.msg);
                  this.dialogVisible = false;
                  this.getTableData();
                }
              });
            } else {
              postThemeAdd(this.form).then((res) => {
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
      // 选择请求列表数量
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
        const res = await postSpecialList(this.queryParam)
        this.tableData = res.data.list
        this.form.status = this.form.status.toString()
        this.totalPageNum = res.data.total
      },
      // 前往课程列表页
      goTheme({
        id
      }) {
        this.$router.push({
          path: '/course/courseList',
          query: {
            id: id
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
