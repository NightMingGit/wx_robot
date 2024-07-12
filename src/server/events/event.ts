import { handles } from '@server/events/handles'
import { isGroupActive, joinGroup, mountUserInfo, msgCount, switchGroup } from '@server/events/common'
import { setData } from '@server/global'
import { allowRespTypes } from '@server/type/msgTypes'
import { isAdmin } from '@server/utils/utils'
import { sendText } from '@server/api/system'
import config from '@server/config'
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
  // 消息计数
  msgCount(data)
  // todo @机器人 gpt
  for (const event of events) {
    if (event.is_group === data.is_group || !event.is_group) {
      if (matches(event, data.content!)) {
        if (allowRespTypes.includes(data.type)) {
          // 判断是不是需要管理员
          if (event.isAdmin && !isAdmin(data.sender)) {
            await sendText(config.adminText, data.from_id)
          }
          else {
            event.handle(data).then((res) => {
              console.log(res)
            })
          }
        }
      }
    }
  }
}

export {
  triggerEvent,
}
