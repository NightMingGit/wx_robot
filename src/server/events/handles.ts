import type { msg } from '@server/type/type'

export const sign_handle = {
  type: 0,
  keys: ['测试', '测试2'],
  is_group: true,
  handle: (data: msg) => {
    console.log(data, 666)
  },
}
