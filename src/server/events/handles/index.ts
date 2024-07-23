import type { event, lotteryList, msg, prize } from '@server/type/type'
import {
  getNoRecordUserLastMonth,
  getNoRecordUserThisMonth,
  getRankByDateRange,
  getRankToday,
  getRankWeek,
  getTodayCount,
  getWeekCount,
} from '@server/services/message'
import { sendText } from '@server/api/system'
import { drawPrize, syncGroups } from '@server/events/common'
import { isSign, sign } from '@server/services/sign'
import { getTop10, getTop10Card, getUserInfo, setDaily, updateCard, updateScore } from '@server/services/user'
import { createLotteryLog, getLotteryLogList, getTodayLotteryLog } from '@server/services/lotteryLog'
import { createLottery, endLottery, getLottery, getLotteryByGroup, saveList } from '@server/services/lottery'
import config from '@server/config'
import { drawPrizes, getRandomElement, getWeekDay, parseXml } from '@server/utils/utils'
import { getPrizeList } from '@server/services/prize'
import dayjs from 'dayjs'
import _ from 'lodash'
import { daily } from '@server/api/api'

const signHandle = _.debounce(async (data: msg) => {
  const signResult = await signFunction(data)
  const lotteryResult = await lotteryFunction(data)
  let dailyText = data.userInfo.daily || ''
  if (!dailyText) {
    try {
      dailyText = await daily()
      await setDaily(data.sender, data.from_id, dailyText)
    }
    catch (e) {
      dailyText = ''
    }
  }
  await sendText(
        `@${data.userInfo.name}\n打卡：${signResult}\n抽奖：${lotteryResult}\n今日鸡汤：${dailyText.trim()}`,
        data.from_id,
  )
}, 1000, { leading: true, trailing: false })

const scoreRankHandle = _.debounce(async (data: msg) => {
  const result = await getTop10(data.from_id)
  const rankText = result
    .map((item: any, index) => `${index + 1}.${item.name}(${item.score})`)
    .join('\n')
  await sendText(rankText, data.from_id)
}, 10000, { leading: true, trailing: false })

export const handlesIndex: event[] = [
  {
    type: 1,
    keys: ['赠送金币#'],
    is_group: true,
    handle: async (data) => {
      // 如果content里面包含@所有人 则不做处理
      if (data.content.includes('@所有人'))
        return
      // 取出艾特列表
      const atList = await parseXml(data.xml)
      if (!atList)
        return
      if (atList.length > 1) {
        await sendText('一次只能@一个人', data.from_id)
        return
      }
      // 判断格式是否正确 @用户 赠送金币#整数 只能是整数 并且大于100
      if (!/^@.*\s赠送金币#[1-9]\d*$/.test(data.content)) {
        await sendText(`格式不正确，请使用 @用户 赠送金币#111`, data.from_id)
        return
      }
      // 取出金币
      const score: number = Number(data.content.split('#')[1])
      if (score < 100) {
        await sendText(`金币不能小于100`, data.from_id)
        return
      }
      // 判断金币是否足够
      if (data.userInfo.score < score) {
        await sendText(`金币不足`, data.from_id)
        return
      }

      // 需要扣除10%的手续费
      const score_ = Math.floor(score * 0.8)
      // 给被艾特的人+
      await updateScore(atList[0], data.from_id, score_)
      // 给自己-
      await updateScore(data.sender, data.from_id, -score)
      await sendText(`赠送成功，实际到账${score_}金币`, data.from_id)
    },
  },
  {
    type: 0,
    keys: ['本月未发言'],
    is_group: true,
    handle: async (data) => {
      const list: any = await getNoRecordUserThisMonth(data.from_id)
      await sendText(list.map((item: any) => item.name).join('\n'), data.from_id)
    },
  },
  {
    type: 0,
    keys: ['上月未发言'],
    is_group: true,
    handle: async (data) => {
      const list: any = await getNoRecordUserLastMonth(data.from_id)
      await sendText(list.map((item: any) => item.name).join('\n'), data.from_id)
    },
  },
  {
    type: 0,
    keys: ['随机宝箱'],
    is_group: true,
    isAdmin: true,
    handle: async (data) => {
      await drawPrizeFun(data)
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
      const sendText_ = `[ ${data.userInfo.name} ]\n金币：${
        data.userInfo.score
      }\n崚影卡：${data.userInfo.card}\n今日打卡：${
        signResult ? '是' : '否'
      }\n今日摸鱼：${todayMessage.count}\n本周摸鱼：${weekMessage}`
      await sendText(sendText_, data.from_id)
    },
  },
  {
    type: 0,
    keys: ['金币排行'],
    is_group: true,
    handle: scoreRankHandle,
  },
  {
    type: 0,
    keys: ['崚影卡排行'],
    is_group: true,
    handle: async (data) => {
      const result = await getTop10Card(data.from_id)
      const rankText = result
        .map((item: any, index) => `${index + 1}.${item.name}(${item.card})`)
        .join('\n')
      await sendText(rankText, data.from_id)
    },
  },
  {
    type: 0,
    keys: ['今日摸鱼'],
    is_group: true,
    handle: async (data) => {
      const result = await getRankToday(data.from_id)
      const rankText = result
        .map((item: any, index) => `${index + 1}.${item.name}(${item.count})`)
        .join('\n')
      await sendText(rankText, data.from_id)
    },
  },
  {
    type: 0,
    keys: ['本周摸鱼'],
    is_group: true,
    handle: async (data) => {
      const result = await getRankWeek(data.from_id)
      const rankText = result
        .map((item: any, index) => `${index + 1}.${item.name}(${item.count})`)
        .join('\n')
      await sendText(rankText, data.from_id)
    },
  },
  {
    type: 0,
    keys: ['中奖记录'],
    is_group: true,
    handle: async (data) => {
      const res = await getLotteryLogList(data.sender, data.roomid)
      const text = res
        .map(
          (item: any) => {
            item.date = dayjs(item.date).format('MM-DD HH:mm')
            return `[ ${item.date} ]${item.name}(${item.getType === '0' ? '每日' : '宝箱'})`
          },
        )
        .join('\n')
      await sendText(
        `@${data.userInfo.name}\n最新10条中奖记录\n${text}`,
        data.from_id,
      )
    },
  },
  {
    type: 0,
    keys: ['打卡', '签到'],
    is_group: true,
    handle: signHandle,
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
        await sendText(
          '格式错误，正确格式：发起抽奖#奖品内容#人数',
          data.from_id,
        )
        return
      }
      // 人数最大10人 最小1人
      const num = Number.parseInt(data.content.split('#')[2])
      if (num > 10 || num < 1) {
        await sendText('人数不能超过10人,不能小于1人', data.from_id)
        return
      }
      // 判断当前是否已经有抽奖
      const lottery = await getLottery(data.from_id)
      if (lottery) {
        await sendText('当前已经有抽奖了', data.from_id)
        return
      }
      // 发起抽奖
      await createLottery(
        data.sender,
        data.from_id,
        data.content.split('#')[1],
        num,
        JSON.stringify([]),
      )
      const text = `@所有人 抽奖开始咯\n奖品：${data.content.split('#')[1]}\n人数：${num}\n参与方式：发送“加入抽奖”`
      await sendText(text, data.from_id, 'notify@all')
    },
  },
  {
    type: 0,
    keys: ['加入抽奖'],
    handle: async (data) => {
      // 判断当前是否有抽奖
      const lottery: any = await getLottery(data.from_id)
      if (!lottery) {
        await sendText('当前没有抽奖', data.from_id)
        return
      }
      // 判断金币是否够
      if (data.userInfo.score < config.lotteryScore) {
        await sendText(
          `@${data.userInfo.name} 金币不足，无法参与抽奖`,
          data.from_id,
        )
        return
      }
      const list: lotteryList[] = JSON.parse(lottery.list)

      if (list.find(item => item.userId === data.sender)) {
        return
      }
      list.push({
        userId: data.sender,
        name: data.userInfo.name,
      })
      await saveList(lottery.id, JSON.stringify(list))
      await updateScore(data.sender, data.roomid, -config.lotteryScore)
    },
  },
  {
    type: 0,
    keys: ['抽奖名单'],
    handle: async (data) => {
      const lottery: any = await getLottery(data.from_id)
      if (!lottery) {
        await sendText('当前没有抽奖', data.from_id)
        return
      }
      if (data.sender !== lottery.user_id) {
        return
      }
      const list = JSON.parse(lottery.list)
      // 构建抽奖名单字符串
      const names = list.map((item: any) => item.name).join('，')
      const prizeInfo = `奖品：${lottery.name}`
      const countInfo = `抽取人数：${lottery.count}`
      const participantCount = `参与人数：${list.length}`

      // 组合最终输出的消息
      const message = `抽奖名单：${names}\n${prizeInfo}\n${countInfo}\n${participantCount}`
      // 发送消息
      await sendText(message, data.from_id)
    },
  },
  {
    type: 0,
    keys: ['结束抽奖'],
    handle: async (data) => {
      const lottery: any = await getLottery(data.from_id)
      if (!lottery) {
        await sendText('当前没有抽奖', data.from_id)
        return
      }
      if (data.sender !== lottery.user_id) {
        await sendText('只有发起抽奖的人才能结束抽奖', data.from_id)
        return
      }
      // 人数是否足够
      const needNum = lottery.count
      const listNum = JSON.parse(lottery.list).length
      if (needNum > listNum) {
        await sendText(
          `人数不足，需要${needNum}人，当前有${listNum}人`,
          data.from_id,
        )
        return
      }

      const list: lotteryList[] = JSON.parse(lottery.list)
      const num = lottery.count

      const result = drawPrizes(list, num)
      await endLottery(lottery.id, JSON.stringify(result))
      // 构建中奖名单字符串
      const winnerNames = result.map(item => `@${item.name}`).join('\n')
      const prizeName = `抽中${lottery.name}`
      const message = `抽奖结束\n${winnerNames}\n${prizeName}`

      // 构建提及用户的 ID 字符串，用于消息中提及这些用户
      const mentionIds = result.map(item => item.userId).join(',')

      // 发送消息
      await sendText(message, data.from_id, mentionIds)
    },
  },
  {
    type: 0,
    is_group: true,
    keys: ['我的抽奖信息'],
    handle: async (data) => {
      const list = await getLotteryByGroup(data.from_id)
      // 查询参与过抽奖的次数 list是个json string格式 {userId,name} 也就是查询data.sender在list里面出现过几次
      const count = list.filter((item: any) => {
        const list = JSON.parse(item.list) || []
        return list.some((item: any) => item.userId === data.sender)
      }).length
      let sendText_ = ''
      sendText_ += `我参与抽奖的次数${count}`
      await sendText(sendText_, data.from_id)
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

export async function drawPrizeFun(data: msg | any) {
  const messageList = (await getRankByDateRange(data.roomid))
    .map((item: any) => {
      return {
        name: item.name,
        user_id: item.user_id,
        count: +item.count,
      }
    })
    .filter(item => item.count > getWeekDay() * 20)
  if (messageList.length <= 0) {
    await sendText('宝箱暂无人满足条件', data.roomid)
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
  await sendText(
        `@${paramsData.userInfo?.name}\n${prizeRes}`,
        paramsData.from_id,
  )
}
