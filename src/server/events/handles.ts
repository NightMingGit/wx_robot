import type { event, msg, prize } from '@server/type/type'
import { isSign, sign } from '@server/services/sign'
import { sendText } from '@server/api/system'
import { drawPrize, syncGroups } from '@server/events/common'
import config from '@server/config'
import { getTop10, getTop10Card, getUserInfo, updateCard, updateScore } from '@server/services/user'
import { getPrizeList } from '@server/services/prize'
import { createLotteryLog, getLotteryLogList, getTodayLotteryLog } from '@server/services/lotteryLog'
import { getRankByDateRange, getRankToday, getRankWeek, getTodayCount, getWeekCount } from '@server/services/message'
import { getRandomElement, getWeekDay } from '@server/utils/utils'
import { createLottery, getLottery } from '@server/services/lottery'

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
          count: +item.count,
        }
      }).filter(item => item.count > getWeekDay() * 20)
      if (messageList.length <= 0) {
        await sendText('暂无人满足条件', data.roomid)
        return
      }
      const randomUser = getRandomElement(messageList)
      const prizeList = await getPrizeList(['0', '1'])
      const prize = drawPrize(prizeList)
      if (!prize) {
        await sendText('抽奖发生错误', data.roomid)
        return
      }
      const paramsData: msg = { ...data, sender: randomUser.user_id }
      paramsData.userInfo = await getUserInfo(paramsData.sender, paramsData.roomid)
      // 存抽奖记录
      await createLotteryLog(paramsData.sender, paramsData.roomid, prize.id, '1')
      const prizeRes = await sendPrize(paramsData, prize)
      await sendText(`@${paramsData.userInfo?.name}\n${prizeRes}`, paramsData.from_id)
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
      const todayMessage: any = await getTodayCount(data.sender, data.roomid)
      const weekMessage = await getWeekCount(data.sender, data.roomid)
      const sendText_ = `[ ${data.userInfo.name} ]\n金币：${data.userInfo.score}\n崚影卡：${data.userInfo.card}\n今日打卡：${signResult ? '是' : '否'}\n今日摸鱼：${todayMessage.count}\n本周摸鱼：${weekMessage}`
      await sendText(sendText_, data.from_id)
    },
  },
  {
    type: 0,
    keys: ['金币排行'],
    is_group: true,
    handle: async (data) => {
      const result = await getTop10(data.from_id)
      const rankText = result.map((item: any, index) => `${index + 1}.${item.name}(${item.score})`).join('\n')
      await sendText(rankText, data.from_id)
    },
  },
  {
    type: 0,
    keys: ['崚影卡排行'],
    is_group: true,
    handle: async (data) => {
      const result = await getTop10Card(data.from_id)
      const rankText = result.map((item: any, index) => `${index + 1}.${item.name}(${item.card})`).join('\n')
      await sendText(rankText, data.from_id)
    },
  },
  {
    type: 0,
    keys: ['今日摸鱼'],
    is_group: true,
    handle: async (data) => {
      const result = await getRankToday(data.from_id)
      const rankText = result.map((item: any, index) => `${index + 1}.${item.name}(${item.count})`).join('\n')
      await sendText(rankText, data.from_id)
    },
  },
  {
    type: 0,
    keys: ['本周摸鱼'],
    is_group: true,
    handle: async (data) => {
      const result = await getRankWeek(data.from_id)
      const rankText = result.map((item: any, index) => `${index + 1}.${item.name}(${item.count})`).join('\n')
      await sendText(rankText, data.from_id)
    },
  },
  {
    type: 0,
    keys: ['中奖记录'],
    is_group: true,
    handle: async (data) => {
      const res = await getLotteryLogList(data.sender, data.roomid)
      const text = res.map((item: any) => `[ ${item.date} ]：${item.name}(${item.getType === '0' ? '每日' : '宝箱'})`).join('\n')
      await sendText(`@${data.userInfo.name}\n最新10条中奖记录\n${text}`, data.from_id)
    },
  },
  {
    type: 0,
    keys: ['打卡', '签到'],
    is_group: true,
    handle: async (data) => {
      const signResult = await signFunction(data)
      const lotteryResult = await lotteryFunction(data)
      await sendText(`@${data.userInfo.name}\n打卡：${signResult}\n抽奖：${lotteryResult}`, data.from_id)
    },
  },
  {
    type: 1,
    keys: ['发起抽奖#'],
    is_group: true,
    handle: async (data) => {
      // 格式 发起抽奖#奖品内容#人数
      // 检查格式是否正确 人数只能是整数
      const reg = /^发起抽奖#.+?#\d+$/

      if (!reg.test(data.content)) {
        await sendText('格式错误，正确格式：发起抽奖#奖品内容#人数', data.from_id)
        return
      }
      // 人数最大10人 最小1人
      const num = Number.parseInt(data.content.split('#')[2])
      if (num > 10 || num < 1) {
        await sendText('人数不能超过10人,不能小于1人', data.from_id)
        return
      }
      // 判断当前是否已经有抽奖
      const lottery = await getLottery()
      if (lottery) {
        await sendText('当前已经有抽奖了', data.from_id)
        return
      }
      // 发起抽奖
      await createLottery(data.content.split('#')[1], num, JSON.stringify([]))
    },
  },
  {
    type: 0,
    keys: ['测试私聊'],
    handle: async (data) => {
      await sendText(JSON.stringify(data), data.from_id)
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
  data.userInfo = await getUserInfo(data.sender, data.roomid)
  const isLottery = await getTodayLotteryLog(data.sender, data.roomid)
  if (isLottery) {
    return '今日已经抽过奖了'
  }
  if (data.userInfo.score < config.drawScore) {
    return `金币不足${config.drawScore}`
  }
  const p = await getPrizeList(['0'])
  const prize = drawPrize(p)
  if (!prize)
    return '抽奖发生错误'
  await updateScore(data.sender, data.roomid, -config.drawScore)
  await createLotteryLog(data.sender, data.roomid, prize.id, '0')
  return await sendPrize(data, prize, config.drawScore)
}

// 发放奖励 dailyNeedScore每日抽奖要扣除的
async function sendPrize(data: msg, prize: prize, dailyNeedScore: number = 0): Promise<string> {
  if (prize.type === '0') {
    return '很遗憾什么也没抽到'
  }
  if (prize.type === '1') {
    await updateScore(data.sender, data.roomid, prize.value!)
    const haveScore = data.userInfo!.score + prize.value! - dailyNeedScore
    return `恭喜抽中${prize.name}，当前拥有${haveScore}金币`
  }
  if (prize.type === '2') {
    // 当前金币翻prize.value倍
    const addScore = data.userInfo!.score * prize.value! - data.userInfo!.score
    await updateScore(data.sender, data.roomid, addScore)
    const haveScore = data.userInfo!.score + addScore - dailyNeedScore
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
    const haveScore = data.userInfo!.score - score - dailyNeedScore
    return `不小心抽中${prize.name},当前剩余${haveScore}金币`
  }

  return '未知奖励'
}
