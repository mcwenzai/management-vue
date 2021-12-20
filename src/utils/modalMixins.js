//模态框
export const modalMixins = {
  data() {
    return {
      visible: false,
      sendLoading:false,
      title:'',
      requestUrl:'',
      entity:{},
      //是否是新增记录
      isAdd:true,
    }
  },
  methods: {
    submit(formName){
      var that = this;
      this.$refs[formName].validate((valid) => {
        if (valid) {
          that.sendLoading = true;
          that.$post(that.requestUrl,that.entity).then(res=>{
            that.sendLoading = false;
            if(res.success===1){
              this.$message({
                type: 'success',
                message: res.msg
              });
              that.visible = false;
              that.$emit('reload')
            }
          })
        }
      });
    },
    handleClose(done) {
      this.visible = false;
      done()
    }
  }
}
