export default {
  data() {
    return {
      loadingInstance: null
    }
  },
  methods: {
    openFullScreenMixin(text = '加载中', lock = true, spinner = 'el-icon-loading') {
      this.loadingInstance = this.$loading({
        lock,
        text,
        spinner
      })
    },
    closeFullScreenMixin() {
      this.loadingInstance && this.loadingInstance.close()
      this.loadingInstance = null
    }
  }
}
