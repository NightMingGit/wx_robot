import axios from 'axios'
import logger from '@server/logger'

function createService() {
  const service = axios.create({
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 5000000,
    // baseURL: 'http://192.168.3.19:10010',
    baseURL: 'http://127.0.0.1:10010',
  })
  service.interceptors.request.use(
    (config) => {
      return config
    },
    (error) => {
      logger.error(`[request error] ${error}`)
      Promise.reject(error)
    },
  )
  service.interceptors.response.use(
    (response) => {
      const { data } = response
      return data
    },
    (error) => {
      logger.error(`[response error] ${error}`)
      Promise.reject(error)
    },
  )
  return service
}

const service = createService()

export default service
