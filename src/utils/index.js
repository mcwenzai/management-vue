/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
      time = parseInt(time)
    }
    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    return value.toString().padStart(2, '0')
  })
  return time_str
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = url.split('?')[1]
  if (!search) {
    return {}
  }
  return JSON.parse(
    '{"' +
    decodeURIComponent(search)
      .replace(/"/g, '\\"')
      .replace(/&/g, '","')
      .replace(/=/g, '":"')
      .replace(/\+/g, ' ') +
    '"}'
  )
}

/**
 * Check if an element has a class
 * @param {HTMLElement} elm
 * @param {string} cls
 * @returns {boolean}
 */
export function hasClass(ele, cls) {
  return !!ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'))
}

/**
 * Add class to element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function addClass(ele, cls) {
  if (!hasClass(ele, cls)) ele.className += ' ' + cls
}

/**
 * Remove class from element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function removeClass(ele, cls) {
  if (hasClass(ele, cls)) {
    const reg = new RegExp('(\\s|^)' + cls + '(\\s|$)')
    ele.className = ele.className.replace(reg, ' ')
  }
}

export function debounce(func, wait, immediate) {
  let timeout, result
  const debounced = function(...args) {
    // 返回一个Promise，以便可以使用then或者Async/Await语法拿到原函数返回值
    return new Promise(resolve => {
      const context = this
      if (timeout) {
        clearTimeout(timeout)
      }
      if (immediate) {
        const callNow = !timeout
        timeout = setTimeout(() => {
          timeout = null
        }, wait)
        if (callNow) {
          result = func.apply(context, args)
          // 将原函数的返回值传给resolve
          resolve(result)
        }
      } else {
        timeout = setTimeout(() => {
          result = func.apply(context, args)
          // 将原函数的返回值传给resolve
          resolve(result)
        }, wait)
      }
    })
  }
  debounced.cancel = function() {
    clearTimeout(timeout)
    timeout = null
  }
  return debounced
}

export function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

export function timestampToTime(date, patttern = 'yyyy-mm-dd hh:mm:ss') {
  if (date === null || date === undefined) {
    return ''
  }
  date = new Date(date * 1000)
  const y = date.getFullYear()
  const m = formatNumber((date.getMonth() + 1))
  const d = formatNumber(date.getDate())
  const hh = formatNumber(date.getHours())
  const mm = formatNumber(date.getMinutes())
  const ss = formatNumber(date.getSeconds())
  if (patttern === 'yyyy-mm-dd hh:mm:ss') {
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
  } else if (patttern === 'mm-dd hh:mm') {
    return `${m}-${d} ${hh}:${mm}`
  } else if (patttern === 'yyyy-mm-dd hh:mm') {
    return `${y}-${m}-${d} ${hh}:${mm}`
  } else if (patttern === 'yyyy-mm-dd') {
    return `${y}-${m}-${d}`
  }
}

export function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

export function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]'
}

export function deepClone(obj) {
  let result
  if (typeof obj === 'object') {
    result = isArray(obj) ? [] : {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // null undefined RegExp Date等类型 都是可以直接赋值
        // 需要特殊处理的是数组和对象
        result[key] = (isObject(obj[key]) || isArray(obj[key]))
          ? deepClone(obj[key]) : obj[key]
      }
    }
  } else {
    result = obj
  }
  return result
}
