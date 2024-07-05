import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { Buffer } from 'node:buffer'
import protobuf from 'protobufjs'
import logger from '@server/logger'

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
