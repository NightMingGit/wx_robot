import { post } from '@server/request'

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
