import messageModel from '@server/models/message'
import { getLastMonthDate, getMonthDate, getTodayDate, getWeekDate } from '@server/utils/utils'
import sequelize from '@server/models/sequelize'
import { Op, QueryTypes } from 'sequelize'

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
      user u ON m.user_id = u.user_id AND m.group_id = u.group_id
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
// 连user表查询今日count排名前10
export async function getRankToday(group_id: string) {
  const query = `
      SELECT 
        u.name,
        u.user_id,
        m.count
      FROM 
        message m
      JOIN 
        user u ON m.user_id = u.user_id AND m.group_id = u.group_id
      WHERE 
        m.date = :date AND m.group_id = :group_id
      ORDER BY 
        m.count DESC
      LIMIT 10
    `
  return await sequelize.query(query, {
    replacements: { date: getTodayDate(), group_id },
    type: QueryTypes.SELECT,
  })
}
// 连user表查询本周count排名前10
export async function getRankWeek(group_id: string) {
  const { start, end } = getWeekDate()
  const query = `
      SELECT 
        u.name,
        u.user_id,
        SUM(m.count) as count
      FROM 
        message m
      JOIN 
        user u ON m.user_id = u.user_id AND m.group_id = u.group_id
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
// 通过user_id和 group_id查询 今日count数
export async function getTodayCount(user_id: string, group_id: string) {
  return await messageModel.findOne({
    where: {
      user_id,
      group_id,
      date: getTodayDate(),
    },
    raw: true,
  })
}
// 通过user_id和 group_id查询 和日期 查询本周count数
export async function getWeekCount(user_id: string, group_id: string) {
  const { start, end } = getWeekDate()
  return await messageModel.sum('count', {
    where: {
      user_id,
      group_id,
      date: {
        [Op.between]: [start, end],
      },
    },
  })
}

// 连user表查询出本月没有记录的用户
export async function getNoRecordUserThisMonth(group_id: string) {
  const { start, end } = getMonthDate()
  const query = `
       SELECT
        u.user_id,
        u.name
      FROM
        user u
      LEFT JOIN
        message m ON u.user_id = m.user_id AND u.group_id = m.group_id
        AND m.date BETWEEN :start AND :end
      WHERE
        m.user_id IS NULL AND u.group_id = :group_id`
  return await sequelize.query(query, {
    replacements: { start, end, group_id },
    type: QueryTypes.SELECT,
  })
}
export async function getNoRecordUserLastMonth(group_id: string) {
  const { start, end } = getLastMonthDate()
  const query = `
       SELECT
        u.user_id,
        u.name
      FROM
        user u
      LEFT JOIN
        message m ON u.user_id = m.user_id AND u.group_id = m.group_id
        AND m.date BETWEEN :start AND :end
      WHERE
        m.user_id IS NULL AND u.group_id = :group_id`
  return await sequelize.query(query, {
    replacements: { start, end, group_id },
    type: QueryTypes.SELECT,
  })
}
