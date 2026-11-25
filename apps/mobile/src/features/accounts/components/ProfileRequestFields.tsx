import type { Role } from '@wakasafe/domain';

import { fieldMessage, type FormErrors } from '@/lib/forms';
import { fr } from '@/lib/i18n';
import { ChoiceGroup, ErrorView, LoadingView, TextField, type Choice } from '@/ui';

import { useAgencies } from '../hooks/useProfileData';

export type ProfileChoice = Exclude<Role, 'ADMIN'>;

export interface ProfileDraft {
  role: ProfileChoice;
  agencyId: string | null;
  organization: string;
  position: string;
}

export const EMPTY_PROFILE_DRAFT: ProfileDraft = {
  role: 'CITIZEN',
  agencyId: null,
  organization: '',
  position: '',
};

const ROLE_ICONS = {
  CITIZEN: 'person-outline',
  DRIVER: 'bus-outline',
  AUTHORITY: 'shield-outline',
} as const;

interface ProfileRequestFieldsProps {
  draft: ProfileDraft;
  /** Receives only the changed fields, so that quick successive changes are all kept. */
  onChange: (update: Partial<ProfileDraft>) => void;
  errors: FormErrors;
  /** The Citizen option only exists at registration; the profile asks for another role. */
  roles: readonly ProfileChoice[];
}

/** F1.3: desired profile, with the agency of a Driver or the position of an Authority. */
export function ProfileRequestFields({
  draft,
  onChange,
  errors,
  roles,
}: ProfileRequestFieldsProps) {
  const options: Choice<ProfileChoice>[] = roles.map((role) => ({
    value: role,
    label: fr.enums.role[role],
    description: fr.register.roleDescriptions[role],
    icon: ROLE_ICONS[role],
  }));
  return (
    <>
      <ChoiceGroup
        label={fr.profileRequest.role}
        options={options}
        value={draft.role}
        onChange={(role) => onChange({ role })}
        testID="profile-role"
      />
      {draft.role === 'DRIVER' && (
        <AgencyField
          value={draft.agencyId}
          onChange={(agencyId) => onChange({ agencyId })}
          error={fieldMessage(errors, 'agencyId')}
        />
      )}
      {draft.role === 'AUTHORITY' && (
        <>
          <TextField
            label={fr.form.organization}
            hint={fr.form.organizationHint}
            value={draft.organization}
            onChangeText={(organization) => onChange({ organization })}
            error={fieldMessage(errors, 'organization')}
            maxLength={80}
            testID="profile-organization"
          />
          <TextField
            label={fr.form.position}
            hint={fr.form.positionHint}
            value={draft.position}
            onChangeText={(position) => onChange({ position })}
            error={fieldMessage(errors, 'position')}
            maxLength={80}
            testID="profile-position"
          />
        </>
      )}
    </>
  );
}

function AgencyField({
  value,
  onChange,
  error,
}: {
  value: string | null;
  onChange: (agencyId: string) => void;
  error?: string;
}) {
  const agencies = useAgencies();
  if (agencies.isPending) return <LoadingView />;
  if (agencies.isError) {
    return <ErrorView error={agencies.error} onRetry={() => void agencies.refetch()} />;
  }
  return (
    <ChoiceGroup
      label={fr.form.agency}
      options={agencies.data.map((agency) => ({
        value: agency.id,
        label: agency.name,
        description: agency.city,
      }))}
      value={value}
      onChange={onChange}
      error={error}
      testID="profile-agency"
    />
  );
}

/** Submission sent to the repository; the Citizen choice sends no request. */
export function toSubmission(draft: ProfileDraft) {
  if (draft.role === 'CITIZEN') return null;
  return {
    requestedRole: draft.role,
    agencyId: draft.agencyId,
    organization: draft.organization,
    position: draft.position,
  };
}
