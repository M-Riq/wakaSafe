import { isOpenToVotes, type Report, type Verdict } from '@wakasafe/domain';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { FormError } from '@/features/accounts';
import { format, formatDateTime, fr, plural } from '@/lib/i18n';
import { AppText, Banner, Button, Card, colors, Icon, spacing } from '@/ui';

import { useActionQuota, useUserVote, useVote } from '../hooks/useReports';

interface VotePanelProps {
  report: Report;
  isAuthor: boolean;
  isReadOnly: boolean;
}

/** F2.4 community consensus: counters, then confirm or refute once. */
export function VotePanel({ report, isAuthor, isReadOnly }: VotePanelProps) {
  return (
    <Card testID="report-votes">
      <AppText variant="heading">{fr.reportDetail.community}</AppText>
      <View style={styles.counters}>
        <Counter icon="thumbs-up-outline" color={colors.success} testID="report-confirmations">
          {format(plural(report.confirmations, fr.reportDetail.confirmations), {
            count: report.confirmations,
          })}
        </Counter>
        <Counter icon="thumbs-down-outline" color={colors.danger} testID="report-refutations">
          {format(plural(report.refutations, fr.reportDetail.refutations), {
            count: report.refutations,
          })}
        </Counter>
      </View>
      <AppText variant="caption" tone="muted">
        {fr.reportDetail.thresholdHint}
      </AppText>
      <VoteActions report={report} isAuthor={isAuthor} isReadOnly={isReadOnly} />
    </Card>
  );
}

function VoteActions({ report, isAuthor, isReadOnly }: VotePanelProps) {
  if (isAuthor) {
    return <Banner tone="info" title={fr.reportDetail.ownReport} testID="vote-own-report" />;
  }
  if (isReadOnly) {
    return <Banner tone="danger" title={fr.reportDetail.readOnly} testID="vote-read-only" />;
  }
  return <VoterActions report={report} />;
}

function VoterActions({ report }: { report: Report }) {
  const userVote = useUserVote(report.id);
  const quota = useActionQuota();
  const vote = useVote(report.id);
  const [outcome, setOutcome] = useState<string | null>(null);

  if (userVote.isPending || quota.isPending) return null;

  if (userVote.data) {
    return (
      <Banner tone="success" title={fr.reportDetail.yourVote[userVote.data]} testID="vote-done">
        {outcome ?? undefined}
      </Banner>
    );
  }
  if (!isOpenToVotes(report.status)) {
    return <Banner tone="info" title={fr.reportDetail.closedToVotes} testID="vote-closed" />;
  }
  if (quota.data && quota.data.votesRemaining === 0) {
    return (
      <Banner
        tone="warning"
        title={format(fr.reportDetail.voteQuotaReached, {
          date: quota.data.votesAvailableAt ? formatDateTime(quota.data.votesAvailableAt) : '',
        })}
        testID="vote-quota-reached"
      />
    );
  }

  const send = (verdict: Verdict) =>
    vote.mutate(verdict, {
      onSuccess: (updated) => {
        const validatedNow = report.status !== 'VALIDATED' && updated.status === 'VALIDATED';
        setOutcome(
          validatedNow
            ? `${fr.reportDetail.thanks} ${fr.reportDetail.nowValidated}`
            : fr.reportDetail.thanks,
        );
      },
    });
  return (
    <View style={styles.actions}>
      <AppText variant="label">{fr.reportDetail.question}</AppText>
      <View style={styles.buttons}>
        <View style={styles.button}>
          <Button
            label={fr.reportDetail.confirm}
            accessibilityHint={fr.reportDetail.confirmHint}
            icon="thumbs-up-outline"
            loading={vote.isPending && vote.variables === 'CONFIRM'}
            disabled={vote.isPending}
            onPress={() => send('CONFIRM')}
            testID="vote-confirm"
          />
        </View>
        <View style={styles.button}>
          <Button
            label={fr.reportDetail.refute}
            accessibilityHint={fr.reportDetail.refuteHint}
            variant="danger"
            icon="thumbs-down-outline"
            loading={vote.isPending && vote.variables === 'REFUTE'}
            disabled={vote.isPending}
            onPress={() => send('REFUTE')}
            testID="vote-refute"
          />
        </View>
      </View>
      <FormError error={vote.error} testID="vote-error" />
    </View>
  );
}

function Counter({
  icon,
  color,
  children,
  testID,
}: {
  icon: 'thumbs-up-outline' | 'thumbs-down-outline';
  color: string;
  children: string;
  testID: string;
}) {
  return (
    <View style={styles.counter} testID={testID}>
      <Icon name={icon} color={color} />
      <AppText variant="label">{children}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  counters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  counter: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  actions: { gap: spacing.sm },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  button: { flexGrow: 1, flexBasis: 140 },
});
