import axios from 'axios'
import Cookies from 'js-cookie'

const service = axios.create({
  baseURL: '/api'
})

service.interceptors.request.use(config => {
  const token = Cookies.get('csrfToken')
  config.headers['x-csrf-token'] = token
  return config
})

const install = Vue => {
  Vue.prototype.$http = service
}

export default { install }
