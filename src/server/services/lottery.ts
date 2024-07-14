import model from '@server/models/lottery'
import { getDateTime } from '@server/utils/utils'

// 开启一个抽奖
export async function createLottery(user_id: string, name: string, count: number, list: string) {
  return await model.create({
    user_id,
    name,
    count,
    list,
    status: '0',
    date: getDateTime(),
  })
}

// 查询当前数据库是否有抽奖在进行  status 是0 就是正在进行中
export async function getLottery() {
  return await model.findOne({
    where: {
      status: '0',
    },
  })
}
// 保存list
export async function saveList(id: number, list: string) {
  return await model.update(
    {
      list,
    },
    {
      where: {
        id,
      },
    },
  )
}
// 结束抽奖 把status 改为1
export async function endLottery(id: number) {
  return await model.update(
    {
      status: '1',
    },
    {
      where: {
        id,
      },
    },
  )
}