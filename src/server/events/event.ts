import { handles } from '@server/events/handles'
import { joinGroup } from '@server/events/common'
import { getUserInfo } from '@server/services/user'
import type { event, msg } from '../type/type'

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

async function triggerEvent(data: msg) {
  data.from_id = data.is_group ? data.roomid : data.sender
  // 如果是群里把user信息挂载到data上
  if (data.is_group && !data.userInfo) {
    const user = await getUserInfo(data.sender, data.roomid)
    data.userInfo = user?.toJSON() || {}
  }
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
