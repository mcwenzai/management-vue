//增删改查
import {getRequest,postRequest} from '@/utils/request'
export const baseMixins = {
  data(){
    return{
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
  methods:{
    addOrUpdate(row) {
      var entity = row ? row : null;
      this.$refs.entityModal.openModal(entity);
    },
    deleteRecord(primaryKey) {
      this.$confirm('确定删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true;
            this.$get(this.deleteUrl+'?id='+primaryKey).then(res => {
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
      Object.assign(that.queryParam, that.pagination);
      that.$get(that.listUrl, that.queryParam).then(res => {
        that.loading = false;
        that.tableData = res.data.list;
        that.total = res.data.total
      })
    },
    handleSizeChange(val) {
      this.pagination.pageNum = 1;
      this.pagination.pageSize = val;
      this.getList()
    },
    handleCurrentChange(val) {
      this.pagination.pageNum = val;
      this.getList()
    }
  }
}
