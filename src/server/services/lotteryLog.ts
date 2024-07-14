import lotteryLog from '@server/models/lotteryLog'
import { getDateTime, getTodayStartEnd } from '@server/utils/utils'
import { Op } from 'sequelize'

// 通过日期查询今日是否抽奖
export async function getTodayLotteryLog(user_id: string, group_id: string) {
  const { start, end } = getTodayStartEnd()
  return await lotteryLog.findOne({
    where: {
      user_id,
      group_id,
      date: {
        [Op.between]: [start, end],
      },
      getType: '0',
    },
  })
}
// 创建抽奖记录
export async function createLotteryLog(user_id: string, group_id: string, prizeId: number, getType: string) {
  return await lotteryLog.create({
    user_id,
    group_id,
    date: getDateTime(),
    prizeId,
    getType,
  })
}
