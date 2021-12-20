import Vue from 'vue'
import 'normalize.css/normalize.css' // A modern alternative to CSS resets
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import {hasPermission} from '@/utils/permissionUtil'
import {getRequest,getFile,postRequest,postJson} from '@/utils/request'
import '@/styles/index.scss' // global css
import App from './App'
import store from './store'
import router from './router'
import '@/icons' // icon
import '@/permission' // permission control

Vue.use(ElementUI);
//按钮控制
Vue.use(hasPermission);
Vue.config.productionTip = false;

//请求封装
Vue.prototype.$get=getRequest;
Vue.prototype.$getFile=getFile;
Vue.prototype.$post=postRequest;
Vue.prototype.$postJson=postJson;

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
});
