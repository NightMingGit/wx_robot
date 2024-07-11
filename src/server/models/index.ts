import './user'
import './sign'
import './message'
import './activeGroup'
import './prize'
import { initGroupIds } from '@server/events/common'
import sequelize from './sequelize'

sequelize.sync({ alter: true }).then(async () => {
  console.log('数据库同步成功')
  // 初始化一些数据
  await initGroupIds()
})
