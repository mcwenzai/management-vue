
<template>
  <div class="category-admin">
    <el-container>
      <el-aside width="240px">
        <div class="categoryList" style="padding: 20px 0">
          <div class="all">
            <span style="font-size: 16px">全部类目</span>
            <i v-has-permission="'classify:insert'" class="el-icon-circle-plus-outline" style="cursor: pointer" @click.stop="() => append('all')"></i>
          </div>
          <el-tree
            draggable
            :allow-drop="allDrop"
            @node-drop="nodeDrop"
            :data="treeList"
            :accordion="true"
            node-key="id"
            @node-expand="nodeExpand"
            @node-collapse="nodeCollapse"
            :default-expanded-keys="expandedKeyList"
            :props="{ value: 'id', label: 'name' }"
            :check-on-click-node="true">
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <el-input size="mini" maxlength="6" v-model="data.labelEdit" v-if="data.isEdit" @blur="update(node, data)" @click.stop=""></el-input>
              <span style="font-size: 16px" v-else @click.stop="() => handleNodeClick(data)">{{ data.name }}</span>
              <span v-if="data.id">
                <i class="el-icon-circle-plus-outline" v-has-permission="'classify:insert'" @click="() => append(node, data)" v-if="data.level < 3 && !node.expanded"></i>
                <i class="el-icon-circle-plus-outline" v-has-permission="'classify:insert'" @click.stop="() => append(node, data)" v-if="data.level < 3 && node.expanded"></i>
                <i class="el-icon-remove-outline" v-has-permission="'classify:delete'" @click.stop="() => remove(data)"></i>
                <i class="el-icon-edit" v-has-permission="'classify:update'" @click.stop="() => edit(data)"></i>
              </span>
            </span>
          </el-tree>
          <span class="custom-tree-node" v-if="isAdd" style="padding: 5px 10px">
            <el-input size="mini" maxlength="6" v-model="name" @blur="add()"></el-input>
          </span>
        </div>
      </el-aside>
      <el-container>
        <el-header>
          <el-breadcrumb separator-class="el-icon-arrow-right" style="line-height: 60px">
            <el-breadcrumb-item>全部类目</el-breadcrumb-item>
            <el-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index">{{item}}</el-breadcrumb-item>
          </el-breadcrumb>
        </el-header>
        <el-main style="padding: 0 20px">
          <el-table
            :data="tableData"
            style="width: 100%">
            <el-table-column>
              <template slot="header">
                <span>{{currentLevel === 1 ? '一' : currentLevel === 2 ? '二' : '三'}}级类目</span>
              </template>
              <template slot-scope="scope">
                {{scope.row.name}}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态">
              <template slot-scope="{ row }">
                {{ row.status === 0 ? '启用' : '禁用' }}
              </template>
            </el-table-column>
            <el-table-column prop="goodsCount" label="商品数量"></el-table-column>
            <el-table-column prop="createTime" label="创建时间"></el-table-column>
            <el-table-column prop="updateTime" label="更新时间"></el-table-column>
            <el-table-column prop="updater" label="更新人"></el-table-column>
            <el-table-column prop="date" label="操作" width="280">
              <template slot-scope="scope">
                <!-- <el-button type="primary" size="mini" @click="see(scope.row)">
                  查看
                </el-button> -->
                <el-button type="primary" size="mini" @click="stop(scope.row)" v-if="scope.row.status === 0" v-has-permission="'classify:updateStatus'">
                  停用
                </el-button>
                <el-button type="primary" size="mini" @click="start(scope.row)" v-else v-has-permission="'classify:updateStatus'">
                  启用
                </el-button>
                <el-button type="primary" size="mini" @click="del(scope.row)" v-has-permission="'classify:delete'">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            :current-page.sync="queryParam.pageNum"
            :page-sizes="PAGE_SIZE_ARR"
            :page-size.sync="queryParam.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalPageNum"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </el-main>
      </el-container>
    </el-container>
    <el-dialog title="类目详情" :visible.sync="dialogFormVisible">
      <el-form :model="detail" label-width="100px" v-if="detail">
        <el-form-item label="分类名称">
          <span>{{detail.name}}</span>
        </el-form-item>
        <el-form-item label="结构层级">
          <span>{{detail.level}}</span>
        </el-form-item>
        <el-form-item label="创建时间">
          <span>{{detail.createTime}}</span>
        </el-form-item>
        <el-form-item label="更新时间">
          <span>{{detail.updateTime}}</span>
        </el-form-item>
        <el-form-item label="创建者">
          <span>{{detail.creator}}</span>
        </el-form-item>
        <el-form-item label="修改人">
          <span>{{detail.updater}}</span>
        </el-form-item>
         <el-form-item label="备注">
          <span>{{detail.notes}}</span>
        </el-form-item>
        <el-form-item label="状态">
          <span>{{detail.status === 0 ? '启用' : '禁用'}}</span>
        </el-form-item>
        <el-form-item label="商品数量">
          <span>{{detail.goodsCount}}</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getClassifyTree, classifyList, classifyUpdateStatus, classifyDelete,
  classifyUpdate, classifyInsert, getClassifyById } from "@/api/goodsCenter";
import {
  PAGE_SIZE_ARR,
} from "@/utils/constant";

export default {
  data() {
    return {
      PAGE_SIZE_ARR,
      treeList: [],
      tableData: [],
      queryParam: {
        parentId: '',
        pageNum: 1,
        pageSize: 10,
      },
      totalPageNum: 0,
      breadcrumbList: [],
      currentLevel: 1,
      name: '',
      isAdd: false,
      parenNode: {},
      dialogFormVisible: false,
      detail: null,
      expandedKeyList: [],
    };
  },
  created() {
    this.getTree();
  },
  methods: {
    async getTree() {
      let res = await getClassifyTree();
      res = res.data || [];
      res.forEach((e) => {
        this.$set(e, 'isEdit', false);
        this.$set(e, 'labelEdit', e.name);
        e.children.forEach((el) => {
          this.$set(el, 'isEdit', false);
          this.$set(el, 'labelEdit', el.name);
          el.children.forEach((ele) => {
            this.$set(ele, 'isEdit', false);
            this.$set(ele, 'labelEdit', ele.name);
            delete ele.children;
          });
        });
      });
      this.treeList = res;
    },
    handleNodeClick(node) {
      this.currentLevel = node.level;
      if (node.level === 1) {
        this.breadcrumbList = [node.name];
      } else if (node.level === 2) {
        const level1 = this.treeList.find(item => item.id === node.parentId).name;
        this.breadcrumbList = [level1, node.name];
      } else {
        let level1Id = '';
        let level2 = '';
        this.treeList.forEach((item) => {
          item.children.forEach((items) => {
            if (items.id === node.parentId) {
              level2 = items.name;
              level1Id = items.parentId;
            }
          });
        });
        const level1 = this.treeList.find(item => item.id === level1Id).name;
        this.breadcrumbList = [level1, level2, node.name];
      }
      this.queryParam.parentId = node.id;
      this.getTableData();
    },
    allDrop(draggingNode, dropNode, type) {
      if (draggingNode.level === dropNode.level) {
        if (draggingNode.parent.id === dropNode.parent.id) {
          return type === 'prev';
        }
      }
    },
    // 拖拽排序
    nodeDrop(draggingNode, dropNode, type) {
      const classifyList = [];
      for (let item of dropNode.parent.childNodes) {
        classifyList.push(item.data);
      }
      classifyUpdate({
        classifyList,
      }).then((res) => {
        if (res.success === 1) {
          this.$message.success(res.msg);
          this.getTree();
        }
      });
    },
    nodeExpand(node) {
      this.expandedKeyList = [node.parentId, node.id];
    },
    nodeCollapse(node) {
      if (node.level === 1) {
        this.expandedKeyList = [];
      } else if (node.level === 2) {
        this.expandedKeyList = [node.parentId];
      }
    },
    edit(data) {
      data.isEdit = !data.isEdit;
    },
    update(node, data) {
      if (data.labelEdit.trim()) {
        if (data.id) {
          classifyUpdate({
            id: data.id,
            name: data.labelEdit,
            level: data.level,
            parentId: data.parentId,
            sort: data.sort,
          }).then((res) => {
            if (res.success === 1) {
              this.$message.success(res.msg);
              this.getTree();
            }
          });
        } else {
          classifyInsert({
            id: data.id,
            name: data.labelEdit,
            level: data.level,
            parentId: data.parentId,
            sort: data.sort,
          }).then((res) => {
            if (res.success === 1) {
              this.$message.success(res.msg);
              this.getTree();
            }
          })
        }
      } else {
        if (data.id) {
          data.isEdit = !data.isEdit;
        } else {
          this.getTree();
        }
      }
    },
    add() {
      if (this.name.trim()) {
        classifyInsert({
          name: this.name,
          level: 1,
          parentId: 0,
          sort: 0,
        }).then((res) => {
          if (res.success === 1) {
            this.getTree();
            this.isAdd = !this.isAdd;
            this.$message.success(res.msg);
          }
        });
      } else {
        this.isAdd = !this.isAdd;
      }
    },
    append(node, data) {
      if (node === 'all') {
        this.isAdd = !this.isAdd;
      } else {
        if (data.children.length === 0 || data.children[data.children.length - 1].id) {
          data.children.push({
            children: [],
            goodsCount: 0,
            id: '',
            isDeleted: 0,
            isEdit: true,
            labelEdit: '',
            level: data.level + 1,
            name: '',
            parentId: data.id,
            sort: 0,
            status: 1,
          });
        }
      }
    },
    remove(data) {
      if (data.children && data.children.length > 0) {
        this.$message.warning('该类目下存在下级类目，无法删除');
        return;
      }
      if (data.goodsCount && data.goodsCount > 0) {
        this.$message.warning('该类目下存在商品，无法删除');
        return;
      }
      this.$confirm("是否确定删除？", "删除", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        classifyDelete({
          id: data.id,
        }).then((res) => {
          if (res.success === 1) {
            this.getTree();
            this.$message.success(res.msg);
          }
        });
      });
    },
    getTableData() {
      classifyList(this.queryParam).then((res) => {
        this.tableData = res.data.list;
        this.totalPageNum = res.data.total;
      });
    },
    handleCurrentChange(newPage) {
      this.queryParam.pageNum = newPage;
      this.getTableData();
    },
    handleSizeChange(newSize) {
      this.queryParam.pageSize = newSize;
      this.getTableData();
    },
    see(row) {
      getClassifyById(row.id).then((res) => {
        if (res.success === 1) {
          this.detail = res.data;
          this.dialogFormVisible = true;
        }
      });
    },
    stop(row) {
      if (row.goodsCount) {
        this.$message.warning('请先移除商品');
        return;
      }
      this.$confirm("是否确定停用？", "删除", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        classifyUpdateStatus({
          id: row.id,
          status: 1
        }).then((res) => {
          if (res.success === 1) {
            this.$message.success(res.msg);
            this.getTableData();
          }
        });
      });
    },
    start(row) {
      if (!row.goodsCount) {
        this.$message.warning('请先添加商品');
        return;
      }
      this.$confirm("是否确定启用？", "删除", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        classifyUpdateStatus({
          id: row.id,
          status: 0
        }).then((res) => {
          if (res.success === 1) {
            this.$message.success(res.msg);
            this.getTableData();
          }
        });
      });
    },
    del(row) {
      if (row.goodsCount) {
        this.$message.warning('请先移除商品');
        return;
      }
      this.$confirm("是否确定删除？", "删除", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        classifyDelete({
          id: row.id,
        }).then((res) => {
          if (res.success === 1) {
            this.$message.success(res.msg);
            this.getTableData();
            this.getTree();
          }
        });
      });
    },
  },
};
</script>
<style lang='scss' scoped>
.category-admin {
  padding-top: 20px;
}
.el-aside {
  min-height: 500px;
  background-color: rgb(242, 242, 242);
}
.el-tree {
  background-color: rgb(242, 242, 242);
}
.categoryList {
  .all {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
    padding: 0 10px;
    color: #606266;
  }
  .custom-tree-node {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0 10px 0 0;
  }
}
</style>
