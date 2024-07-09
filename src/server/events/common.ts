import type { contact, member, msg } from '@server/type/type'
import { sendText, sql } from '@server/api/system'
import { isAdmin, parseProtobuf } from '@server/utils/utils'
import { createUser, getUserInfo, updateUser } from '@server/services/user'
import { getActiveGroupIds, setActiveGroupIds } from '@server/global'
import { createActiveGroup, getActiveGroup, setActiveGroup } from '@server/services/activeGroup'

// 获取群成员
async function getGroupMembers(roomId: string): Promise<member[]> {
  const contacts = await sql('MicroMsg.db', 'SELECT UserName, NickName FROM Contact;')
  const wxRoomData = await sql('MicroMsg.db', `SELECT RoomData FROM ChatRoom WHERE ChatRoomName = '${roomId}'`)
  const data = await parseProtobuf(wxRoomData.data[0].RoomData)
  const members: member[] = []
  for (const item of data.members) {
    members.push({
      user_id: item.wxid,
      name: item.name ? item.name : contacts.data.find((v: contact) => v.UserName === item.wxid)?.NickName,
    })
  }
  return members
}

// 同步群成员
export async function syncGroups(msg: msg) {
  console.log('同步群成员')
  const members = await getGroupMembers(msg.roomid)
  for (const item of members) {
    const user = await getUserInfo(item.user_id, msg.roomid)
    if (user) {
      await updateUser(item.user_id, msg.roomid, item.name)
    }
    else {
      await createUser(item.user_id, msg.roomid, item.name)
    }
  }
}

// 进群处理
export function joinGroup(data: msg) {
  // 如果是系统消息才处理
  if (data.type !== 10000)
    return false

  const joinPattern = /加入了群聊|二维码加入群聊/
  const invitePattern = /邀请"[^"]+"加入了群聊/

  if (joinPattern.test(data.content) || invitePattern.test(data.content)) {
    // 等待5s在处理
    setTimeout(() => {
      syncGroups(data)
    }, 5000)
  }
}
// 开关群
export async function switchGroup(data: msg) {
  const activeIds = getActiveGroupIds()
  if (data.is_group) {
    if (isAdmin(data.sender)) {
      if (data.content === '开启群聊') {
        // 判断当前群如果不在activeIds里面 执行开启操作
        if (!activeIds.includes(data.roomid)) {
          activeIds.push(data.roomid)
          await setActiveGroup(JSON.stringify(activeIds))
          setActiveGroupIds(activeIds)
          await sendText('已开启群聊', data.roomid)
        }
      }
      if (data.content === '关闭群聊') {
        if (activeIds.includes(data.roomid)) {
          activeIds.splice(activeIds.indexOf(data.roomid), 1)
          await setActiveGroup(JSON.stringify(activeIds))
          setActiveGroupIds(activeIds)
          await sendText('已关闭群聊', data.roomid)
        }
      }
    }
  }
}
// 判断是否开启了群聊
export function isGroupActive(roomId: string) {
  const activeIds = getActiveGroupIds()
  console.log('当前已激活群聊', activeIds)
  return activeIds.includes(roomId)
}
// 挂载userInfo
export async function mountUserInfo(data: msg) {
  if (data.is_group && !data.userInfo) {
    const user = await getUserInfo(data.sender, data.roomid)
    data.userInfo = user?.toJSON()
  }
}
// 初始化群聊ids
export async function initGroupIds() {
  // 获取已经激活的群聊 并存入内存
  const g = await getActiveGroup()
  if (!g) {
    await createActiveGroup()
    setActiveGroupIds([])
  }
  else {
    setActiveGroupIds(JSON.parse((g as any).ids))
  }
}
