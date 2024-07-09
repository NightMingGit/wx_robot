import { handles } from '@server/events/handles'
import { isGroupActive, joinGroup, mountUserInfo, switchGroup } from '@server/events/common'
import { setData } from '@server/global'
import type { event } from '../type/type'

const events: event[] = [
  ...handles,
]

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

async function triggerEvent(data: string) {
  // 处理开关群事件
  await switchGroup(data)
  // 判断是否开启了群聊
  if (!isGroupActive(data.roomid))
    return
  data.from_id = data.is_group ? data.roomid : data.sender
  // 设置一个全局数据 可能给别的地方使用
  setData(data)

  // 如果是群里把user信息挂载到data上
  await mountUserInfo(data)
  // 新人进群
  joinGroup(data)
  // todo 消息计数
  // todo @机器人 gpt
  for (const event of events) {
    if (event.is_group === data.is_group || !event.is_group) {
      if (matches(event, data.content!)) {
        event.handle(data)
        return
      }
    }
  }
}

export {
  triggerEvent,
}
