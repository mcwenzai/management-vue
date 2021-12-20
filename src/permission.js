import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  const userInfoStr = localStorage.getItem('userInfo')
  const userInfo = JSON.parse(userInfoStr);
  if (userInfo) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done()
    } else {
      const menus = store.getters.addRoutes.length > 0;
      if (menus) {
        next()
      } else {
        try {
          const accessRoutes = await store.dispatch('permission/generateRoutes',userInfo.menus)
          // dynamically add accessible routes
          router.addRoutes(accessRoutes)
          // hack method to ensure that addRoutes is complete
          // set the replace: true, so the navigation will not leave a history record
          next({ ...to, replace: true })
        } catch (error) {
          next(`/login?redirect=${to.path}`);
          NProgress.done()
        }
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?type=reLogin&redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
