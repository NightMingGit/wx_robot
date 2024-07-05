import { sign_handle } from '@server/events/handles'
import type { event, msg } from '../type/type'

const events: event[] = [
  sign_handle,
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

function trigger_event(data: msg) {
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
  trigger_event,
}
