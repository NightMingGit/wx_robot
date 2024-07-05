import type { msg } from '@server/type/type'
import { sendText } from '@server/api/system'

export const signHandle = {
  type: 0,
  keys: ['测试', '测试2'],
  is_group: true,
  handle: (data: msg) => {
    sendText('测试成功', data.from_id)
  },
}
