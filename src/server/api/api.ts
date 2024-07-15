import { get } from '@server/request'

export function eat() {
  return get(
    'https://api.yujn.cn/api/chi.php?type=json',
    {},
  )
}
