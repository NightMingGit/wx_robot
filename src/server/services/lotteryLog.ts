import lotteryLog from '@server/models/lotteryLog'

// 通过日期查询今日是否抽奖
export async function getTodayLotteryLog(date: string) {
  return await lotteryLog.findOne({
    where: {
      date,
    },
  })
}
