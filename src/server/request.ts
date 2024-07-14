import axios from 'axios'
import logger from '@server/logger'

function createService() {
  const service = axios.create({
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 5000000,
    // eslint-disable-next-line node/prefer-global/process
    baseURL: process.env.NODE_ENV === 'dev' ? 'http://192.168.3.19:10010' : 'http://127.0.0.1:10010',
  })
  service.interceptors.request.use(
    (config) => {
      // console.log("config==>", config);
      return config
    },
    (error) => {
      logger.error(`[request error] ${error}`)
      return Promise.reject(error)
    },
  )
  service.interceptors.response.use(
    (response) => {
      const { data } = response
      return data
    },
    (error) => {
      logger.error(`[response error] ${error}`)
      return Promise.reject(error)
    },
  )
  return service
}

const service = createService()

// 封装post方法
async function post(url: string, data: any, config: any = {}): Promise<any> {
  return await service.post(url, data, config)
}

// 封装get方法
async function get(url: string, params: any): Promise<any> {
  return await service.get(url, { params })
}

// 导出封装好的函数
export { post, get }
