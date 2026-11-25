import { BUSINESS_RULES } from './config/business-rules';
import type { ProfileRequest, RequestableRole, User } from './entities/accounts';

/** A suspension is effective until `suspendedUntil` (null = until manual reactivation). */
export function isAccountSuspended(user: Pick<User, 'status' | 'suspendedUntil'>, now: Date) {
  if (user.status !== 'SUSPENDED') return false;
  return user.suspendedUntil === null || new Date(user.suspendedUntil).getTime() > now.getTime();
}

export interface ClientCapabilities {
  /** Administrators only use the admin application (ADR-0001, ADR-0009). */
  canUseClientApp: boolean;
  /** Suspended accounts can sign in but only read (F2.6, F9.3). */
  isReadOnly: boolean;
  canReport: boolean;
  canVote: boolean;
  canTakeQuiz: boolean;
  canRate: boolean;
  /** Driver statistics area (F6.4): validated drivers only. */
  canAccessDriverArea: boolean;
  /** Authorities keep the Citizen rights in the client app; their simplified view is in the admin app (F9.7). */
  isAuthority: boolean;
  /** Pending users keep the Citizen rights until a decision is made (F1.3). */
  pendingRequestRole: RequestableRole | null;
  /** A Citizen may ask for the Driver or Authority profile, one pending request at a time (F1.3). */
  canRequestProfile: boolean;
}

export interface CapabilitiesInput {
  user: Pick<User, 'role' | 'status' | 'suspendedUntil'>;
  latestRequest: Pick<ProfileRequest, 'requestedRole' | 'status'> | null;
  now: Date;
}

/** Rights of a signed-in user in the client application. */
export function getClientCapabilities({
  user,
  latestRequest,
  now,
}: CapabilitiesInput): ClientCapabilities {
  const canUseClientApp = user.role !== 'ADMIN';
  const isReadOnly = isAccountSuspended(user, now);
  const canAct = canUseClientApp && !isReadOnly;
  const status = latestRequest?.status;
  const newRequestAllowed =
    status !== 'PENDING' &&
    (status !== 'REJECTED' || BUSINESS_RULES.profileRequests.allowNewRequestAfterRejection);
  return {
    canUseClientApp,
    isReadOnly,
    canReport: canAct,
    canVote: canAct,
    canTakeQuiz: canAct,
    canRate: canAct,
    canAccessDriverArea: canUseClientApp && user.role === 'DRIVER',
    isAuthority: user.role === 'AUTHORITY',
    pendingRequestRole: latestRequest?.status === 'PENDING' ? latestRequest.requestedRole : null,
    canRequestProfile: canAct && user.role === 'CITIZEN' && newRequestAllowed,
  };
}
