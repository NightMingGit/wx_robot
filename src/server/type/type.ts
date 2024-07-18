export interface user {
  id: number
  name: string
  user_id: string
  group_id: string
  score: number
  card: number
  daily: string
}

export interface diffUser {
  name: string
  user_id: string
  group_id: string
}

export interface event {
  type: number
  keys: string[]
  is_group?: boolean
  isAdmin?: boolean
  handle: (data: msg) => any
}

export interface msg {
  is_self: boolean
  is_group: boolean
  id: number
  type: number
  ts: number
  roomid: string
  content: string
  sender: string
  sign: string
  thumb?: string
  extra?: string
  xml: string
  from_id: string
  userInfo: user
}
export interface member {
  user_id: string
  name: string
}
export interface contact {
  UserName: string
  NickName: string
}
export interface prize {
  id: number
  name: string
  type: string
  value?: number
  probability: number
  getType: string
}
export interface lotteryList {
  userId: string
  name: string
}
