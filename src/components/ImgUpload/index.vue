<template>
  <div class="uploadWrapper">
    <vuedraggable
      class="vue-draggable"
      :class="{ single: isSingle, maxHidden: isMaxHidden }"
      v-model="imgList"
      tag="ul"
      draggable=".draggable-item"
      @start="onDragStart"
      @end="onDragEnd"
    >
      <!-- 拖拽元素 -->
      <li
        v-for="(item, index) in imgList"
        :key="item + index"
        class="draggable-item"
        :style="{ width: width + 'px', height: height + 'px' }"
      >
        <el-image :src="item.url" :preview-src-list="[item.url]"></el-image>
        <div class="shadow" @click="onRemoveHandler(index)">
          <i class="el-icon-delete"></i>
        </div>
      </li>
      <!-- 上传按钮 -->
      <el-upload
        slot="footer"
        ref="uploadRef"
        class="uploadBox"
        :style="{ width: width + 'px', height: height + 'px' }"
        action="/admin/system/sysFile/uploadImg"
        accept=".jpg,.jpeg,.png"
        :show-file-list="false"
        :multiple="!isSingle"
        :limit="limit"
        :before-upload="beforeUpload"
        :on-success="onSuccessUpload"
        :on-exceed="onExceed"
      >
        <i class="el-icon-plus uploadIcon">
          <span class="uploading" v-show="isUploading">正在上传...</span>
          <span
            v-if="!isUploading && limit && limit !== 99 && !isSingle"
            class="limitTxt"
            >最多{{ limit }}张</span
          >
        </i>
      </el-upload>
    </vuedraggable>
  </div>
</template>

<script>
  import vuedraggable from 'vuedraggable';
  export default {
    props: {
      // 图片数据(图片url组成的数组) 通过v-model传递
      value: {
        type: Array,
        default () {
          return []
        }
      },
      // 限制上传的图片数量
      limit: {
        type: Number,
        default: 9
      },
      // 限制上传图片的文件大小(kb)
      size: {
        type: Number,
        default: 3 * 1024
      },
      // 是否是单图上传(单图上传就是已传图片和上传按钮重叠)
      isSingle: {
        type: Boolean,
        default: false
      },
      // 是否使用图片压缩
      useCompress: {
        type: Boolean,
        default: false
      },
      // 图片显示的宽度(px)
      width: {
        type: Number,
        default: 148
      },
      // 图片显示的高度(px)
      height: {
        type: Number,
        default: 148
      }
    },
    data () {
      return {
        isUploading: false, // 正在上传状态
        isFirstMount: true // 控制防止重复回显
      }
    },
    computed: {
      // 图片数组数据
      imgList: {
        get () {
          return this.value
        },
        set (val) {
          if (val.length < this.imgList.length) {
            // 判断是删除图片时同步el-upload数据
            this.syncElUpload(val)
          }
          // 同步v-model
          this.$emit('input', val)
        }
      },
      // 控制达到最大限制时隐藏上传按钮
      isMaxHidden () {
        return this.imgList.length >= this.limit
      }
    },
    watch: {
      value: {
        handler (val) {
          if (this.isFirstMount && this.value.length > 0) {
            this.syncElUpload()
          }
        },
        deep: true
      }
    },
    mounted () {
      if (this.value.length > 0) {
        this.syncElUpload()
      }
    },
    methods: {
      createUniqueString () {
        const timestamp = +new Date() + ''
        const randomNum = parseInt((1 + Math.random()) * 65536) + ''
        return (+(randomNum + timestamp)).toString(32)
      },
      /**
       * 数字存储大小格式化
       * @param {number} num 存储大小 单位：Byte
       * @param {number} digits 保留几位小数
       * @return {string} 2MB
       */
      toStorage (num, digits) {
        digits = digits || 2
        if (num < 1024) {
          return num + 'B'
        }
        num = (num * 1000 / 1024)
        const si = [
          { value: 1E18, symbol: 'E' },
          { value: 1E15, symbol: 'P' },
          { value: 1E12, symbol: 'T' },
          { value: 1E9, symbol: 'G' },
          { value: 1E6, symbol: 'M' },
          { value: 1E3, symbol: 'K' }
        ]
        for (let i = 0; i < si.length; i++) {
          if (num >= si[i].value) {
            return (num / si[i].value).toFixed(digits).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, '$1') +
              si[i].symbol + 'B'
          }
        }
      },
      validImgUpload(file, size) {
        size = +size || 10240
        const isSizeOut = file.size / 1024 > size
        if (file.size / 1024 > size) {
          this.$message.error('上传图片大小不能超过' + this.toStorage(size * 1024))
        }
        return !isSizeOut
      },
      // 同步el-upload数据
      syncElUpload (val) {
        const imgList = val || this.imgList;
        this.$refs.uploadRef.uploadFiles = imgList.map((v, i) => {
          return {
            name: 'pic' + i,
            url: v,
            status: 'success',
            uid: this.createUniqueString()
          }
        })
        this.isFirstMount = false
      },
      // 上传图片之前
      beforeUpload (file) {
        this.isFirstMount = false
        if (this.validImgUpload(file, this.size)) {
          this.isUploading = true
          return true
        } else {
          return false
        }
      },
      // 上传完单张图片
      onSuccessUpload (res, file, fileList) {
        // 这里需要根据你自己的接口返回数据格式和层级来自行修改
        if (res.data) {
          // 判断接口上传成功
          if (this.imgList.length < this.limit) {
            // 未超限时，把接口返回的图片url地址添加到imgList
            this.imgList.push({
              url: res.data.url
            })
            this.$emit('validate');
          }
        } else {
          // 判断接口上传失败
          this.syncElUpload()
          this.$message({ type: 'error', message: res.msg })
        }
        this.isUploading = false
      },
      // 移除单张图片
      onRemoveHandler (index) {
        this.$confirm('确定删除该图片?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.imgList = this.imgList.filter((v, i) => {
              return i !== index
            })
            this.$emit('validate');
          })
          .catch(() => {})
      },
      // 超限
      onExceed () {
        this.$refs.uploadRef.abort() // 取消剩余接口请求
        this.syncElUpload()
        this.$message({
          type: 'warning',
          message: `图片超限，最多可上传${this.limit}张图片`
        })
      },
      onDragStart (e) {
        e.target.classList.add('hideShadow')
      },
      onDragEnd (e) {
        e.target.classList.remove('hideShadow')
      }
    },
    components: { vuedraggable }
  }
</script>

<style lang="scss" scoped>
::v-deep .el-upload {
  width: 100%;
  height: 100%;
}

// 上传按钮
.uploadIcon {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #c0ccda;
  background-color: #fbfdff;
  border-radius: 6px;
  font-size: 20px;
  color: #999;

  .limitTxt,
  .uploading {
    position: absolute;
    bottom: 10%;
    left: 0;
    width: 100%;
    font-size: 14px;
    text-align: center;
  }
}

// 拖拽
.vue-draggable {
  display: flex;
  flex-wrap: wrap;

  .draggable-item {
    margin-right: 5px;
    margin-bottom: 5px;
    border: 1px solid #ddd;
    border-radius: 6px;
    position: relative;
    overflow: hidden;

    .el-image {
      width: 100%;
      height: 100%;
    }
    .shadow {
      position: absolute;
      top: 0;
      right: 0;
      background-color: rgba(0, 0, 0, 0.5);
      opacity: 0;
      transition: opacity 0.3s;
      color: #fff;
      font-size: 20px;
      line-height: 20px;
      padding: 2px;
      cursor: pointer;
    }
    &:hover {
      .shadow {
        opacity: 1;
      }
    }
  }
  &.hideShadow {
    .shadow {
      display: none;
    }
  }
  &.single {
    overflow: hidden;
    position: relative;

    .draggable-item {
      position: absolute;
      left: 0;
      top: 0;
      z-index: 1;
    }
  }
  &.maxHidden {
    .uploadBox {
      display: none;
    }
  }
}
// el-image
.el-image-viewer__wrapper {
  .el-image-viewer__mask {
    opacity: 0.8;
  }
  .el-icon-circle-close {
    color: #fff;
  }
}
</style>
