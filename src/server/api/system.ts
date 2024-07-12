import { get, post } from '@server/request'

export function sendText(msg: string, receiver: string, aters: string = '') {
  return post('/text', {
    msg,
    receiver,
    aters,
  })
}
export function sql(db: string, sql: string) {
  return post('/sql', {
    db,
    sql,
  })
}
// 机器人信息
export function userinfo() {
  return get('/userinfo', {})
}
export function test() {
  return get('/test', {})
}
