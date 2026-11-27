import { formatCameroonPhone, REQUIRED_DOCUMENTS, type ProfileRequest } from '@wakasafe/domain';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useDemoTools } from '@/data';
import { format, formatDate, formatDateTime, fr } from '@/lib/i18n';
import {
  AppText,
  Avatar,
  Badge,
  Banner,
  Button,
  Card,
  ErrorView,
  InfoRow,
  LoadingView,
  Screen,
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

  return (
    <Screen testID="profile">
      <Card>
        <View style={styles.identity}>
          <Avatar firstName={user.firstName} lastName={user.lastName} photoUrl={user.photoUrl} />
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
        <Button
          label={fr.profile.editProfile}
          variant="secondary"
          icon="create-outline"
          onPress={() => router.push('/profile/edit')}
          testID="profile-edit"
        />
      </Card>

      <StatusBanners
        request={request.data}
        onRequestAgain={
          capabilities.canRequestProfile ? () => router.push('/profile/request') : undefined
        }
      />

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

      {capabilities.canRequestProfile && request.data?.status !== 'REJECTED' && (
        <Card testID="profile-request-card">
          <AppText variant="heading">{fr.profile.requestTitle}</AppText>
          <AppText tone="muted">{fr.profile.requestBody}</AppText>
          <Button
            label={fr.profile.requestAction}
            variant="secondary"
            icon="ribbon-outline"
            onPress={() => router.push('/profile/request')}
            testID="profile-request-link"
          />
        </Card>
      )}

      {request.data && (
        <DocumentsCard
          request={request.data}
          canComplete={!capabilities.isReadOnly}
          onOpen={() => router.push('/profile/documents')}
        />
      )}

      <Card>
        <CardHeader
          title={fr.profile.safetyContacts}
          actionLabel={fr.profile.manage}
          actionHint={fr.profile.safetyContacts}
          onAction={() => router.push('/profile/safety-contacts')}
          testID="profile-safety-contacts"
        />
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
          <CardHeader
            title={fr.profile.preferences}
            actionLabel={fr.common.edit}
            actionHint={fr.profile.preferences}
            onAction={() => router.push('/profile/preferences')}
            testID="profile-preferences"
          />
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
        </Card>
      )}

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

function CardHeader({
  title,
  actionLabel,
  actionHint,
  onAction,
  testID,
}: {
  title: string;
  actionLabel: string;
  actionHint: string;
  onAction: () => void;
  testID: string;
}) {
  return (
    <View style={styles.cardHeader}>
      <AppText variant="heading" style={styles.cardTitle}>
        {title}
      </AppText>
      <View>
        <Button
          label={actionLabel}
          accessibilityLabel={`${actionLabel}, ${actionHint}`}
          variant="ghost"
          icon="chevron-forward-outline"
          onPress={onAction}
          testID={testID}
        />
      </View>
    </View>
  );
}

function StatusBanners({
  request,
  onRequestAgain,
}: {
  request: ProfileRequest | null;
  /** Set when a new request is allowed after the rejection. */
  onRequestAgain?: () => void;
}) {
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
      <Banner
        tone="danger"
        title={format(fr.profile.rejectedTitle, { role })}
        testID="rejected-banner"
      >
        <AppText variant="caption" tone="danger">
          {format(fr.profile.rejectedBody, { reason: request.rejectionReason ?? '—' })}
        </AppText>
        {onRequestAgain && (
          <Button
            label={fr.profile.requestAgain}
            variant="secondary"
            icon="refresh-outline"
            onPress={onRequestAgain}
            testID="profile-request-again"
          />
        )}
      </Banner>
    );
  }
  return null;
}

function DocumentsCard({
  request,
  canComplete,
  onOpen,
}: {
  request: ProfileRequest;
  /** False when the account is read-only. */
  canComplete: boolean;
  onOpen: () => void;
}) {
  const documents = useProfileDocuments(request.id);
  const provided = new Set(documents.data?.map((document) => document.type));
  const missing = REQUIRED_DOCUMENTS[request.requestedRole].filter((type) => !provided.has(type));
  const pending = request.status === 'PENDING';
  const complete = pending && canComplete && missing.length > 0;
  return (
    <Card testID="documents-card">
      <View style={styles.cardHeader}>
        <AppText variant="heading" style={styles.cardTitle}>
          {fr.profile.documents}
        </AppText>
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
      {pending && documents.data && (
        <AppText tone={missing.length > 0 ? 'default' : 'success'} testID="documents-summary">
          {missing.length > 0
            ? format(fr.profile.documentsMissing, {
                list: missing.map((type) => fr.enums.documentType[type]).join(', '),
              })
            : fr.profile.documentsComplete}
        </AppText>
      )}
      <Button
        label={complete ? fr.profile.completeDocuments : fr.profile.viewDocuments}
        variant={complete ? 'primary' : 'secondary'}
        icon={complete ? 'cloud-upload-outline' : 'document-text-outline'}
        onPress={onOpen}
        testID="profile-documents-link"
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  identityText: { flex: 1, gap: spacing.sm },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cardTitle: { flexShrink: 1 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
});
