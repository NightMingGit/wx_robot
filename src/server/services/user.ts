import user from '@server/models/user'

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
