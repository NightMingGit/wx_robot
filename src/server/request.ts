import axios from 'axios'
import logger from '@server/logger'
import { getData } from '@server/global'
import { sendText } from '@server/api/system'

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
async function post(url: string, data: any): Promise<any> {
  try {
    return await service.post(url, data)
  }
  catch (error) {
    sendError(url)
    logger.error(`POST request to ${url} failed: ${error}`)
  }
}

// 封装get方法
async function get(url: string, params: any): Promise<any> {
  try {
    return await service.get(url, { params })
  }
  catch (error) {
    sendError(url)
    logger.error(`GET request to ${url} failed: ${error}`)
  }
}

function sendError(url: string) {
  // 机器人自身接口不使用 防止无限循环
  const whiteList = ['/text', '/sql', '/delete-chatroom-member', '/file', '/image', '/rich-text']
  if (whiteList.includes(url))
    return
  const data = getData()
  sendText(`${url}接口异常，请稍后再试`, data.from_id)
}

// 导出封装好的函数
export { post, get }
