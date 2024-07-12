import type { event, msg, prize } from '@server/type/type'
import { isSign, sign } from '@server/services/sign'
import { sendText } from '@server/api/system'
import { drawPrize, syncGroups } from '@server/events/common'
import config from '@server/config'
import { getUserInfo, updateCard, updateScore } from '@server/services/user'
import { getPrizeList } from '@server/services/prize'
import { createLotteryLog, getTodayLotteryLog } from '@server/services/lotteryLog'
import { getRankByDateRange } from '@server/services/message'
import { getWeekDay } from '@server/utils/utils'

export const handles: event[] = [
  {
    type: 0,
    keys: ['随机宝箱'],
    is_group: true,
    isAdmin: true,
    handle: async (data) => {
      const messageList = (await getRankByDateRange(data.roomid)).map((item: any) => {
        return {
          name: item.name,
          user_id: item.user_id,
          count: Number(item.count),
        }
      }).filter(item => item.count > getWeekDay() * 5)
      if (messageList.length <= 0) {
        await sendText('暂无人满足条件', data.roomid)
      }
      // 从list随机取一个
      const randomIndex = Math.floor(Math.random() * messageList.length)
      const randomUser = messageList[randomIndex]
      const p = await getPrizeList(['0', '1'])
      const prize = drawPrize(p)
      if (!prize) {
        await sendText('抽奖发生错误', data.roomid)
        return
      }
      const paramsData: msg = JSON.parse(JSON.stringify(data))
      paramsData.sender = randomUser.user_id
      paramsData.userInfo = await getUserInfo(paramsData.sender, paramsData.roomid)
      // 存抽奖记录
      await createLotteryLog(paramsData.sender, paramsData.roomid, prize.id, '1')
      const pRes = await sendPrize(paramsData, prize)
      await sendText(`@${paramsData.userInfo?.name}\n${pRes}`, paramsData.from_id)
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
      if (!data.userInfo) {
        return
      }
      const signResult = await isSign(data.sender, data.roomid)
      const sendText_ = `${data.userInfo.name}：\n今日打卡：${signResult ? '是' : '否'}`
      await sendText(sendText_, data.from_id)
    },
  },
  {
    type: 0,
    keys: ['打卡', '签到'],
    is_group: true,
    handle: async (data) => {
      if (!data.userInfo)
        return
      const signResult = await signFunction(data)
      const lotteryResult = await lotteryFunction(data)
      await sendText(`打卡：${signResult}\n抽奖：${lotteryResult}`, data.from_id)
    },
  },
]

async function signFunction(data: msg): Promise<string> {
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
async function lotteryFunction(data: msg): Promise<string> {
  const isLottery = await getTodayLotteryLog(data.sender, data.roomid)
  if (isLottery) {
    return '今日已经抽过奖了'
  }
  const p = await getPrizeList(['0'])
  const prize = drawPrize(p)
  if (!prize)
    return '抽奖发生错误'
  await createLotteryLog(data.sender, data.roomid, prize.id, '0')
  return await sendPrize(data, prize)
}

// 发放奖励
async function sendPrize(data: msg, prize: prize): Promise<string> {
  if (prize.type === '0') {
    return '很遗憾什么也没抽到'
  }
  if (prize.type === '1') {
    await updateScore(data.sender, data.roomid, prize.value!)
    const haveScore = data.userInfo!.score + prize.value!
    return `恭喜抽中${prize.name}，当前拥有${haveScore}金币`
  }
  if (prize.type === '2') {
    // 当前金币翻prize.value倍
    const addScore = data.userInfo!.score * prize.value! - data.userInfo!.score
    await updateScore(data.sender, data.roomid, addScore)
    const haveScore = data.userInfo!.score + addScore
    return `恭喜抽中${prize.name}，当前拥有${haveScore}金币`
  }
  if (prize.type === '3') {
    await updateCard(data.sender, data.roomid)
    return `恭喜抽中${prize.name}`
  }
  if (prize.type === '4') {
    let score = 0
    if (data.userInfo!.score < prize.value!) {
      score = data.userInfo!.score
    }
    else {
      score = prize.value!
    }
    await updateScore(data.sender, data.roomid, -score)
    const haveScore = data.userInfo!.score - score
    return `不小心抽中${prize.name},当前剩余${haveScore}金币`
  }

  return '未知奖励'
}
