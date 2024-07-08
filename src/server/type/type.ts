export interface event {
  type: number
  keys: string[]
  is_group: boolean
  handle: (data: msg) => void
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
  userInfo?: object | null
}
export interface member {
  user_id: string
  name: string
}
export interface contact {
  UserName: string
  NickName: string
}
