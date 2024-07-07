import type { contact, member, msg } from '@server/type/type'
import { sql } from '@server/api/system'
import { parseProtobuf } from '@server/utils/utils'
import { createUser, getUserInfo, updateUser } from '@server/services/user'

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
