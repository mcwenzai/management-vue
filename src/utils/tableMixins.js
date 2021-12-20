import { postJson } from "@/utils/request";
export const tableMixins = {
  data() {
    return {
      // 总条数
      totalNum: 0,
      // 每页显示条数
      pageSize: 10,
      // 当前处于第几页
      pageNum: 1,
      // 表格数据
      tableData: [],
      // 表格加载动画是否开启
      tableLoading: false
    };
  },

  methods: {
    // 获取表格数据
    async getTableData() {
      // 定义请求参数
      this.tableLoading = true;

      let queryParams = null;

      if (this.dealSearchInfo) {
        queryParams = this.dealSearchInfo();
      } else {
        queryParams = { ...this.queryParams };
      }

      let obj = Object.assign(
        {
          pageSize: this.pageSize,
          pageNum: this.pageNum
        },
        queryParams
      );

      // 去掉请求参数中无效值
      for (let key in obj) {
        if (!obj[key]) {
          delete obj[key];
        }
      }

      // console.log(obj, "queryParam");

      // 请求后台数据
      let res = await postJson(this.tableUrl, obj);
      // console.log(res, this.tableUrl, obj);
      if (!res || res.success !== 1) return (this.tableLoading = false);
      let list = res.data.list;
      // 如果表格数据需要处理，就处理
      if (this.dealTableData) {
        list = this.dealTableData(list);
      }
      // console.log(list);
      this.tableData = list;
      this.totalNum = res.data.total;
      this.$nextTick(() => {
        this.tableLoading = false;
      });
    },
    // 切换每页显示数量获取数据
    changePageSize(size) {
      this.pageSize = size;
      this.pageNum = 1;
      // 重新获取表格数据
      this.getTableData();
    },
    // 切换当前页获取数据
    changePageNum(num) {
      this.pageNum = num;
      // 重新获取表格数据
      this.getTableData();
    },
    // 删除某一行表格数据
    deleteRow(id) {
      // console.log(id);
      this.$confirm("此操作将永久删除该条数据, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$get(this.deleteRowUrl + id).then(res => {
            // console.log(res);
            if (!res || res.success !== 1)
              return this.$message.error("删除失败");
            this.$message.success("删除成功!");
            this.getTableData();
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    // 搜索
    searchData() {
      this.pageNum = 1;
      this.pageSize = 10;
      this.getTableData();
    }
  }
};
