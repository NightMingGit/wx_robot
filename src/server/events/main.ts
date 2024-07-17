import type { event } from '@server/type/type'
import { sendText } from '@server/api/system'
import config from '@server/config'
import { getPrizeList } from '@server/services/prize'
import { handlesIndex } from '@server/events/handles'
import { handlesExternal } from '@server/events/handles/external'

export const main: event[] = [
  ...handlesIndex,
  ...handlesExternal,
  {
    type: 0,
    keys: ['功能'],
    is_group: true,
    handle: async (data) => {
      let text = `打卡：+${config.signScore}金币\n`
      text += `每日抽奖：-${config.drawScore}金币\n`
      text += `加入抽奖：-${config.lotteryScore}金币\n`
      text += `摸鱼：+1金币\n`

      const prizes = await getPrizeList(['0', '1'])
      const prizesText = prizes.map((item: any) => item.name).join(',')
      text += `奖池：(${prizesText})\n`
      text += '功能列表\n'

      const menuList: string[] = [
        '打卡',
        '天气',
        'emo',
        '骚话',
        '土味情话',
        '今日摸鱼',
        '本周摸鱼',
        '金币排行',
        '崚影卡排行',
        '我的信息',
        '写真',
        '小姐姐',
        '吃啥',
        '发起抽奖',
        '加入抽奖',
        '结束抽奖',
        '内涵段子',
        '摸鱼日报',
        '男友视角',
        '星座运势',
        '黑丝视频',
        '白丝视频',
        '假期查询',
        '下班时间',
        '降雨量',
        '天气',
        'emo',
        '骚话',
        '土味情话',
      ]

      const menus = menuList.map((item, index) => `${index + 1}.${item}`)
      text += menus.join(',')

      await sendText(text, data.from_id)
    },
  },
]
