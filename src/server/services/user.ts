import user from '@server/models/user'
import { Sequelize } from 'sequelize'

export async function getGroupUsers(group_id: string) {
  return await user.findAll({
    where: {
      group_id,
    },
  })
}

export async function getUserInfo(user_id: string, group_id: string) {
  return await user.findOne({
    where: {
      user_id,
      group_id,
    },
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
