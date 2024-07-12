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
    { id: 1, name: '空', type: '0', probability: 30, getType: '0' },
    { id: 2, name: '100金币', value: 100, type: '1', probability: 25, getType: '0' },
    { id: 3, name: '200金币', value: 200, type: '1', probability: 20, getType: '0' },
    { id: 4, name: '300金币', value: 300, type: '1', probability: 15, getType: '0' },
    { id: 5, name: '400金币', value: 400, type: '1', probability: 10, getType: '0' },
    { id: 6, name: '500金币', value: 500, type: '1', probability: 5, getType: '0' },
    { id: 7, name: '2倍金币', type: '2', probability: 1, getType: '0' },
    { id: 8, name: '崚影卡', type: '3', probability: 5, getType: '1' },
    { id: 9, name: '扣除金币', type: '4', probability: 10, getType: '0' },
  ]
  await prizeModel.bulkCreate(prizes as any, {
    ignoreDuplicates: true,
  })
}
