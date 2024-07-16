import { get } from '@server/request'

export function eat() {
  return get(
    'https://api.yujn.cn/api/chi.php?type=json',
    {},
  )
}
export function daily() {
  return get(
    'https://api.yujn.cn/api/dujitang.php',
    {},
  )
}
// 降雨量
export function rainfall() {
  return get(
    'http://api.yujn.cn/api/jiangyu.php?',
    {},
  )
}
