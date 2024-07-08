import { createClient } from 'redis'

const client = await createClient({
  url: 'redis://127.0.0.1:6379',
})
  .on('error', err => console.log('Redis Client Error', err))
  .connect()

export default function setKey(key: string, value: string, expire?: number) {
  client.set(key, value, { EX: expire })
}

export function getKey(key: string) {
  return client.get(key)
}

// 获取到晚上23.59.59的秒数
export function getExpireTime() {
  const now = new Date()
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  return Math.round((endOfDay.getTime() - now.getTime()) / 1000)
}
