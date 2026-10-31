import { prisma } from './prisma.js'

export const writeAudit = async (
  actorId: string,
  action: string,
  entity: string,
  entityId: string,
  details: object
) => {
  await prisma.auditLog.create({
    data: { actorId, action, entity, entityId, details: JSON.stringify(details) },
  })
}
