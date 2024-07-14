import './user'
import './sign'
import './message'
import './activeGroup'
import './prize'
import './lotteryLog'
import './lottery'
import { initGroupIds } from '@server/events/common'
import prizeModel from '@server/models/prize'
import type { prize } from '@server/type/type'
import sequelize from './sequelize'

sequelize.sync({ alter: true }).then(async () => {
  console.log('数据库同步成功')
  // 初始化一些数据
  await initGroupIds()
  await initPrizes()
})

// 初始化奖品数据
async function initPrizes() {
  const prizes: prize[] = [
    { id: 1, name: '啥也没抽到', type: '0', probability: 30, getType: '0' },
    { id: 2, name: '50金币', value: 50, type: '1', probability: 12, getType: '0' },
    { id: 3, name: '100金币', value: 100, type: '1', probability: 9, getType: '0' },
    { id: 4, name: '150金币', value: 150, type: '1', probability: 6, getType: '0' },
    { id: 5, name: '200金币', value: 200, type: '1', probability: 3, getType: '0' },
    { id: 6, name: '崚影卡', type: '3', probability: 5, getType: '1' },
  ]
  await prizeModel.bulkCreate(prizes as any, {
    ignoreDuplicates: true,
  })
}
