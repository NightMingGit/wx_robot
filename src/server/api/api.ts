import { get } from '@server/request'

export function daily() {
  return get('http://api.yujn.cn/api/wenrou.php?', {})
}
// 降雨量
export function rainfall() {
  return get('http://api.yujn.cn/api/jiangyu.php?', {})
}

export function getText(url: string, payload = {}) {
  return get(url, payload)
}
