import { login, logout } from '@/api/user'
import { resetRouter } from '@/router'
import store from '@/store'

const getDefaultState = () => {
  return {
    userInfo:{}
  }
}

const state = getDefaultState()

const mutations = {
  SET_USER_INFO:(state,userInfo) => {
    state.userInfo = userInfo
  },
  RESET_STATE: (state) => {
    state.addRoutes = []
    Object.assign(state, getDefaultState())
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    return new Promise((resolve, reject) => {
      login(userInfo).then(response => {
        const { data } = response;
        localStorage.setItem('userInfo',JSON.stringify(data))
        commit('SET_USER_INFO', data);
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },
  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout().then(() => {
        localStorage.removeItem('userInfo');
        store.dispatch('permission/resetVuxRoutes')
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

