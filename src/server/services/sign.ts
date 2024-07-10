import user from '@server/models/sign'
import { getTodayDate } from '@server/utils/utils'

// 取今日是否打卡
export async function isSign(user_id: string, group_id: string) {
  return await user.findOne({
    where: {
      user_id,
      group_id,
      date: getTodayDate(),
    },
  })
}
// 打卡
export async function sign(user_id: string, group_id: string) {
  return await user.create({
    user_id,
    group_id,
    date: getTodayDate(),
  })
}
// 删除打卡数据
export async function delSign(user_id: string, group_id: string) {
  return await user.destroy({
    where: {
      user_id,
      group_id,
    },
  })
}
