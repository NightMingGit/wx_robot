import type { response } from '@server/type/type'
import request from '../request'

export function sendText(msg: string, receiver: string, aters: string = '') {
  return request<response>({
    url: '/text',
    method: 'POST',
    data: {
      aters,
      msg,
      receiver,
    },
  })
}
