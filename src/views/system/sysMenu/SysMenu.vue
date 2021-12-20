<template>
  <div>
    <el-container>
      <el-main>
        <el-form size="small" :inline="true" class="demo-form-inline">
          <el-form-item>
            <el-button type="primary" @click="addOrUpdate(null)" v-has-permission="'sysMenu:insert'">添加一级菜单</el-button>
          </el-form-item>
        </el-form>
        <el-table
          v-loading="loading"
          :data="tableData"
          style="width: 100%;margin-bottom: 20px;"
          row-key="id"
          border
          :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
          <el-table-column
            prop="id"
            label="ID"
            width="100">
          </el-table-column>
          <el-table-column
            prop="title"
            label="菜单名称"
            width="300">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.type===1" size="mini">菜单</el-tag>
              <el-tag v-if="scope.row.type===2" size="mini" type="warning">按钮</el-tag>
              <span style="margin-left: 10px">{{ scope.row.title }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="url"
            label="URL"
            width="200">
          </el-table-column>
          <el-table-column
            prop="permission"
            label="权限标识"
            width="200">
          </el-table-column>
          <el-table-column
            prop="component"
            label="组件路径">
          </el-table-column>
          <el-table-column
            prop="sort"
            label="排序">
          </el-table-column>
          <el-table-column
            fixed="right"
            label="操作"
          >
            <template slot-scope="scope">
              <el-button v-if="scope.row.type!==2" @click="addOrUpdate({parentId:scope.row.id})" type="text" size="small" v-has-permission="'sysMenu:insert'">添加子菜单</el-button>
              <el-button @click="addOrUpdate(scope.row)" type="text" size="small" v-has-permission="'sysMenu:update'">修改</el-button>
              <el-button style="color: #ff684b" @click="deleteRecord(scope.row.id)" type="text" size="small" v-has-permission="'sysMenu:delete'">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!--<br>
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.pageNum"
          :page-sizes="[1, 20, 50, 100]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>-->
      </el-main>
    </el-container>
    <SysMenuModal ref="entityModal" @reload="getList"></SysMenuModal>
  </div>
</template>

<script>
  import SysMenuModal from './SysMenuModal'
  const listUrl = '/system/sysMenu/list';
  const deleteUrl = '/system/sysMenu/delete';

  export default {
    name: "SysMenu",
    components: {SysMenuModal},
    created() {
      this.getList()
    },
    data() {
      return {
        loading: false,
        queryParam: {},
        pagination: {
          pageNum: 1,
          pageSize: 10
        },
        total: 0,
        tableData: []
      }
    },
    methods: {
      makeMenuTree(menus,parentId){
        var res = [];
        for (var menu of menus){
          if(menu.parentId === parentId){
            menu.children = this.makeMenuTree(menus,menu.id)
            res.push(menu)
          }
        }
        return res;
      },
      addOrUpdate(row) {
        var entity = row ? row : null;
        this.$refs.entityModal.openModal(entity);
      },
      deleteRecord(primaryKey) {
        this.$confirm('此操作将删除菜单及其子菜单，确定吗删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true;
              this.$get(deleteUrl+'/'+primaryKey).then(res => {
                instance.confirmButtonLoading = false;
                if (res.success === 1) {
                  this.$message({
                    type: 'success',
                    message:res.msg
                  });
                  done();
                  this.getList();
                }
              });
            } else {
              this.$message({
                type: 'info',
                message: '已取消删除'
              });
              done();
            }
          }
        }).catch(()=>{})
      },
      reload() {
        this.initPageParam();
        this.queryParam = {};
        this.getList()
      },
      initPageParam(){
        this.pagination = {
          pageNum: 1,
          pageSize: 10
        }
      },
      query() {
        this.initPageParam();
        this.getList()
      },
      getList() {
        var that = this;
        that.loading = true;
        //Object.assign(that.queryParam, that.pagination);
        that.$postJson(listUrl, that.queryParam).then(res => {
          //排序
          var menus = res.data.list.sort(function(a,b){
            if(a.sort<b.sort){
              return -1;
            }else if(a.sort>b.sort){
              return 1;
            }
            return 0;
          });
          that.tableData = that.makeMenuTree(menus,0);
          that.total = res.data.list.length;
          that.loading = false;
        })
      },
      handleSizeChange(val) {
        this.pagination.pageNum = 1;
        this.pagination.pageSize = val;
        //this.getList()
      },
      handleCurrentChange(val) {
        this.pagination.pageNum = val;
        //this.getList()
      }
    }
  }
</script>

<style scoped>

</style>
