<template>
  <div>
    <el-header class="operate-part">
      <div class="flex">
        <div class="title">添加自定义区域</div>
      </div>
      <span class="buttons">
        <el-button @click="goBack">返回</el-button>
      </span>
    </el-header>
    <div class="body-con">
      <div class="custom">
        <div class="region">自定义区域：</div>
        <div class="addivi">包含行政区域：</div>
        <div class="add-largerea">
          <span @click="addLargErea()">添加大区</span>
        </div>
      </div>
      <i class="el-icon-caret-bottom"></i>
      <el-input v-model="form.largeArea" style="width: 280px;text-align: center;margin-right: 905px;" maxlength="10"
        placeholder="请输入自定义大区名称" @change="changeLargeArea">
      </el-input>
      <el-button @click="addProvince()">添加省</el-button>
      <div class="vtl" v-for="(item,index) in provinceArray" :key="item.id">
        <div class="vtl-node vtl-tree-node">
          <div class="vtl-border vtl-up"></div>
          <div draggable="true" class="vtl-node-main">
            <i class="el-icon-caret-bottom"></i>
            <div class="vtl-node-content">
              <el-input v-model="item.provinceName" style="width: 280px;text-align: center;margin-right: 250px;"
                maxlength="10" placeholder="请输入自定义省名称">
              </el-input>
              <el-select v-model="item.selectProvince" placeholder="请选择行政省"
                style="width: 280px;text-align: center;margin-right: 310px;" multiple
                @change="(code)=>changePrvince(code,index)">
                <el-option v-for="item in provinceList" :key="item.code" :label="item.name" :value="item.code">
                </el-option>
              </el-select>
            </div>
            <div class="vtl-operation">
              <el-button @click="addCity(index,item.id)">添加市</el-button>
            </div>
          </div>
        </div>
        <div class="vtl" v-for="(ite,inde) in item.cityArray" :key="ite.id">
          <div class="vtl-node vtl-tree-node">
            <div class="vtl-border vtl-up"></div>
            <div draggable="true" class="vtl-node-main">
              <i class="el-icon-caret-bottom"></i>
              <div class="vtl-node-content">
                <el-input v-model="ite.cityName" style="width: 280px;text-align: center;margin-right: 260px;"
                  maxlength="10" placeholder="请输入自定义市名称">
                </el-input>
                <el-select v-model="ite.selectCity" placeholder="请选择行政市"
                  style="width: 280px;text-align: center;margin-right: 270px;" multiple
                  @change="(code)=>changeCity(code,index,inde)">
                  <el-option v-for="item in cityList" :key="item.code" :label="item.name" :value="item.code">
                  </el-option>
                </el-select>
              </div>
              <div class="vtl-operation">
                <span title="Add Tree Node">
                  <el-button @click="addArea(index,inde,ite.id)">添加区</el-button>
                </span>
              </div>
            </div>
          </div>
          <div class="vtl" v-for="(it,ind) in ite.areaArray" :key="it.id">
            <div class="vtl-node vtl-tree-node">
              <div class="vtl-border vtl-up"></div>
              <div draggable="true" class="vtl-node-main">
                <i class="el-icon-caret-bottom"></i>
                <div class="vtl-node-content">
                  <el-input v-model="it.areaName" style="width: 280px;text-align: center;margin-right: 280px;"
                    maxlength="10" placeholder="请输入自定义区名称">
                  </el-input>
                  <el-select v-model="it.selectArea" placeholder="请选择行政区" multiple
                    @change="(areaCode)=>changeArea(areaCode,index,inde,ind)"
                    style="width: 280px;text-align: center;margin-right: 220px;">
                    <el-option v-for="item in areaList" :key="item.code" :label="item.name" :value="item.code">
                    </el-option>
                  </el-select>
                </div>
                <div class="vtl-operation">
                  <span title="Add Tree Node">
                    <el-button @click="deleteArea(index, inde, ind,it.id)">删除</el-button>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {
    VueTreeList,
    Tree,
    TreeNode
  } from 'vue-tree-list-new';
  import {
    getListByRole,
    getOaDepartmentById,
    getOaAreaTree,
    oaDepartmentUpdate,
    getOaEmployeeByRole,
    postCityList,
    postInsertArea,
    deleteAreaTree
  } from '@/api/oaAdmin'
  export default {
    components: {
      VueTreeList
    },
    data() {
      return {
        newTree: {},
        form: {
          id: '',
          employeeId: '',
          largeArea: '',
          province: '',
          city: '',
          area: ''
        },
        area: {
          id: '',
          deptId: '',
          cityCodeList: []
        },
        provinceArray: [],
        provinceList: [],
        cityList: [],
        areaList: [],
        idTree: {}
      }
    },
    created() {
      var id = this.$route.query.id
      this.area.deptId = id
    },
    methods: {
      changeLargeArea(value) {
        var argu = {
          id: '',
          deptId: this.area.deptId,
          areaName: this.form.largeArea,
          parentId: '0',
          oaAreaCityDTOList: [],
          level: 1
        }
        postInsertArea(argu).then((res) => {
          console.log(res)
        })
      },


      addProvince() {
        if (this.form.largeArea == '') {
          this.$notify({
            title: '警告',
            message: '请先填写自定大区名称'
          });
        } else if (this.provinceArray.length > 0) {
          this.$notify({
            title: '警告',
            message: '请勿重复添加省'
          });
        } else {
          var id = this.generateId().toString()
          var province = {
            id: id,
            provinceName: '',
            selectProvince: '',
            cityArray: []
          }
          this.provinceArray.push(province)
          postCityList(this.area).then((res) => {
            this.provinceList = res.data
          })
          var argu = {
            deptId: this.area.deptId,
            areaName: this.form.largeArea,
            level: 1,
            parentId: '0',
            oaAreaCityDTOList: []
          }
          postInsertArea(argu).then((res) => {
            if (res.success == 1) {
              this.idTree = res.data

            }
          })
        }
      },

      addCity(index, id) {
        console.log(index)
        if (this.provinceArray[index].provinceName == '') {
          this.$notify({
            title: '警告',
            message: '请先填写自定义省名称'
          });
        } else if (this.provinceArray[index].selectProvince == '') {
          this.$notify({
            title: '警告',
            message: '请先选择省'
          });
        } else {
          var id = this.generateId().toString()
          var city = {
            id: id,
            cityName: '',
            selectCity: '',
            areaArray: []
          }
          this.provinceArray[index].cityArray.push(city)
          postCityList(this.area).then((res) => {
            this.cityList = res.data
          })
        }
      },

      addArea(provinceIndex, cityIndex) {
        console.log(provinceIndex)
        console.log(cityIndex)
        if (this.provinceArray[provinceIndex].cityArray[cityIndex].cityName == '') {
            this.$notify({
              title: '警告',
              message: '请先填写自定义市名称'
            });
        } else if (this.provinceArray[provinceIndex].cityArray[cityIndex].selectCity == '') {
          this.$notify({
            title: '警告',
            message: '请先选择市'
          });
        } else {
          var id = this.generateId().toString()
          var area = {
            id: id,
            areaName: '',
            selectArea: ''
          }
          this.provinceArray[provinceIndex].cityArray[cityIndex].areaArray.push(area)
        }
      },

      changePrvince(cityCode, index) {
        console.log(cityCode)
        console.log(index)
        var areaName = this.provinceArray[index].provinceName
        if (areaName == '') {
          this.$notify({
            title: '警告',
            message: '请先填写自定省名称'
          });
        } else {
          this.area.cityCodeList = cityCode
          console.log(this.area.cityCodeList)
          postCityList(this.area).then((res) => {
            this.cityList = res.data
          })
          let treeArgu = {
            deptId: this.area.deptId
          }

          var parentId = this.idTree.id
          var level = this.idTree.level + 1
          var cityCodeList = []
          cityCode.map(item => {
            cityCodeList.push({
              cityCode: item
            });
          })
          var areaName = this.provinceArray[index].provinceName
          var argu = {
            deptId: this.area.deptId,
            areaName: areaName,
            level: level,
            parentId: parentId,
            oaAreaCityDTOList: cityCodeList
          }
          postInsertArea(argu).then((res) => {
            if (res.success == 1) {
              this.idTree = res.data
            }
          })
        }
      },

      changeCity(cityCode, provinceIndex, cityIndex) {
        var areaName = this.provinceArray[provinceIndex].cityArray[cityIndex].cityName
        postCityList(this.area).then((res) => {
          this.areaList = res.data
        })
        if (areaName == '') {
          this.$notify({
            title: '警告',
            message: '请先填写自定市名称'
          });
        } else {
          this.area.cityCodeList = cityCode
          console.log(this.area.cityCodeList)
          var parentId = this.idTree.id
          var level = this.idTree.level + 1
          var cityCodeList = []
          cityCode.map(item => {
            cityCodeList.push({
              cityCode: item
            });
          })
          console.log(cityCodeList)
          var argu = {
            deptId: this.area.deptId,
            areaName: areaName,
            level: level,
            parentId: parentId,
            oaAreaCityDTOList: cityCodeList
          }
          postInsertArea(argu).then((res) => {
            if (res.success == 1) {
              this.idTree = res.data
            }
          })
        }
      },

      changeArea(areaCode, provinceIndex, cityIndex, areaIndex, id) {
        var areaName = this.provinceArray[provinceIndex].cityArray[cityIndex].areaArray[areaIndex].areaName

        if (areaName == '') {
          this.$notify({
            title: '警告',
            message: '请先填写自定区名称'
          });
        } else {
          this.area.cityCodeList = areaCode
          console.log(this.area.cityCodeList)
          var parentId = this.idTree.id
          var level = this.idTree.level + 1
          var cityCodeList = []
          areaCode.map(item => {
            cityCodeList.push({
              cityCode: item
            });
          })
          var areaName = this.provinceArray[provinceIndex].cityArray[cityIndex].areaArray[areaIndex].areaName
          var argu = {
            deptId: this.area.deptId,
            areaName: areaName,
            level: level,
            parentId: parentId,
            oaAreaCityDTOList: cityCodeList
          }
          postInsertArea(argu).then((res) => {
            if (res.success == 1) {
              this.idTree = res.data
            }
          })
        }
      },

      deleteArea(provinceIndex, cityIndex, index, id) {
        this.provinceArray[provinceIndex].cityArray[cityIndex].areaArray.splice(index, 1)
        deleteAreaTree({
          id
        }).then((res) => {
          if (res.success == 1) {
            this.$message({
              message: '删除成功',
              type: 'success'
            })
          } else {
            this.$message({
              message: '删除失败',
              type: 'error'
            })
          }

        })
      },

      // 生成id
      generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      },

      goBack() {
        this.$router.go(-1)
      },
    }
  }
</script>


<style lang='scss' scoped>
  /*  .brand-admin { */
  .vtl {
    .vtl-drag-disabled {
      background-color: #d0cfcf;

      &:hover {
        background-color: #d0cfcf;
      }
    }

    .vtl-disabled {
      background-color: #d0cfcf;
    }
  }

  .icon {
    &:hover {
      cursor: pointer;
    }
  }

  .muted {
    color: gray;
    font-size: 80%;
  }

  .operate-part {
    display: flex;
    justify-content: space-between;
    padding: 30px 20px 20px 65px;
    text-align: center;

    .el-input {
      width: 200px;
    }
  }

  .body-con {
    padding: 40px 120px;
    line-height: 60px;

    .custom {
      display: flex;
      margin-left: 120px;

      .region {
        width: 540px;
      }

      .addivi {
        width: 540px;
      }

      .add-largerea {
        width: 140px;
      }
    }

    .area-flex {

      .large-area {
        display: flex;
        align-items: center;
        line-height: 60px;
      }
    }

    .province {
      margin-left: 40px;
      display: flex;
      align-items: center;
      line-height: 60px;
    }

    .city {
      margin-left: 80px;
      display: flex;
      align-items: center;
      line-height: 60px;
    }

    .area {
      margin-left: 120px;
      display: flex;
      align-items: center;
      line-height: 60px;
    }

    .add {
      width: 80px;

      /* margin-left: 120px; */
      span {
        text-align: left;
        color: #0000FE;
      }
    }

    /*    /deep/ .el-button {
      border: none;
      background: none;
    } */
  }

  .vtl {
    padding-left: 2rem;

    .vtl-operation {
      /*      /deep/ .el-button {
        border: none;
        background: none;
      } */
    }
  }

  /* } */

  /*  /deep/ .el-input {
    margin-right: 450px;
  } */
</style>
