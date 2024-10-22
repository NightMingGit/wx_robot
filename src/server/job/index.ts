import cron from 'node-cron'
import { getActiveGroupIds } from '@server/global'
import { getGroupMembers } from '@server/events/common'
import { deleteDaily, deleteUser, getGroupUsers, getTop1, updateUser } from '@server/services/user'
import { findDifferences } from '@server/utils/utils'
import { sendText } from '@server/api/system'
import { delSign } from '@server/services/sign'
import { deleteMessage } from '@server/services/message'
import { drawPrizeFun } from '@server/events/handles'

// 每天0点重置
cron.schedule('0 0 * * *', async () => {
  await deleteDaily('45563492329@chatroom')
})

cron.schedule('*/30 * * * * *', async () => {
  await checkGroupAndRename()
})
cron.schedule('0 9-18 * * 1-5', async () => {
  const top: any = await getTop1('45563492329@chatroom')
  await sendText(`首富[ ${top.name} ]提醒你：长时间工作或学习后，请记得喝水，帮助身体排毒和恢复精力。`, '45563492329@chatroom')
  await drawPrizeFun({
    roomid: '45563492329@chatroom',
    sender: '45563492329@chatroom',
    from_id: '45563492329@chatroom',
  })
})
// 首富喝水提示
// 退群和改名检测
async function checkGroupAndRename() {
  // 只对已经激活的群 做检测
  const activeGroupList = getActiveGroupIds()
  for (const group of activeGroupList) {
    // 取微信群成员数据
    const wxData = (await getGroupMembers(group)).map((item) => {
      return {
        user_id: item.user_id,
        name: item.name,
        group_id: group,
      }
    })
    // 取数据库数据
    const data = (await getGroupUsers(group)).map((item: any) => {
      return {
        user_id: item.user_id,
        name: item.name,
        group_id: item.group_id,
      }
    })
    if (wxData && wxData.length > 0) {
      const { changedNames, uniqueInArr2 } = findDifferences(wxData, data)
      // 改名提示
      for (const item of changedNames) {
        await sendText(`[ ${item.from.name} ]改名为[ ${item.to.name} ]`, group)
        await updateUser(item.to.user_id, item.to.group_id, item.to.name)
      }
      // 退群提示
      for (const item of uniqueInArr2) {
        await sendText(`[ ${item.name} ]退群`, group)
        await delSign(item.user_id, group)
        await deleteUser(item.user_id, group)
        await deleteMessage(item.user_id, group)
      }
    }
  }
}
