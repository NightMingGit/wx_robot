import { post } from '@server/request'

export function chatBot(content: string) {
  const key = [
    'sk-ux2qC6MFdwMIIkRgrRCJyz8kLtSqJgwDmgKtX2sIOsyHM1gY',
    'sk-B2OpjwRJgjYEof2qMO3yRK0wzLkUjYHIkEgRx4K8kuDyWBhV',
  ]
  return post(
    'https://api.chatanywhere.com.cn/v1/chat/completions',
    {
      appmodel_id: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content }],
    },
    {
      headers: {
        // 随机取一个key
        Authorization: `Bearer ${key[Math.floor(Math.random() * key.length)]}`,
      },
    },
  )
}
