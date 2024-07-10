import messageModel from '@server/models/message'
import { getTodayDate } from '@server/utils/utils'

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
