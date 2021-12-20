import Vue from 'vue'
import Clipboard from 'clipboard'

function clipboardSuccess(text) {
  Vue.prototype.$message({
    message: '已复制：'+text,
    type: 'success',
    duration: 1500
  })
}

function clipboardError() {
  Vue.prototype.$message({
    message: 'Copy failed',
    type: 'error'
  })
}

export default function handleClipboard(text, event) {
  const clipboard = new Clipboard(event.target, {
    text: () => text
  })
  clipboard.on('success', () => {
    clipboardSuccess(text)
    clipboard.destroy()
  })
  clipboard.on('error', () => {
    clipboardError()
    clipboard.destroy()
  })
  clipboard.onClick(event)
}
