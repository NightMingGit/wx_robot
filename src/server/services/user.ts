import user from '@server/models/user'
import { Op, Sequelize } from 'sequelize'

export async function getGroupUsers(group_id: string) {
  return await user.findAll({
    where: {
      group_id,
    },
  })
}

export async function getUserInfo(user_id: string, group_id: string): Promise<any> {
  return await user.findOne({
    where: {
      user_id,
      group_id,
    },
    raw: true,
  })
}

export async function createUser(user_id: string, group_id: string, name: string) {
  return await user.create({
    user_id,
    group_id,
    name,
  })
}

export async function updateUser(user_id: string, group_id: string, name: string) {
  return await user.update(
    {
      name,
    },
    {
      where: {
        user_id,
        group_id,
      },
    },
  )
}

// 增加score或者减少score
export async function updateScore(user_id: string, group_id: string, score: number) {
  return await user.update(
    {
      score: Sequelize.literal(`score + ${score}`),
    },
    {
      where: {
        user_id,
        group_id,
      },
    },
  )
}

// 删除用户
export async function deleteUser(user_id: string, group_id: string) {
  return await user.destroy({
    where: {
      user_id,
      group_id,
    },
  })
}

// card字段+1
export async function updateCard(user_id: string, group_id: string) {
  return await user.update(
    {
      card: Sequelize.literal(`card + 1`),
    },
    {
      where: {
        user_id,
        group_id,
      },
    },
  )
}

// score排行前10
export async function getTop10(group_id: string) {
  return await user.findAll({
    where: {
      group_id,
      score: {
        [Op.gt]: 0,
      },
    },
    order: [['score', 'DESC']],
    limit: 10,
    raw: true,
  })
}

// card排行前10
export async function getTop10Card(group_id: string) {
  return await user.findAll({
    where: {
      group_id,
      card: {
        [Op.gt]: 0,
      },
    },
    order: [['card', 'DESC']],
    raw: true,
  })
}

// 取出score最多的用户
export async function getTop1(group_id: string) {
  return await user.findOne({
    where: {
      group_id,
      score: {
        [Op.gt]: 0,
      },
    },
    order: [['score', 'DESC']],
    raw: true,
  })
}

// 设置daily字段
export async function setDaily(user_id: string, group_id: string, daily: string) {
  return await user.update(
    {
      daily,
    },
    {
      where: {
        user_id,
        group_id,
      },
    },
  )
}

// 删除所有人的daily字段
export async function deleteDaily(group_id: string) {
  return await user.update({ daily: '' }, { where: { group_id } })
}
