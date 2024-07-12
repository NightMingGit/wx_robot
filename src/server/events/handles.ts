import type { event, msg } from '@server/type/type'
import { isSign, sign } from '@server/services/sign'
import { sendText, test } from '@server/api/system'
import { syncGroups } from '@server/events/common'
import config from '@server/config'
import { updateScore } from '@server/services/user'

export const handles: event[] = [
  {
    type: 0,
    keys: ['测试'],
    is_group: true,
    score: 100,
    handle: async (data) => {
      try {
        const res = await test()
        console.log(res)
        return true
      }
      catch (e) {
        await sendText('测试异常', data.roomid)
        return false
      }
    },
  },
  {
    type: 0,
    keys: ['同步'],
    is_group: true,
    isAdmin: true,
    handle: async (data) => {
      await syncGroups(data)
      await sendText('同步成功', data.from_id)
    },
  },
  {
    type: 0,
    keys: ['我的信息'],
    is_group: true,
    handle: async (data) => {
      const signResult = await isSign(data.sender, data.roomid)
      const sendText_ = `昵称：${data.userInfo?.name}\n今日打卡：${signResult ? '是' : '否'}`
      await sendText(sendText_, data.from_id)
    },
  },
  {
    type: 0,
    keys: ['打卡', '签到'],
    is_group: true,
    handle: async (data) => {
      const signResult = await signFunction(data)
      await sendText(`打卡：${signResult}`, data.from_id)
    },
  },
]

async function signFunction(data: msg) {
  const signResult = await isSign(data.sender, data.roomid)
  if (signResult) {
    return '今日已经打卡'
  }
  else {
    await sign(data.sender, data.roomid)
    await updateScore(data.sender, data.roomid, config.signScore)
    return `打卡成功,获得${config.signScore}金币`
  }
}
// 抽奖
// async function lotteryFunction(data: msg) {
//   const p = (await getPrizeList(['0'])).map((item: any) => item.toJSON())
//   console.log()
// }
