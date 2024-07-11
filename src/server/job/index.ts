import cron from 'node-cron'
import { getActiveGroupIds } from '@server/global'
import { getGroupMembers } from '@server/events/common'
import { deleteUser, getGroupUsers, updateUser } from '@server/services/user'
import { findDifferences } from '@server/utils/utils'
import { sendText } from '@server/api/system'
import { delSign } from '@server/services/sign'
import { deleteMessage } from '@server/services/message'

cron.schedule('*/10 * * * * *', () => {
  checkGroupAndRename()
})

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
