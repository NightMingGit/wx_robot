import request from '../request'

export function sendText(msg: string, receiver: string, aters: string = '') {
  return request({
    url: '/text',
    method: 'POST',
    data: {
      aters,
      msg,
      receiver,
    },
  })
}
export function sql(db: string, sql: string) {
  return request({
    url: '/sql',
    method: 'POST',
    data: {
      db,
      sql,
    },
  })
}
