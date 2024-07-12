import messageModel from '@server/models/message'
import { getTodayDate, getWeekDate } from '@server/utils/utils'
import sequelize from '@server/models/sequelize'
import { QueryTypes } from 'sequelize'

// 如果今天已经有数据了就加1 没有就默认新创建值为1
export async function addMessage(user_id: string, group_id: string) {
  const [message, created] = await messageModel.findOrCreate({
    where: {
      user_id,
      group_id,
      date: getTodayDate(),
    },
    defaults: {
      count: 1,
    },
  })
  if (!created) {
    await message.update({ count: (message as any).count + 1 })
  }
}
// 删除
export async function deleteMessage(user_id: string, group_id: string) {
  await messageModel.destroy({
    where: {
      user_id,
      group_id,
    },
  })
}
// 连user表查询日期范围内的
export async function getRankByDateRange(group_id: string) {
  const { start, end } = getWeekDate()
  const query = `
    SELECT 
      u.name,
      u.user_id,
      SUM(m.count) as count
    FROM 
      message m
    JOIN 
      user u ON m.user_id = u.user_id
    WHERE 
      m.date BETWEEN :start AND :end AND m.group_id = :group_id
    GROUP BY 
      u.user_id,u.name
    ORDER BY 
      count DESC
  `
  return await sequelize.query(query, {
    replacements: { start, end, group_id },
    type: QueryTypes.SELECT,
  })
}
