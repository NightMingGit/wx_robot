import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { Buffer } from 'node:buffer'
import protobuf from 'protobufjs'
import logger from '@server/logger'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import config from '@server/config'

dayjs.locale('zh-cn')

export async function parseProtobuf(wxRoomData: string) {
  try {
    // 获取文件和目录路径
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const projectRoot = dirname(__dirname)
    const protoPath = join(projectRoot, 'roomdata.proto')

    // 加载 protobuf 文件
    const root = await protobuf.load(protoPath)
    const roomData = root.lookupType('com.iamteer.wcf.RoomData')

    // 解析 Base64 编码的数据
    const wxRoomDataBuffer = Buffer.from(wxRoomData, 'base64')
    const crd = roomData.decode(wxRoomDataBuffer)

    // 转换为 JavaScript 对象
    return roomData.toObject(crd, {
      longs: String,
      enums: String,
      bytes: String,
    })
  }
  catch (err) {
    logger.error(`Error parsing protobuf: ${err}`)
    throw err
  }
}

// 返回今日日期，格式为 YYYY-MM-DD 用dayjs
export function getTodayDate() {
  return dayjs().format('YYYY-MM-DD')
}

// 取本周一至周日日期，格式为 YYYY-MM-DD 用dayjs
export function getWeekDate() {
  const start = dayjs().startOf('week').format('YYYY-MM-DD')
  const end = dayjs().endOf('week').format('YYYY-MM-DD')
  return { start, end }
}

// 取本月第一天至最后一天日期，格式为 YYYY-MM-DD 用dayjs
export function getMonthDate() {
  const start = dayjs().startOf('month').format('YYYY-MM-DD')
  const end = dayjs().endOf('month').format('YYYY-MM-DD')
  return { start, end }
}

// 判断是否管理员
export function isAdmin(userId: string) {
  return config.adminUser.includes(userId)
}
