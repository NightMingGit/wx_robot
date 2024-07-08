import type { msg } from '@server/type/type'

let globalData: msg

export function setData(data: msg) {
  globalData = data
}
export function getData() {
  return globalData
}
