import { AuditEvent, UserProfile, UserRole } from '../types';

export function createAuditEvent(
  user: UserProfile | { id: string; name: string; role: UserRole },
  action: string,
  entityType: AuditEvent['entityType'],
  entityId: string,
  entityRef: string,
  details: string,
  previousValue?: string,
  newValue?: string
): AuditEvent {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action,
    entityType,
    entityId,
    entityRef,
    details,
    previousValue,
    newValue
  };
}
