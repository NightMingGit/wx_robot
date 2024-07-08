import type { msg } from '@server/type/type'
import { isSign, sign } from '@server/services/sign'
import { sendText } from '@server/api/system'
import { syncGroups } from '@server/events/common'
import { isAdmin } from '@server/utils/utils'
import config from '@server/config'

export const handles = [
  {
    type: 0,
    keys: ['同步'],
    is_group: true,
    handle: async (data: msg) => {
      if (isAdmin(data.sender)) {
        await syncGroups(data)
        await sendText('同步成功', data.from_id)
      }
      else {
        await sendText(config.adminText, data.from_id)
      }
    },
  },
  {
    type: 0,
    keys: ['我的信息'],
    is_group: true,
    handle: async (data: msg) => {
      const signResult = await isSign(data.sender, data.roomid)
      const sendText_ = `昵称：${data.userInfo?.name}\n今日打卡：${signResult ? '是' : '否'}`
      await sendText(sendText_, data.from_id)
    },
  },
  {
    type: 0,
    keys: ['打卡', '签到'],
    is_group: true,
    handle: async (data: msg) => {
      const signResult = await signFunction(data)
      await sendText(`打卡：${signResult}`, data.from_id)
    },
  },
]

async function signFunction(data: msg) {
  const signResult = await isSign(data.sender, data.roomid)
  if (signResult) {
    return '今日已经打卡'
  }
  else {
    await sign(data.sender, data.roomid)
    return '打卡成功'
  }
}
