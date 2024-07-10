import cron from 'node-cron'
import { getActiveGroupIds } from '@server/global'
import { getGroupMembers } from '@server/events/common'
import { getGroupUsers } from '@server/services/user'

cron.schedule('*/10 * * * * *', () => {
  console.log('这个任务每10秒执行一次')
  checkGroupAndRename()
})

// 退群和改名检测
async function checkGroupAndRename() {
  console.log('退群和改名检测')
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
    console.log(wxData, data)
    // 改名检测

    // 退群检测 退群的需要删除签到 摸鱼 和用户
    // await delSign()
    // await deleteMessage()
    // await deleteUser()
  }
}
