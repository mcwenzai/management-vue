<template>
  <div class="member-admin">
    <el-container>
      <el-main>
        <div class="operate-part">
          <div>
            <el-input v-model="queryParam.orderSubId" placeholder="搜索订单编号" @input="searchDebounce" />
            <el-input v-model="queryParam.deliveryName" placeholder="搜索收件人姓名" @input="searchDebounce" />
            <el-input v-model="queryParam.deliveryPhone" placeholder="搜索收件人手机号" @input="searchDebounce" />
            <el-input v-model="queryParam.goodsName" placeholder="搜索商品" @input="searchDebounce" />
            <el-date-picker v-model="time" type="daterange" range-separator="至" start-placeholder="开始日期"
              end-placeholder="结束日期" value-format="yyyy-MM-dd HH:mm:ss" @change="handleChangeTime">
            </el-date-picker>
            <el-select v-model="queryParam.statusList" multiple @change="searchDebounce" placeholder="​筛选状态" filterable>
              <el-option v-for="item in INVOICE_STATUS" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </div>
        </div>
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column prop="orderSubId" label="订单编号" />
          <el-table-column prop="deliveryName" label="收件人姓名" />
          <el-table-column prop="deliveryPhone" label="收件人电话" />
          <el-table-column prop="storeName" label="店铺" />
          <el-table-column prop="goodsName" label="商品名称" show-overflow-tooltip />
          <el-table-column prop="" label="物流" show-overflow-tooltip>
            <template slot-scope="scope">
              <div v-if="scope.row.ordersDeliveryExpressList">
                <span v-for="(item, index) in scope.row.ordersDeliveryExpressList" :key="index">
                  {{item.expressCompany}}: {{item.expressNo}} <span
                    v-if="index !== scope.row.ordersDeliveryExpressList.length - 1">,</span>
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" :formatter="statusFormatter" />
          <el-table-column prop="createTime" label="创建时间" />
          <el-table-column prop="deliveryTime" label="发货时间" />
          <el-table-column label="操作" width="300">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="see(scope.row)" v-has-permission="'ordersDelivery:list'">查看
              </el-button>
              <span v-if="scope.row.status === INVOICE_STATUS[1].value || scope.row.status === INVOICE_STATUS[2].value"
                v-has-permission="'ordersDelivery:update'">
                <el-button type="primary" size="mini" @click="invoice(scope.row, '查看发票')" v-if="scope.row.invoiceType">
                  查看发票</el-button>
                <el-button type="primary" size="mini" @click="invoice(scope.row, '上传发票')" v-else>上传发票</el-button>
              </span>
              <el-button type="primary" size="mini" @click="deliver(scope.row)"
                v-if="scope.row.status === INVOICE_STATUS[0].value || scope.row.status === INVOICE_STATUS[1].value"
                v-has-permission="'ordersDelivery:insert'">发货</el-button>
              <el-button type="primary" size="mini" @click="receiving(scope.row)"
                v-if="scope.row.status === INVOICE_STATUS[1].value" v-has-permission="'ordersDelivery:updateStatus'">收货
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
    <el-dialog title="发货" :visible.sync="dialogVisible">
      <el-form :model="expressForm" ref="expressForm" label-width="100px">
        <el-form-item label="物流单号" required prop="expressNo" :rules="[
          { required: true, message: '请输入物流单号', trigger: 'blur' },
        ]">
          <el-input v-model="expressForm.expressNo" maxlength="50"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleExpress">提 交</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="title" :visible.sync="dialogVisible2">
      <el-form :model="invoiceForm" ref="invoiceForm" label-width="100px" :disabled="title === '查看发票'">
        <el-form-item label="发票" required prop="invoiceType" :rules="[
          { required: true, message: '请选择发票类型', trigger: 'blur' },
        ]">
          <el-radio-group v-model="invoiceForm.invoiceType" @change="handleChangeInvoiceType">
            <el-radio :label="type.value" v-for="(type, index) in INVOICE_TYPE" :key="index">
              {{type.label}}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="发票链接" required prop="invoiceUrl" v-if="invoiceForm.invoiceType === INVOICE_TYPE[1].value"
          :rules="[
          { required: true, message: '请输入发票链接', trigger: 'blur' },
        ]">
          <el-input type="textarea" v-model="invoiceForm.invoiceUrl" maxlength="200"></el-input>
        </el-form-item>
        <el-form-item label="选择图片" required prop="invoiceUrl" v-if="invoiceForm.invoiceType === INVOICE_TYPE[2].value"
          :rules="[
          { required: true, message: '请选择图片', trigger: 'blur' },
        ]">
          <el-upload class="avatar-uploader" action="/admin/system/sysFile/uploadImg" :show-file-list="false"
            :on-success="(res,file)=>uploadSuccess(res,file,'invoiceUrl')"
            :before-upload="(file)=>uploadBefore(file,'img',3)">
            <el-image v-if="invoiceForm.invoiceUrl" class="invoice-img" :src="invoiceForm.invoiceUrl" fit="fill" />
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" v-if="title === '查看发票'">
        <el-button @click="dialogVisible2 = false">关闭</el-button>
      </div>
      <div slot="footer" class="dialog-footer" v-else>
        <el-button @click="dialogVisible2 = false">取 消</el-button>
        <el-button type="primary" @click="handleInvoice">提 交</el-button>
      </div>
    </el-dialog>
    <el-dialog title="发货" :visible.sync="dialogVisible3" width="30%">
      <span>{{noPrompt}}</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible3 = false">取 消</el-button>
        <el-button type="primary" @click="handleDetermine()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import axios from 'axios'
  import {
    debounce
  } from '@/utils/index'
  import {
    SEARCH_DEBOUNCE_TIME,
    PAGE_SIZE_ARR,
    ORDER_STATUS,
    INVOICE_TYPE,
    INVOICE_STATUS
  } from '@/utils/constant'
  import {
    getOrdersDeliveryList,
    ordersDeliveryInsert,
    ordersDeliveryUpdateStatus,
    ordersDeliveryUpdate,
    checkExpressNo
  } from '@/api/orderCenter'
  import keymap from '@/utils/keymap'
  export default {
    name: 'Department',
    data() {
      return {
        PAGE_SIZE_ARR,
        ORDER_STATUS,
        INVOICE_TYPE,
        INVOICE_STATUS,
        keymap,
        time: [],
        queryParam: {
          orderSubId: '',
          deliveryName: '',
          deliveryPhone: '',
          goodsName: '',
          beginDate: '',
          endDate: '',
          statusList: []
        },
        searchDebounce: null,
        pagination: {
          pageNum: 1,
          pageSize: 10
        },
        totalPageNum: 0,
        tableData: [],
        dialogVisible: false,
        dialogVisible2: false,
        dialogVisible3: false,
        statusList: [],
        expressForm: {
          orderDeliveryId: '',
          expressNo: '',
        },
        title: '上传发票',
        noPrompt: '',
        invoiceForm: {
          id: '',
          invoiceType: '',
          invoiceUrl: '',
        },
      }
    },
    created() {
      this.getTableData()
      this.searchDebounce = debounce(this.handleConditionQuery, SEARCH_DEBOUNCE_TIME, false)
    },
    methods: {
      statusFormatter(row) {
        if (this.INVOICE_STATUS.find((item) => item.value === row.status)) {
          return this.INVOICE_STATUS.find((item) => item.value === row.status).label;
        }
        return '';
      },
      see(row) {
        this.$router.push({
          path: '/orderCenter/invoiceDetail',
          query: {
            id: row.id
          },
        });
      },
      handleChangeInvoiceType() {
        this.invoiceForm.invoiceUrl = '';
      },
      invoice(row, title) {
        this.invoiceForm.invoiceType = '';
        this.invoiceForm.invoiceUrl = '';
        this.invoiceForm.id = row.id;
        this.title = title;
        this.dialogVisible2 = true;
        if (title === '上传发票') {
          this.$nextTick(() => {
            this.$refs.invoiceForm.resetFields();
          });
        } else {
          this.invoiceForm.invoiceType = row.invoiceType;
          this.invoiceForm.invoiceUrl = row.invoiceUrl;
        }
      },
      deliver(row) {
        this.dialogVisible = true;
        this.$nextTick(() => {
          this.$refs.expressForm.resetFields();
          this.expressForm.orderDeliveryId = row.id;
        });
      },
      receiving(row) {
        this.$confirm("是否确定收货？", "删除", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }).then(() => {
          ordersDeliveryUpdateStatus({
            id: row.id,
          }).then((res) => {
            if (res.success === 1) {
              this.$message.success(res.msg);
              this.getTableData();
            }
          });
        });
      },
      // 上传发票
      handleInvoice() {
        this.$refs.invoiceForm.validate((valid) => {
          if (valid) {
            ordersDeliveryUpdate(this.invoiceForm).then((res) => {
              if (res.success === 1) {
                this.$message.success(res.msg);
                this.dialogVisible2 = false;
                this.getTableData();
              }
            });
          }
        });
      },
      uploadBefore(file, type, limit) {
        if (type === 'img') {
          const pic = ['image/jpeg', 'image/jpg', 'image/png']
          const isPic = pic.indexOf(file.type) > -1
          if (!isPic) {
            this.$message.error('仅支持jpg/png格式')
            return false
          }
        }
        const isLt = file.size / 1024 / 1024 < limit
        if (!isLt) {
          this.$message.error('文件大小不能超过 ' + limit + 'MB!')
          return false
        }
        return true
      },
      uploadSuccess(res, file, filedName) {
        if (res.success === 1) {
          this.invoiceForm[filedName] = res.data.url;
        } else {
          this.$message({
            type: 'error',
            message: res.msg
          })
        }
      },
      handleChangeTime(e) {
        if (e) {
          [this.queryParam.beginDate, this.queryParam.endDate] = e;
        } else {
          this.queryParam.beginDate = '';
          this.queryParam.endDate = '';
        }
        this.searchDebounce();
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
        const res = await getOrdersDeliveryList(this.queryParam)
        this.tableData = res.data.list
        this.totalPageNum = res.data.total
      },
      // 发货
      handleExpress() {
        var that = this
        this.$refs.expressForm.validate((valid) => {
          if (valid) {
            axios.get('/admin/order/ordersDelivery/checkExpressNo', {
              params: {
                'expressNo': this.expressForm.expressNo
              }
            }).then(function(response) {
              console.log(response)
              if (response.data.success != 1) {
                that.dialogVisible = false;
                that.noPrompt = response.data.msg
                that.dialogVisible3 = true
              } else {
                ordersDeliveryInsert(that.expressForm).then((res) => {
                  if (res.success === 1) {
                    that.$message.success(res.msg);
                    that.dialogVisible = false;
                    that.getTableData();
                  }
                });
              }
            })
            // checkExpressNo(this.expressForm).then((res) => {
            //   console.log(res)
            //   if (res.success != 1) {
            //     this.dialogVisible = false;
            //     this.noPrompt = res.msg
            //     this.dialogVisible3 = true
            //   } else {
            //     ordersDeliveryInsert(this.expressForm).then((res) => {
            //       if (res.success === 1) {
            //         this.$message.success(res.msg);
            //         this.dialogVisible = false;
            //         this.getTableData();
            //       }
            //     });
            //   }
            // })


          }
        });
      },

      handleDetermine() {
        ordersDeliveryInsert(this.expressForm).then((res) => {
          if (res.success === 1) {
            this.$message.success(res.msg);
            this.dialogVisible3 = false;
            this.getTableData();
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

  .invoice-img {
    width: 100px;
    height: 100px;
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    line-height: 100px;
    text-align: center;
    border: 1px solid #dcdfe6;
  }
</style>
