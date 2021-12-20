export default {
  ClientKeyMap: {
    USER_TYPE: {
      0: '普通用户',
      1: '医疗机构',
      2: '游客'
    },
    ORGAN_TYPE: {
      0: '医疗机构'
    },
    QUALIFICATION_STATUS: {
      0: '待审核',
      1: '审核通过',
      2: '审核未通过',
      3: '即将过期',
      4: '已过期'
    },
    CHECK_STATUS: {
      0: '待审核',
      1: '已通过',
      2: '未通过'
    },
    BUYER_QUALIFICATION_STATUS: {
      0: '正常',
      1: '异常 '
    },
    USER_STATUS: {
      0: '启用',
      1: '停用'
    },
    INDEX_BANNER_ISDISPLAY: {
      0: '隐藏',
      1: '展示'
    },
    CLIENT_TYPE: {
      0: 'Android',
      1: 'IOS'
    },
    WORK_STATUS: {
      0: '在职',
      1: '停职',
      2: '离职'
    },
    BRAND_STATUS: {
      0: '启用',
      1: '停用'
    },
    DEPARTMENT_STATUS: {
      0: '启用',
      1: '停用'
    },
    GOODS_TYPE: {
      0: '成药',
      1: '颗粒',
      2: '饮片'
    },
    PAY_TYPE: {
      0: '微信',
      1: '支付宝',
    },
    IS_SPLIT: {
      0: '否',
      1: '是'
    },
    ORDER_STATUS: {
      0: '待付款',
      1: '已取消',
      2: '已支付',
      3: '已发货',
      4: '已完成'
    },
    INVOICE_STATUS: {
      0: '待发货',
      1: '已发货',
      2: '已收货',
    },
    EXPRESS_STATUS: {
      0: '在途',
      1: '揽收',
      2: '疑难',
      3: '签收',
      4: '退签',
      5: '派件',
      6: '退回',
      7: '转投',
      8: '清关',
      14: '拒签',
    },
    BIND_EMPLOYEE: {
      0: '否',
      1: '是'
    },
    // perTypeList: [{
    //   value: '1',
    //   label: '销售业绩'
    // }, {
    //   value: '0',
    //   label: '结算业绩'
    // }],
    PERFORMANCE_TYPE: {
      1: '销售业绩',
      0: '结算业绩'
    }
  },
  /**
   * 返回字典值
   * @param t 类型
   * @param k 键
   * @returns string
   */
  getValue(t, k) {
    if (k === undefined) {
      return ''
    }
    if (this.ClientKeyMap[t] === undefined || this.ClientKeyMap[t][k] === undefined) {
      return ``
    }
    return this.ClientKeyMap[t][k]
  }
}
