import activeGroup from '@server/models/activeGroup'

export async function getActiveGroup() {
  return await activeGroup.findOne({
    where: {
      id: 1,
    },
  })
}

export async function setActiveGroup(ids: string) {
  return await activeGroup.update({ ids }, { where: { id: 1 } })
}

export async function createActiveGroup() {
  return await activeGroup.create({ id: 1, ids: '[]' })
}
