import { constantRoutes } from "@/router";
import Layout from "@/layout";

const state = {
  routes: [],
  addRoutes: []
};

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes;
    state.routes = constantRoutes.concat(routes);
  },
  RESET_ROUTES: state => {
    state.addRoutes = [];
  }
};

const actions = {
  generateRoutes({ commit }, menus) {
    return new Promise(resolve => {
      //排序
      menus = menus.sort(function(a, b) {
        if (a.sort < b.sort) {
          return -1;
        } else if (a.sort > b.sort) {
          return 1;
        }
        return 0;
      });
      var res = generate(menus, 0);
      res.push(
        // 404 page must be placed at the end !!!
        { path: "*", redirect: "/404", hidden: true }
      );
      commit("SET_ROUTES", res);
      resolve(res);
    });
  },
  resetVuxRoutes({ commit }) {
    return new Promise(resolve => {
      commit("RESET_ROUTES");
      resolve();
    });
  }
};

/**
 * 生成动态菜单
 * @param menus
 * @param parentId
 * @returns {Array}
 */
function generate(menus, parentId) {
  let res = [];
  for (let menu of menus) {
    if (menu.type === 1 && parentId === menu.parentId) {
      let component = menu.component;
      let c;
      if (component == null) {
        c = Layout;
      } else {
        // 必须要这样写import才能动态加载 import(`@/views/${component}`) [某些浏览器不支持，改为require]
        c = resolve => require([`@/views/${component}`], resolve);
      }
      let route;
      //对于没有子菜单的一级菜单处理
      if (menu.parentId === 0 && component) {
        route = {
          path: menu.url,
          component: Layout,
          children: [
            {
              path: "index",
              component: c,
              name: menu.title,
              meta: {
                title: menu.title,
                icon: menu.icon
              }
            }
          ]
        };
      } else {
        route = {
          path: menu.url,
          component: c,
          name: menu.title,
          meta: {
            title: menu.title,
            icon: menu.icon
          },
          children: generate(menus, menu.id)
        };
      }

      res.push(route);
    }
  }

  return res;
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
