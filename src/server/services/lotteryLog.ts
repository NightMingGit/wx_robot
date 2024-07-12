import lotteryLog from '@server/models/lotteryLog'
import { getTodayDate } from '@server/utils/utils'

// 通过日期查询今日是否抽奖
export async function getTodayLotteryLog(user_id: string, group_id: string) {
  return await lotteryLog.findOne({
    where: {
      user_id,
      group_id,
      date: getTodayDate(),
    },
  })
}
// 创建抽奖记录
export async function createLotteryLog(user_id: string, group_id: string, prizeId: number, getType: string) {
  return await lotteryLog.create({
    user_id,
    group_id,
    date: getTodayDate(),
    prizeId,
    getType,
  })
}
