import type {
  AccountStatus,
  Agency,
  DocumentType,
  Id,
  IsoDateTime,
  Preferences,
  ProfileRequest,
  RequestableRole,
  Role,
  SafetyContact,
  Session,
  SupportingDocument,
  User,
} from '@wakasafe/domain';

// M1 accounts and profiles, M9 account administration.

export interface AuthResult {
  session: Session;
  user: User;
}

/** F1.1 — every new account starts as an active Citizen (F1.3). */
export interface RegisterInput {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  photoUrl: string | null;
}

export interface PasswordResetRequest {
  expiresAt: IsoDateTime;
  /** Demo only: the code is displayed in the UI instead of being sent by SMS. Always null with a real backend. */
  demoCode: string | null;
}

export interface ResetPasswordInput {
  phone: string;
  code: string;
  newPassword: string;
}

export interface AuthRepository {
  register(input: RegisterInput): Promise<AuthResult>;
  login(phone: string, password: string): Promise<AuthResult>;
  logout(): Promise<void>;
  /** Restores the persisted session, or null when signed out. */
  getSession(): Promise<AuthResult | null>;
  requestPasswordReset(phone: string): Promise<PasswordResetRequest>;
  resetPassword(input: ResetPasswordInput): Promise<void>;
}

export type ProfileUpdate = Partial<Pick<User, 'firstName' | 'lastName' | 'photoUrl'>>;
export type PreferencesUpdate = Partial<Omit<Preferences, 'userId'>>;
export type SafetyContactInput = Omit<SafetyContact, 'id' | 'userId'> & { id?: Id };

export interface UserListFilters {
  role?: Role;
  status?: AccountStatus;
  /** Matches first name, last name or phone. */
  search?: string;
}

export interface SuspendUserInput {
  userId: Id;
  adminId: Id;
  reason: string;
  /** null = until manual reactivation. */
  until: IsoDateTime | null;
}

export interface UserRepository {
  getById(userId: Id): Promise<User>;
  list(filters?: UserListFilters): Promise<User[]>;
  updateProfile(userId: Id, update: ProfileUpdate): Promise<User>;
  getPreferences(userId: Id): Promise<Preferences>;
  updatePreferences(userId: Id, update: PreferencesUpdate): Promise<Preferences>;
  listSafetyContacts(userId: Id): Promise<SafetyContact[]>;
  upsertSafetyContact(userId: Id, input: SafetyContactInput): Promise<SafetyContact>;
  removeSafetyContact(userId: Id, contactId: Id): Promise<void>;
  suspend(input: SuspendUserInput): Promise<User>;
  reactivate(input: { userId: Id; adminId: Id }): Promise<User>;
}

export interface ProfileRequestSubmission {
  requestedRole: RequestableRole;
  /** Required for a Driver request. */
  agencyId: Id | null;
  /** Required for an Authority request. */
  organization: string | null;
  position: string | null;
}

export interface DocumentUpload {
  type: DocumentType;
  /** Local URI or uploaded file URL, depending on the implementation. */
  fileUrl: string;
}

export interface ProfileRequestRepository {
  submit(userId: Id, submission: ProfileRequestSubmission): Promise<ProfileRequest>;
  uploadDocument(requestId: Id, upload: DocumentUpload): Promise<SupportingDocument>;
  /** Latest request of the user, or null. */
  getForUser(userId: Id): Promise<ProfileRequest | null>;
  listDocuments(requestId: Id): Promise<SupportingDocument[]>;
  listPending(): Promise<ProfileRequest[]>;
  approve(input: { requestId: Id; adminId: Id }): Promise<ProfileRequest>;
  reject(input: { requestId: Id; adminId: Id; reason: string }): Promise<ProfileRequest>;
}

export interface AgencyRepository {
  list(): Promise<Agency[]>;
  getById(agencyId: Id): Promise<Agency>;
}
