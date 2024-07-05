import { syncGroups } from '@server/events/common'
import type { msg } from '@server/type/type'

export const signHandle = {
  type: 0,
  keys: ['测试', '测试2'],
  is_group: true,
  handle: (data: msg) => {
    syncGroups(data)
  },
}
