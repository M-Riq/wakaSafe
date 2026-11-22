import { formatCameroonPhone, type ProfileRequest } from '@wakasafe/domain';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useDemoTools } from '@/data';
import { format, formatDate, formatDateTime, fr } from '@/lib/i18n';
import {
  AppText,
  Badge,
  Banner,
  Button,
  Card,
  colors,
  ErrorView,
  InfoRow,
  LoadingView,
  radii,
  Screen,
  sizes,
  spacing,
} from '@/ui';

import {
  useCapabilities,
  useLatestProfileRequest,
  usePreferences,
  useProfileDocuments,
  useSafetyContacts,
} from '../hooks/useProfileData';
import { useCurrentUser, useResetDemo, useSignOut } from '../hooks/useSession';

export function ProfileScreen() {
  const router = useRouter();
  const user = useCurrentUser();
  const capabilities = useCapabilities();
  const request = useLatestProfileRequest(user.id);
  const contacts = useSafetyContacts(user.id);
  const preferences = usePreferences(user.id);
  const demo = useDemoTools();
  const signOut = useSignOut();
  const resetDemo = useResetDemo();

  if (request.isPending) return <LoadingView />;
  if (request.isError) {
    return (
      <Screen>
        <ErrorView error={request.error} onRetry={() => void request.refetch()} />
      </Screen>
    );
  }

  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();

  return (
    <Screen testID="profile">
      <Card>
        <View style={styles.identity}>
          <View style={styles.avatar} aria-hidden>
            <AppText variant="heading" tone="inverse">
              {initials}
            </AppText>
          </View>
          <View style={styles.identityText}>
            <AppText variant="title">{`${user.firstName} ${user.lastName}`}</AppText>
            <View style={styles.badges}>
              <Badge label={fr.enums.role[user.role]} tone="primary" icon="person-outline" />
              <Badge
                label={fr.enums.accountStatus[capabilities.isReadOnly ? 'SUSPENDED' : 'ACTIVE']}
                tone={capabilities.isReadOnly ? 'danger' : 'success'}
              />
            </View>
          </View>
        </View>
        <InfoRow
          icon="call-outline"
          label={fr.profile.phone}
          value={formatCameroonPhone(user.phone)}
        />
        <InfoRow
          icon="calendar-outline"
          label={fr.profile.memberSince}
          value={formatDate(user.createdAt)}
        />
      </Card>

      <StatusBanners request={request.data} />

      {capabilities.isReadOnly && (
        <Banner tone="danger" title={fr.profile.suspendedTitle} testID="suspended-banner">
          {user.suspendedUntil
            ? format(fr.profile.suspendedBody, { date: formatDateTime(user.suspendedUntil) })
            : fr.profile.suspendedIndefinitely}
        </Banner>
      )}

      {capabilities.isAuthority && (
        <Banner tone="info" title={fr.profile.authorityTitle}>
          {fr.profile.authorityBody}
        </Banner>
      )}

      {capabilities.canAccessDriverArea && (
        <Button
          label={fr.profile.driverArea}
          icon="bus-outline"
          onPress={() => router.push('/driver')}
          testID="driver-area-link"
        />
      )}

      {request.data && <DocumentsCard request={request.data} />}

      <Card>
        <AppText variant="heading">{fr.profile.safetyContacts}</AppText>
        {contacts.data?.length ? (
          contacts.data.map((contact) => (
            <InfoRow
              key={contact.id}
              icon="people-outline"
              label={contact.relation ?? contact.name}
              value={`${contact.name} · ${formatCameroonPhone(contact.phone)}`}
            />
          ))
        ) : (
          <AppText tone="muted">{fr.profile.noSafetyContact}</AppText>
        )}
      </Card>

      {preferences.data && (
        <Card>
          <AppText variant="heading">{fr.profile.preferences}</AppText>
          <InfoRow
            icon="warning-outline"
            label={fr.profile.nearbyAlerts}
            value={
              preferences.data.nearbyDangerAlerts
                ? `${fr.profile.alertsEnabled} · ${format(fr.profile.nearbyRadius, { km: preferences.data.nearbyRadiusKm })}`
                : fr.profile.alertsDisabled
            }
          />
          <InfoRow
            icon="notifications-outline"
            label={fr.profile.quizReminders}
            value={
              preferences.data.quizReminders
                ? fr.profile.remindersEnabled
                : fr.profile.remindersDisabled
            }
          />
          <AppText variant="caption" tone="subtle">
            {fr.profile.editingSoon}
          </AppText>
        </Card>
      )}

      <Button
        label={fr.profile.projectProgress}
        variant="secondary"
        icon="git-branch-outline"
        onPress={() => router.push('/project-progress')}
      />

      <Card>
        <AppText variant="heading">{fr.profile.demoSection}</AppText>
        {demo && (
          <>
            <AppText variant="caption" tone="muted">
              {fr.profile.resetDemoHint}
            </AppText>
            <Button
              label={fr.profile.resetDemo}
              variant="danger"
              icon="refresh-outline"
              loading={resetDemo.isPending}
              onPress={() => resetDemo.mutate()}
              testID="reset-demo"
            />
          </>
        )}
        <Button
          label={fr.profile.signOut}
          variant="ghost"
          icon="log-out-outline"
          loading={signOut.isPending}
          onPress={() => signOut.mutate()}
          testID="sign-out"
        />
      </Card>
    </Screen>
  );
}

function StatusBanners({ request }: { request: ProfileRequest | null }) {
  if (!request) return null;
  const role = fr.enums.role[request.requestedRole];
  if (request.status === 'PENDING') {
    return (
      <Banner
        tone="warning"
        title={format(fr.profile.pendingTitle, { role })}
        testID="pending-banner"
      >
        {fr.profile.pendingBody}
      </Banner>
    );
  }
  if (request.status === 'REJECTED') {
    return (
      <Banner tone="danger" title={format(fr.profile.rejectedTitle, { role })}>
        {format(fr.profile.rejectedBody, { reason: request.rejectionReason ?? '—' })}
      </Banner>
    );
  }
  return null;
}

function DocumentsCard({ request }: { request: ProfileRequest }) {
  const documents = useProfileDocuments(request.id);
  return (
    <Card>
      <View style={styles.documentsHeader}>
        <AppText variant="heading">{fr.profile.documents}</AppText>
        <Badge
          label={fr.enums.profileRequestStatus[request.status]}
          tone={
            request.status === 'APPROVED'
              ? 'success'
              : request.status === 'PENDING'
                ? 'warning'
                : 'danger'
          }
        />
      </View>
      {documents.data?.map((document) => (
        <InfoRow
          key={document.id}
          icon="document-attach-outline"
          label={fr.enums.documentType[document.type]}
          value={formatDate(document.uploadedAt)}
        />
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  avatar: {
    width: sizes.touchTarget + spacing.lg,
    height: sizes.touchTarget + spacing.lg,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  identityText: { flex: 1, gap: spacing.sm },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  documentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
});
