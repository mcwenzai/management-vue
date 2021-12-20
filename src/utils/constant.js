export const BRAND_STATUS = {
  NORMAL: 0,
  STOP: 1
}
export const GOODS_STATUS = {
  USE: 0,
  STOP: 1
}
export const STORES_STATUS = {
  USE: 0,
  STOP: 1
}
export const STORES_MODEL_STATUS = {
  CLASSIFY: 0,
  BIGPIC: 1
}
export const CLIENT_TYPE_ID = {
  ANDROID: 0,
  IOS: 1
}

export const BANNER_CATEGORY_ISDISPLAY = {
  SHOW: 1,
  HIDDEN: 0
}

export const APP_ADMIN_TYPE = {
  CAROUSEL: 0,
  CATEGORY: 1
}

export const PAGE_SIZE_ARR = [10, 20, 50]

export const VERIFY_REASON_TYPE = {
  MEDICAL: 1,
  BUYER: 2,
  CARD: 3
}

export const OPERATE_QUALIFICATION_TYPE = {
  LOOK: 0,
  CHECK: 1,
  EDIT: 2
}

export const BUYER_QUALIFICATION_STATUS = [{
    value: 0,
    label: '正常'
  },
  {
    value: 1,
    label: '异常'
  }
]

export const SEARCH_DEBOUNCE_TIME = 800

export const CLIENT_TYPE = [
  {
    value: '',
    label: '全部'
  },
  {
  value: 0,
  label: 'Android'
}, {
  value: 1,
  label: 'IOS'
}]

export const BANNER_JUMP_TYPE = [{
  value: 0,
  label: 'nav导航'
}, {
  value: 1,
  label: 'view页面'
}, {
  value: 2,
  label: 'h5外部页面'
}, {
  value: 3,
  label: '小程序'
}]

export const QUALIFICATION_STATUS = [
  {
    value: null,
    label: '全部'
  },{
  value: 0,
  label: '待审核'
}, {
  value: 1,
  label: '正常'
}, {
  value: 2,
  label: '审核未通过'
}, {
  value: 3,
  label: '即将过期'
}, {
  value: 4,
  label: '已过期'
}]

export const QUALIFICATION_CHECK_STATUS = [{
  value: 0,
  label: '待审核'
}, {
  value: 1,
  label: '已通过'
}, {
  value: 2,
  label: '未通过'
}]

export const GOODS_EDIT_STATUS = [{
  value: 0,
  label: '编辑中'
}, {
  value: 1,
  label: '已上架'
}, {
  value: 2,
  label: '未下架'
}]

export const GOODS_STATUS2 = [{
  value: 0,
  label: '启用'
}, {
  value: 1,
  label: '停用'
}]

export const GOODS_TYPE = [{
  value: 0,
  label: '成药'
}, {
  value: 1,
  label: '颗粒'
}, {
  value: 2,
  label: '饮片'
}]

export const GOODS_TAG = [{
  value: 0,
  label: '热卖'
}, {
  value: 1,
  label: '爆款'
}, {
  value: 2,
  label: '精品'
}]

export const ORDER_STATUS = [{
  value: 0,
  label: '待付款'
}, {
  value: 1,
  label: '已取消'
}, {
  value: 2,
  label: '已支付'
}, {
  value: 3,
  label: '已发货'
}, {
  value: 4,
  label: '已完成'
}]

export const INVOICE_TYPE = [{
  value: 0,
  label: '纸质票'
}, {
  value: 1,
  label: '电子票'
}, {
  value: 2,
  label: '图片'
}]

export const INVOICE_STATUS = [{
  value: 0,
  label: '待发货'
}, {
  value: 1,
  label: '已发货'
}, {
  value: 2,
  label: '已收货'
}]

export const FINANCE_TYPE = [{
  value: 1,
  label: '采购支付'
}, {
  value: 2,
  label: '微信手续费'
}, {
  value: 3,
  label: '运费'
}]

export const FINANCE_STATUS = [{
  value: 0,
  label: '待支付'
}, {
  value: 1,
  label: '已支付'
}, {
  value: 2,
  label: '支付失败'
}]
