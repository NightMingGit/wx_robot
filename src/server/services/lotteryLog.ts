import lotteryLog from '@server/models/lotteryLog'
import { getDateTime, getTodayStartEnd } from '@server/utils/utils'
import { Op, QueryTypes } from 'sequelize'
import sequelize from '@server/models/sequelize'

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
// 查询最新10条中奖记录 连prize表
export async function getLotteryLogList(user_id: string, group_id: string) {
  const { start, end } = getTodayStartEnd()
  const query = `
      SELECT 
       l.user_id,
       p.name,
       l.date,
       l.getType
      FROM 
        lottery_log l
      JOIN 
        prize p ON p.id = l.prizeId
      WHERE 
         l.group_id = :group_id AND l.user_id = :user_id
      ORDER BY 
        l.date DESC
      LIMIT 10
    `
  return await sequelize.query(query, {
    replacements: { start, end, group_id, user_id },
    type: QueryTypes.SELECT,
  })
}
