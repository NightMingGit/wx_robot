import { handles } from '@server/events/handles'
import {
  isGroupActive,
  joinGroup,
  mountUserInfo,
  msgCount,
  switchGroup,
  useGpt,
} from '@server/events/common'
import { setData } from '@server/global'
import { allowRespTypes } from '@server/type/msgTypes'
import { isAdmin } from '@server/utils/utils'
import { sendText } from '@server/api/system'
import config from '@server/config'
import { updateScore } from '@server/services/user'
import type { event, msg } from '../type/type'

const events: event[] = [...handles]

function matches(event: event, content: string): boolean {
  if (event.type === 0) {
    // 全词匹配
    return event.keys.includes(content)
  }
  else if (event.type === 1) {
    // 模糊匹配
    return event.keys.some(key => content.includes(key))
  }
  return false
}

async function triggerEvent(data: msg) {
  // 处理开关群事件
  await switchGroup(data)
  // 判断是否开启了群聊
  if (!isGroupActive(data.roomid))
    return
  data.from_id = data.is_group ? data.roomid : data.sender
  // 设置一个全局数据 可能给别的地方使用
  setData(data)
  // 新人进群
  joinGroup(data)
  // 消息计数
  await msgCount(data)
  // todo @机器人 gpt
  useGpt(data)
  // 如果是群里把user信息挂载到data上
  await mountUserInfo(data)
  for (const event of events) {
    // 检查事件是否适用于当前消息类型
    if (!(event.is_group === data.is_group || !event.is_group)) {
      continue
    }

    // 检查内容是否匹配
    if (!matches(event, data.content!)) {
      continue
    }

    // 检查响应类型是否被允许
    if (!allowRespTypes.includes(data.type)) {
      continue
    }

    // 判断是否需要管理员权限
    if (event.isAdmin && !isAdmin(data.sender)) {
      await sendText(config.adminText, data.from_id)
      continue
    }

    // 判断是否需要扣金币
    if (event.score) {
      if (!data.userInfo) {
        await sendText('暂未找到该用户', data.from_id)
        continue
      }

      if (data.userInfo.score < event.score) {
        await sendText('金币不足', data.from_id)
        continue
      }
    }

    // 处理事件
    const result = await event.handle(data)
    if (result && event.score) {
      // 扣除金币
      await updateScore(data.sender, data.from_id, -event.score)
    }
  }
}

export { triggerEvent }
