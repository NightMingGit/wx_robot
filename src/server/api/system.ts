import { get, post } from '@server/request'

export function sendText(msg: string, receiver: string, aters: string = '') {
  return post('/text', {
    msg,
    receiver,
    aters,
  })
}
export function sendImage(path: string, receiver: string) {
  return post('/image', {
    path,
    receiver,
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
  return get('https://api.yujn.cn/api/kemu.php?type=json', {})
}

export function sendBody(data: any) {
  return post('http://127.0.0.1:5000', data)
}
