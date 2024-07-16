import * as fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { Buffer } from 'node:buffer'
import protobuf from 'protobufjs'
import logger from '@server/logger'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import config from '@server/config'
import type { diffUser, lotteryList, msg } from '@server/type/type'
import request from 'axios'
import { getCurPath } from '@server/global'
import { sendImage, sendText } from '@server/api/system'
// import { updateScore } from "@server/services/user";

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

// 返回今日日期，格式为 YYYY-MM-DD hh:mm:ss
export function getDateTime() {
  return dayjs().format('YYYY-MM-DD HH:mm:ss')
}

// 返回今日0点和23:59:59
export function getTodayStartEnd() {
  const start = dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss')
  const end = dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss')
  return { start, end }
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

// 取上个月第一天至最后一天日期，格式为 YYYY-MM-DD 用dayjs
export function getLastMonthDate() {
  const start = dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD')
  const end = dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD')
  return { start, end }
}
// 取本周是第几天
export function getWeekDay() {
  const day = dayjs().day()
  if (day === 0) {
    return 7
  }
  return dayjs().day()
}

// 判断是否管理员
export function isAdmin(userId: string) {
  return config.adminUser.includes(userId)
}

export function findDifferences(arr1: diffUser[], arr2: diffUser[]) {
  const mapArr1 = new Map(
    arr1.map(item => [item.user_id + item.group_id, item]),
  )
  const uniqueInArr2: any[] = []
  const changedNames: { from: diffUser, to: diffUser }[] = []

  arr2.forEach((item2) => {
    const key = item2.user_id + item2.group_id
    const item1 = mapArr1.get(key)
    if (item1) {
      // 检查名字是否有变化
      if (item1.name !== item2.name) {
        changedNames.push({ from: item2, to: item1 })
      }
      mapArr1.delete(key)
    }
    else {
      // 在arr2中但不在arr1中
      uniqueInArr2.push(item2)
    }
  })

  return {
    changedNames,
    uniqueInArr2,
  }
}

// 从数组中随机取一个元素
export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

// 取出 xxx#  #后面的内容
export function getSuffix(str: string) {
  const index = str.indexOf('#')
  return index > -1 ? str.substring(index + 1) : ''
}

export function drawPrizes(
  participants: lotteryList[],
  numWinners: number,
): lotteryList[] {
  const winners: lotteryList[] = []
  const participantsCopy: lotteryList[] = [...participants] // 复制原数组以避免修改原始数据

  for (let i = 0; i < numWinners; i++) {
    if (participantsCopy.length === 0) {
      break // 如果参与者不够，提前退出循环
    }
    const randomIndex = Math.floor(Math.random() * participantsCopy.length) // 随机选取一个索引
    winners.push(participantsCopy[randomIndex]) // 将选中的参与者加入到中奖名单
    participantsCopy.splice(randomIndex, 1) // 从数组中移除已中奖的参与者
  }

  return winners // 返回中奖者名单
}

/**
 * 下载文件的函数
 * @param url 文件的URL地址
 * @param outputPath 输出文件的路径
 */
export async function downloadFile(
  url: string,
  outputPath: string,
): Promise<void> {
  try {
    const response = await request({
      method: 'GET',
      url,
      responseType: 'stream',
    })
    const writer = fs.createWriteStream(outputPath)

    response.data.pipe(writer)

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve)
      writer.on('error', reject)
    })
  }
  catch (error) {
    console.error('下载文件失败:', error)
    throw error
  }
}

export async function sendImgVideo(
  data: msg,
  url: string,
  type: 'png' | 'mp4',
) {
  // if (!data.userInfo) {
  //   await sendText("数据错误", data.from_id);
  //   return;
  // }

  // if (data.userInfo.score < config.gptScore) {
  //   await sendText(`穷逼不掏${config.gptScore}金币还想看涩图？`, data.from_id);
  //   return;
  // }
  try {
    const curPath = getCurPath('/downloads')
    const curNow = Date.now()
    await downloadFile(url, `${curPath}/${curNow}_.${type}`)
    // await updateScore(data.sender, data.roomid, -config.gptScore);
    await sendImage(`${curPath}/${curNow}_.${type}`, data.from_id)
  }
  catch (err) {
    await sendText('接口有限制，待会儿再看涩图', data.from_id)
  }
}
