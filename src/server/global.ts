import path from 'node:path'
import type { msg } from '@server/type/type'

let globalData: msg
const active_group_ids: Array<string> = []

export function setData(data: msg) {
  globalData = data
}

export function getData() {
  return globalData
}

export function setActiveGroupIds(ids: Array<string>) {
  active_group_ids.length = 0
  active_group_ids.push(...ids)
}

export function getActiveGroupIds() {
  // 浅拷贝
  return [...active_group_ids]
}

export function getCurPath(filePath: string) {
  return path.resolve(`./src/server${filePath}`)
}
