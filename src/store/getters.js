const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  permission_routes: state => state.permission.routes,
  addRoutes:state=>state.permission.addRoutes,
  userInfo: state => state.user.userInfo
}
export default getters
