import type { event } from '@server/type/type'
import { sendImgVideo } from '@server/utils/utils'
import { eat } from '@server/api/api'
import { sendText } from '@server/api/system'

export const handlesExternal: event[] = [
  {
    type: 0,
    keys: ['写真'],
    handle: async (data) => {
      await sendImgVideo(
        data,
        'http://api.yujn.cn/api/yht.php?type=image',
        'png',
      )
    },
  },
  {
    type: 0,
    keys: ['小姐姐'],
    handle: async (data) => {
      await sendImgVideo(
        data,
        'http://api.yujn.cn/api/xjj.php?type=video',
        'mp4',
      )
    },
  },
  {
    type: 0,
    keys: ['吃啥'],
    handle: async (data) => {
      try {
        const res = await eat()
        await sendText(res.msg, data.from_id)
      }
      catch (e) {
        await sendText('吃啥接口异常', data.from_id)
      }
    },
  },
  {
    type: 0,
    keys: ['男友视角'],
    handle: async (data) => {
      await sendImgVideo(
        data,
        'https://api.yujn.cn/api/duilian.php?type=video',
        'mp4',
      )
    },
  },
  {
    type: 0,
    keys: ['白丝视频'],
    handle: async (data) => {
      await sendImgVideo(data, 'http://api.yujn.cn/api/baisis.php?type=video', 'mp4')
    },
  },
  {
    type: 0,
    keys: ['黑丝视频'],
    handle: async (data) => {
      await sendImgVideo(data, 'http://api.yujn.cn/api/heisis.php?type=video', 'mp4')
    },
  },
  {
    type: 0,
    keys: ['摸鱼日报'],
    handle: async (data) => {
      await sendImgVideo(
        data,
        'http://api.yujn.cn/api/moyu.php?msg=摸鱼日报&type=image',
        'png',
      )
    },
  },
  {
    type: 0,
    keys: ['星座运势'],
    handle: async (data) => {
      await sendImgVideo(
        data,
        'http://api.yujn.cn/api/moyu.php?msg=星座运势&type=image',
        'png',
      )
    },
  },
  {
    type: 0,
    keys: ['内涵段子'],
    handle: async (data) => {
      await sendImgVideo(
        data,
        'http://api.yujn.cn/api/moyu.php?msg=内涵段子&type=image',
        'png',
      )
    },
  },
]
