<template>
  <div class="brand-admin">
    <el-container>
      <el-main>
        <div class="operate-part">
          <el-input v-model="queryParam.name" placeholder="搜索品牌" @input="searchDebounce" />
          <el-button type="primary" @click="addBrand" v-has-permission="'brand:insert'">新增品牌</el-button>
        </div>
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column prop="name" label="中文名" />
          <el-table-column prop="englishName" label="英文名" />
          <el-table-column label="Logo">
            <template slot-scope="scope">
              <el-image class="sample-img" :src="scope.row.logoUrl" fit="fill" />
            </template>
          </el-table-column>
          <el-table-column prop="enterprise" label="生产企业" />
          <el-table-column prop="productionAddress" label="生产地址" />
          <el-table-column label="状态">
            <template slot-scope="scope">
              <span>{{ keymap.getValue('BRAND_STATUS', scope.row.state) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" />
          <el-table-column prop="updater" label="更新人" />
          <el-table-column label="操作" width="220">
            <template slot-scope="scope">
              <el-button v-has-permission="'brand:list'" type="primary" size="mini" @click="see(scope.row)">查看</el-button>
              <el-button v-has-permission="'brand:delete'" type="primary" size="mini" @click="deleteBrand(scope.row)">删除</el-button>
              <el-button v-has-permission="'brand:updateStatus'" v-if="scope.row.state === BRAND_STATUS.STOP" type="primary" size="mini" @click="start(scope.row)">启用</el-button>
              <el-button v-has-permission="'brand:updateStatus'" v-if="scope.row.state === BRAND_STATUS.NORMAL" type="primary" size="mini" @click="stop(scope.row)">停用</el-button>
            </template>
          </el-table-column>
        </el-table>
        <br>
        <el-pagination :current-page="pagination.pageNum" :page-sizes="PAGE_SIZE_ARR" :page-size="pagination.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="totalPageNum" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </el-main>
    </el-container>
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" @close="detailDialogClose">
      <el-form ref="brandFormRef" :rules="rules" :model="form">
        <el-form-item label="中文名称:" :label-width="formLabelWidth" prop="name">
          <el-input v-if="!readOnly" v-model="form.name" :maxlength="50" placeholder="请输入中文名称" autocomplete="off" />
          <span v-else>{{ form.name }}</span>
        </el-form-item>
        <el-form-item label="英文名称:" :label-width="formLabelWidth" prop="englishName">
          <el-input v-if="!readOnly" v-model="form.englishName" :maxlength="50" placeholder="请输入英文名称" autocomplete="off" />
          <span v-else>{{ form.englishName }}</span>
        </el-form-item>
        <el-form-item label="Logo:" :label-width="formLabelWidth" prop="logoUrl">
          <template v-if="!readOnly">
            <el-input v-model="form.logoUrl" style="display: none" />
            <el-upload class="avatar-uploader" action="/admin/system/sysFile/uploadImg" :show-file-list="false" :on-success="(res,file)=>uploadSuccess(res,file,'logoUrl')" :before-upload="(file)=>uploadBefore(file,'img',3)">
              <el-tooltip class="item" effect="dark" content="点击可上传修改" placement="top" :enterable="false">
                <el-image v-if="form.logoUrl" class="sample-img" :src="form.logoUrl" fit="fill"/>
                <i v-else class="el-icon-plus avatar-uploader-icon" />
              </el-tooltip>
            </el-upload>
          </template>
          <template v-else>
            <el-image v-if="form.logoUrl" class="sample-img" :src="form.logoUrl" fit="fill" :preview-src-list="[form.logoUrl]" />
          </template>
        </el-form-item>
        <el-form-item label="生产企业:" :label-width="formLabelWidth" prop="enterprise">
          <el-input v-if="!readOnly" v-model="form.enterprise" :maxlength="50" placeholder="请输入企业名称" autocomplete="off" />
          <span v-else>{{ form.enterprise }}</span>
        </el-form-item>
        <el-form-item label="生产地址:" :label-width="formLabelWidth" prop="productionAddress">
          <el-input v-if="!readOnly" v-model="form.productionAddress" :maxlength="50" placeholder="请输入生产地址" autocomplete="off" />
          <span v-else>{{ form.productionAddress }}</span>
        </el-form-item>
        <el-form-item label="状态:" :label-width="formLabelWidth" prop="state">
          <el-radio-group v-model="form.state" :disabled="readOnly">
            <el-radio :label="BRAND_STATUS.NORMAL">启用</el-radio>
            <el-radio :label="BRAND_STATUS.STOP">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <template v-if="!readOnly">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="save">保 存</el-button>
        </template>
        <template v-else>
          <el-button type="primary" @click="dialogVisible = false">关 闭</el-button>
        </template>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { debounce } from '@/utils/index'
import { SEARCH_DEBOUNCE_TIME, PAGE_SIZE_ARR, BRAND_STATUS } from '@/utils/constant';
import { getBrandList, insertBrand, getBrandById, updateBrandStatus, deleteBrandById } from '@/api/goodsCenter'
import keymap from '@/utils/keymap'
export default {
  name: 'BrandAdmin',
  data() {
    const checkText = (rule, value, callback) => {
      const reg = /^[\u4e00-\u9fa5a-zA-Z0-9]+$/;
      if (!reg.test(value)) {
        return callback(new Error('仅支持中文、英文、数字'));
      } else {
        callback();
      }
    };
    return {
      PAGE_SIZE_ARR,
      BRAND_STATUS,
      keymap,
      queryParam: {
        name: ''
      },
      searchDebounce: null,
      pagination: {
        pageNum: 1,
        pageSize: 8
      },
      totalPageNum: 0,
      tableData: [],
      dialogVisible: false,
      formLabelWidth: '120px',
      form: {
        id: '',
        name: '',
        englishName: '',
        logoUrl: '',
        enterprise: '',
        productionAddress: '',
        state: BRAND_STATUS.NORMAL
      },
      rules: {
        name: [
          { required: true, message: '请输入中文名称', trigger: 'blur' },
          { max: 50, message: '长度最大50个字符', trigger: 'blur' },
          { validator: checkText, trigger: 'blur' }
        ],
        englishName: [
          { required: true, message: '请输入英文名称', trigger: 'blur' },
          { max: 100, message: '长度最大100个字符', trigger: 'blur' },
          { validator: checkText, trigger: 'blur' }
        ],
        logoUrl: [
          { required: true, message: '请上传图片', trigger: 'blur' }
        ],
        enterprise: [
          { required: true, message: '请输入企业名称', trigger: 'blur' },
          { max: 50, message: '长度最大50个字符', trigger: 'blur' },
          { validator: checkText, trigger: 'blur' }
        ],
        productionAddress: [
          { required: true, message: '请输入生产地址', trigger: 'blur' },
          { max: 50, message: '长度最大50个字符', trigger: 'blur' },
          { validator: checkText, trigger: 'blur' }
        ],
        state: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      },
      readOnly: false
    }
  },
  computed: {
    dialogTitle() {
      return this.readOnly ? '查看品牌' : '新增品牌'
    }
  },
  created() {
    this.getTableData()
    this.searchDebounce = debounce(this.handleConditionQuery, SEARCH_DEBOUNCE_TIME, false)
  },
  methods: {
    start(row) {
      this.$confirm('是否确定启用？', '启用', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await updateBrandStatus({
          id: row.id,
          state: this.BRAND_STATUS.NORMAL
        })
        this.getTableData()
      }).catch(() => {
        // do nothing
      })
    },
    stop(row) {
      this.$confirm('是否确定停用？', '停用', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await updateBrandStatus({
          id: row.id,
          state: this.BRAND_STATUS.STOP
        })
        this.getTableData()
      }).catch(() => {
        // do nothing
      })
    },
    resetForm() {
      this.form = {
        id: '',
        name: '',
        englishName: '',
        logoUrl: '',
        enterprise: '',
        productionAddress: '',
        state: this.BRAND_STATUS.NORMAL
      };
    },
    async see(row) {
      this.resetForm();
      this.readOnly = true
      this.dialogVisible = true
      const res = await getBrandById({ id: row.id })
      this.form = res.data
    },
    deleteBrand(row) {
      this.$confirm('是否确定删除？', '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await deleteBrandById({
          id: row.id
        })
        this.getTableData()
      }).catch(() => {
        // do nothing
      })
    },
    detailDialogClose() {
      this.form.id = ''
      this.readOnly = false
      setTimeout(() => {
        this.resetVerifyForm()
      }, 0)
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
        this.form[filedName] = res.data.url
      } else {
        this.$message({
          type: 'error',
          message: res.msg
        })
      }
    },
    resetVerifyForm() {
      this.$refs.brandFormRef.resetFields()
    },
    save() {
      this.$refs.brandFormRef.validate(async valid => {
        if (valid) {
          insertBrand(this.form).then((res) => {
            if (res.success === 1) {
              this.$message.success(res.msg);
              this.dialogVisible = false;
              this.getTableData();
            } else {
              this.$message.error(res.msg);
            }
          });
        }
      })
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
      const res = await getBrandList(this.queryParam)
      this.tableData = res.data.list
      this.totalPageNum = res.data.total
    },
    addBrand() {
      this.readOnly = false
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs.brandFormRef.resetFields();
      })
    }
  }
}

</script>
<style lang='scss' scoped>
.brand-admin {
  .operate-part {
    display: flex;
    justify-content: space-between;
    padding: 20px 0;
    .el-input {
      width: 200px;
    }
  }
}
.sample-img {
  width: 74px;
  height: 74px;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 74px;
  height: 74px;
  line-height: 74px;
  text-align: center;
  border: 1px solid #dcdfe6;
}
</style>
