import {
  nearestPilotCity,
  type AffectedGroup,
  type Report,
  type ReportCategory,
  type Severity,
} from '@wakasafe/domain';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { FormError, useCapabilities } from '@/features/accounts';
import { fieldMessage, type FormErrors } from '@/lib/forms';
import { format, formatDateTime, fr, plural } from '@/lib/i18n';
import {
  AppText,
  Banner,
  Button,
  Card,
  ChoiceGroup,
  colors,
  Icon,
  InfoRow,
  Screen,
  sizes,
  spacing,
} from '@/ui';

import { LocationField, type PlacedLocation } from '../components/LocationField';
import { ReportPhotoField } from '../components/ReportPhotoField';
import { useActionQuota, useCreateReport } from '../hooks/useReports';
import {
  AFFECTED_GROUPS,
  CATEGORY_ICONS,
  createClientId,
  REPORT_CATEGORIES,
  SEVERITIES,
} from '../presentation';

/** F2.1 / F2.2 report form. A new key gives a blank form (and a new idempotency key). */
export function ReportFormScreen() {
  const [formKey, setFormKey] = useState(0);
  const sent = useRef(false);
  const reset = useCallback(() => {
    sent.current = false;
    setFormKey((key) => key + 1);
  }, []);
  // Coming back to the tab after a report shows a blank form, not the old confirmation.
  useFocusEffect(
    useCallback(
      () => () => {
        if (sent.current) reset();
      },
      [reset],
    ),
  );
  return (
    <ReportForm
      key={formKey}
      onSent={() => {
        sent.current = true;
      }}
      onReset={reset}
    />
  );
}

interface ReportFormProps {
  onSent: () => void;
  onReset: () => void;
}

function ReportForm({ onSent, onReset }: ReportFormProps) {
  const router = useRouter();
  const { isReadOnly } = useCapabilities();
  const quota = useActionQuota();
  const createReport = useCreateReport();
  const [clientId] = useState(createClientId);
  const [category, setCategory] = useState<ReportCategory | null>(null);
  const [severity, setSeverity] = useState<Severity | null>(null);
  const [affectedGroup, setAffectedGroup] = useState<AffectedGroup | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [location, setLocation] = useState<PlacedLocation | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  if (createReport.isSuccess) {
    return (
      <ReportSent
        report={createReport.data}
        onView={() => router.push(`/reports/${createReport.data.id}`)}
        onAnother={onReset}
      />
    );
  }

  const myReportsLink = (
    <Button
      label={fr.reportForm.myReports}
      variant="ghost"
      icon="list-outline"
      onPress={() => router.push('/reports/mine')}
      testID="report-my-reports"
    />
  );

  if (isReadOnly) {
    return (
      <Screen testID="report-form">
        <Banner tone="danger" title={fr.reportForm.readOnly} testID="report-read-only" />
        {myReportsLink}
      </Screen>
    );
  }

  if (quota.data && quota.data.reportsRemaining === 0) {
    return (
      <Screen testID="report-form">
        <Banner
          tone="warning"
          title={fr.reportForm.quotaReachedTitle}
          testID="report-quota-reached"
        >
          {format(fr.reportForm.quotaReachedBody, {
            date: quota.data.reportsAvailableAt
              ? formatDateTime(quota.data.reportsAvailableAt)
              : '',
          })}
        </Banner>
        {myReportsLink}
      </Screen>
    );
  }

  function edit<T>(setter: (value: T) => void) {
    return (value: T) => {
      createReport.reset();
      setter(value);
    };
  }

  function submit() {
    const next: FormErrors = {};
    if (!category) next.category = 'REQUIRED';
    if (!severity) next.severity = 'REQUIRED';
    if (!affectedGroup) next.affectedGroup = 'REQUIRED';
    if (!location) next.location = 'REQUIRED';
    setErrors(next);
    if (!category || !severity || !affectedGroup || !location) return;
    createReport.mutate(
      {
        clientId,
        category,
        severity,
        affectedGroup,
        location: location.point,
        city: nearestPilotCity(location.point),
        photoUrl,
        // F2.2: date and time are those of the report, set automatically.
        occurredAt: new Date().toISOString(),
      },
      { onSuccess: onSent },
    );
  }

  return (
    <Screen testID="report-form">
      <AppText tone="muted">{fr.reportForm.intro}</AppText>
      {myReportsLink}
      {quota.data && (
        <AppText variant="caption" tone="muted" testID="report-quota-left">
          {format(plural(quota.data.reportsRemaining, fr.reportForm.quotaLeft), {
            count: quota.data.reportsRemaining,
          })}
        </AppText>
      )}
      <ChoiceGroup
        label={fr.reportForm.category}
        options={REPORT_CATEGORIES.map((value) => ({
          value,
          label: fr.enums.reportCategory[value],
          icon: CATEGORY_ICONS[value],
        }))}
        value={category}
        onChange={edit(setCategory)}
        error={fieldMessage(errors, 'category')}
        inline
        testID="report-category"
      />
      <ChoiceGroup
        label={fr.reportForm.severity}
        options={SEVERITIES.map((value) => ({
          value,
          label: fr.enums.severity[value],
          description: fr.enums.severityDescription[value],
        }))}
        value={severity}
        onChange={edit(setSeverity)}
        error={fieldMessage(errors, 'severity')}
        inline
        testID="report-severity"
      />
      <ChoiceGroup
        label={fr.reportForm.affectedGroup}
        options={AFFECTED_GROUPS.map((value) => ({
          value,
          label: fr.enums.affectedGroup[value],
        }))}
        value={affectedGroup}
        onChange={edit(setAffectedGroup)}
        error={fieldMessage(errors, 'affectedGroup')}
        inline
        testID="report-affected-group"
      />
      <LocationField
        value={location}
        onChange={edit(setLocation)}
        error={fieldMessage(errors, 'location')}
      />
      <ReportPhotoField photoUrl={photoUrl} onChange={edit(setPhotoUrl)} />
      <InfoRow
        label={fr.reportForm.dateTime}
        value={fr.reportForm.dateTimeAuto}
        icon="time-outline"
      />
      <FormError error={createReport.error} testID="report-error" />
      <Button
        label={fr.reportForm.submit}
        icon="send-outline"
        loading={createReport.isPending}
        onPress={submit}
        testID="report-submit"
      />
    </Screen>
  );
}

interface ReportSentProps {
  report: Report;
  onView: () => void;
  onAnother: () => void;
}

function ReportSent({ report, onView, onAnother }: ReportSentProps) {
  const underReview = report.status === 'SUSPICIOUS';
  return (
    <Screen testID="report-sent">
      <Card style={styles.sent}>
        <Icon
          name={underReview ? 'hourglass-outline' : 'checkmark-circle'}
          size={sizes.iconLg}
          color={underReview ? colors.onWarningSoft : colors.success}
        />
        <AppText variant="heading" accessibilityRole="header" accessibilityLiveRegion="polite">
          {underReview ? fr.reportForm.underReviewTitle : fr.reportForm.sentTitle}
        </AppText>
        <AppText tone="muted">
          {underReview ? fr.reportForm.underReviewBody : fr.reportForm.sentBody}
        </AppText>
        <View style={styles.actions}>
          <Button
            label={fr.reportForm.view}
            icon="eye-outline"
            onPress={onView}
            testID="report-sent-view"
          />
          <Button
            label={fr.reportForm.another}
            variant="secondary"
            icon="add-circle-outline"
            onPress={onAnother}
            testID="report-sent-another"
          />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sent: { alignItems: 'flex-start' },
  actions: { alignSelf: 'stretch', gap: spacing.sm },
});
