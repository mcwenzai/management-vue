import {
  getRequest
} from '@/utils/request'
export const Mixins = {
  data() {
    return {
      uploadPercent: 0
    }
  },
  methods: {
    // 获取对应类型的字典内容
    getDictList(attrName, type) {
      var that = this
      getRequest('/system/sysDict/list', {
        type: type
      }).then(res => {
        that[attrName] = res.data
      })
    },
    /** 单个文件上传相关--开始*/
    uploadProgress(event, file, fileList) {
      this.uploadPercent = parseFloat(event.percent.toFixed(2))
    },
    /**
     * 上传之前
     * @param file element属性
     * @param type 文件类型
     * @param limit 文件大小限制
     * @returns {boolean}
     */
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
    /**
     * 上传成功后
     * @param res element属性
     * @param file element属性
     * @param filedName 设置属性的名字
     */
    uploadSuccess(res, file, filedName) {
      if (res.success === 1) {
        this.entity[filedName] = res.data.url
      } else {
        this.$message({
          type: 'error',
          message: res.msg
        })
      }
    }
    /** 单个文件上传相关--结束*/
  }
}
