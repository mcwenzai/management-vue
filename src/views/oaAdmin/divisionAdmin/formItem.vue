<template>
  <div style="margin-top: 20px">
    <el-form-item v-for="(node, index) in areaTree" :key="index" :label="node.areaName" required
      :class="{lostStyle:node.level==3 || node.level==4}">
      <span v-if="node.level!==4 " @click="nextShow(node, index)"><i class="el-icon-caret-bottom" /></span>
      <el-select :key="node.id" v-model="node.employeeId" filterable placeholder="搜索姓名/手机号" @change="handleSave(node)">
        <el-option v-for="item in node.roleList" :key="item.employeeId" :label="item.employeeName"
          :value="item.employeeId" />
      </el-select>
      <form-item v-show="node.id == firstShow || node.id == secondShow || node.id == thirdShow"
        :area-tree="node.children" />
    </el-form-item>
  </div>
</template>

<script>
  import {
    oaAreaUpdate,
    getOaEmployeeByRole
  } from '@/api/oaAdmin'

  export default {
    name: 'FormItem',
    props: {
      areaTree: {
        type: Array
      }
    },
    data() {
      return {
        list: [],
        firstShow: '',
        secondShow: '',
        thirdShow: '',
        form: {
          id: '',
          deptName: '',
          employeeId: '',
          status: 0
        },
        showOrHide: false
      }
    },
    mounted() {},
    methods: {
      handleSave(node) {
        this.$confirm('一旦操作将会影响线上业务，请慎重!', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          oaAreaUpdate({
            id: node.id,
            employeeId: node.employeeId
          }).then((res) => {
            if (res.success === 1) {
              // this.$refs.showOrHide.blur();
              this.$message.success('保存成功')
            }
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消操作'
          });
        });
      },
      nextShow(nodeData, nodeIndex) {
        this.$nextTick(() => {
          if (nodeData.level === 1) {
            this.firstShow === '' ? this.firstShow = nodeData.id : this.firstShow = ''
          }
          if (nodeData.level === 2) {
            this.secondShow === '' ? this.secondShow = nodeData.id : this.secondShow = ''
          }
          if (nodeData.level === 3) {
            this.getOaAreaTree(nodeData)
            if (this.thirdShow === nodeData.id) {
              this.thirdShow = ''
            } else {
              setTimeout(() => {
                this.thirdShow = nodeData.id
              }, 800)
            }
          }
        })
      },
      getOaAreaTree(params) {
        getOaEmployeeByRole().then((data) => {
          this.areaTree.forEach((item) => {
            item.children.forEach((item1) => {
              if (params.id === item1.parentId) {
                this.$set(item1, 'roleList', data.data[5])
              }
            })
          })
        })
      }
    }
  }
</script>
<style scoped>
  .lostStyle {
    margin: 10px 0;
  }
</style>
