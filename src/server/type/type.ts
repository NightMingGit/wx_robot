export interface event {
  type: number
  keys: string[]
  is_group: boolean
  handle: (data: any) => void
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
}

interface baseResponse {
  error: string
  status: number
}

export interface response extends baseResponse {
  data: any
}
