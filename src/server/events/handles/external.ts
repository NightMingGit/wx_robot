import type { event } from '@server/type/type'
import { sendImgVideo, sendTextByGet } from '@server/utils/utils'
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
      if (data.content !== '吃啥')
        return
      sendTextByGet(data, 'https://api.yujn.cn/api/chi.php')
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
      await sendImgVideo(
        data,
        'http://api.yujn.cn/api/baisis.php?type=video',
        'mp4',
      )
    },
  },
  {
    type: 0,
    keys: ['黑丝视频'],
    handle: async (data) => {
      await sendImgVideo(
        data,
        'http://api.yujn.cn/api/heisis.php?type=video',
        'mp4',
      )
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
  {
    type: 0,
    keys: ['降雨量'],
    handle: async (data) => {
      await sendImgVideo(data, 'http://api.yujn.cn/api/jiangyu.php?', 'png')
    },
  },
  {
    type: 1,
    keys: ['天气#'],
    handle: async (data) => {
      if (!data.content.startsWith('天气#'))
        return
      const address = data.content.split('#')[1]
      sendTextByGet(
        data,
        'https://api.vvhan.com/api/weather',
        { city: address },
        async (res: any) => {
          if (res.success) {
            const str = `城市：${res.city}\n气温：${res.data.low}/${res.data.high}\n${res.data.week}；${res.data.type}；${res.data.fengxiang}/${res.data.fengli}\n${res.tip}`
            await sendText(str, data.from_id)
          }
          else {
            await sendText('接口错误', data.from_id)
          }
        },
      )
    },
  },
  {
    type: 0,
    keys: ['emo'],
    handle: async (data) => {
      if (data.content !== 'emo')
        return
      sendTextByGet(data, 'http://api.yujn.cn/api/sgyl.php')
    },
  },
  {
    type: 0,
    keys: ['骚话'],
    handle: async (data) => {
      if (data.content !== '骚话')
        return
      sendTextByGet(data, 'http://api.yujn.cn/api/text_wu.php')
    },
  },
  {
    type: 0,
    keys: ['土味情话'],
    handle: async (data) => {
      if (data.content !== '土味情话')
        return
      sendTextByGet(data, 'http://api.yujn.cn/api/qinghua.php')
    },
  },
]
