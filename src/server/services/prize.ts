import prizeModel from '@server/models/prize'

// 通过getType获取奖品列表
export async function getPrizeList(type: string[]): Promise<any> {
  return await prizeModel.findAll({
    where: {
      getType: type,
    },
    raw: true,
  })
}
