import {
  BUSINESS_RULES,
  formatCameroonPhone,
  SafetyContactInputSchema,
  type SafetyContact,
} from '@wakasafe/domain';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { fieldMessage, serverFieldErrors, validateForm, type FormErrors } from '@/lib/forms';
import { format, fr } from '@/lib/i18n';
import {
  AppText,
  Badge,
  Banner,
  Button,
  Card,
  ErrorView,
  LoadingView,
  Screen,
  spacing,
  TextField,
} from '@/ui';

import { FormError } from '../components/FormError';
import { useRemoveSafetyContact, useSaveSafetyContact } from '../hooks/useAccountMutations';
import { useSafetyContacts } from '../hooks/useProfileData';
import { useCurrentUser } from '../hooks/useSession';

const { maxSafetyContacts } = BUSINESS_RULES.accounts;

/** Contact being edited: a new one, or an existing one. */
type Editing = { mode: 'new' } | { mode: 'edit'; contact: SafetyContact };

/** F1.5: up to five people to warn in case of trouble on the road. */
export function SafetyContactsScreen() {
  const user = useCurrentUser();
  const contacts = useSafetyContacts(user.id);
  const removeContact = useRemoveSafetyContact();
  const [editing, setEditing] = useState<Editing | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<SafetyContact | null>(null);

  if (contacts.isPending) return <LoadingView />;
  if (contacts.isError) {
    return (
      <Screen>
        <ErrorView error={contacts.error} onRetry={() => void contacts.refetch()} />
      </Screen>
    );
  }

  const list = contacts.data;
  const limitReached = list.length >= maxSafetyContacts;

  function remove(contact: SafetyContact) {
    removeContact.mutate(contact.id, { onSuccess: () => setConfirmingDelete(null) });
  }

  return (
    <Screen testID="safety-contacts">
      <AppText tone="muted">{fr.safetyContacts.intro}</AppText>
      <View style={styles.countRow}>
        <Badge
          label={format(fr.safetyContacts.count, { count: list.length, max: maxSafetyContacts })}
          tone={limitReached ? 'warning' : 'neutral'}
          icon="people-outline"
        />
      </View>

      {list.length === 0 && !editing && (
        <AppText tone="muted">{fr.profile.noSafetyContact}</AppText>
      )}

      {list.map((contact) =>
        editing?.mode === 'edit' && editing.contact.id === contact.id ? (
          <ContactForm key={contact.id} contact={contact} onDone={() => setEditing(null)} />
        ) : (
          <Card key={contact.id} testID={`safety-contact-${contact.id}`}>
            <AppText variant="heading">{contact.name}</AppText>
            <AppText tone="muted">
              {contact.relation
                ? `${contact.relation} · ${formatCameroonPhone(contact.phone)}`
                : formatCameroonPhone(contact.phone)}
            </AppText>
            {confirmingDelete?.id === contact.id ? (
              <Banner
                tone="warning"
                title={format(fr.safetyContacts.confirmDelete, { name: contact.name })}
              >
                <View style={styles.actions}>
                  <FormError error={removeContact.error} />
                  <Button
                    label={fr.common.delete}
                    variant="danger"
                    icon="trash-outline"
                    loading={removeContact.isPending}
                    onPress={() => remove(contact)}
                    testID={`safety-contact-confirm-delete-${contact.id}`}
                  />
                  <Button
                    label={fr.common.cancel}
                    variant="ghost"
                    disabled={removeContact.isPending}
                    onPress={() => setConfirmingDelete(null)}
                  />
                </View>
              </Banner>
            ) : (
              <View style={styles.row}>
                <View style={styles.rowButton}>
                  <Button
                    label={fr.common.edit}
                    accessibilityLabel={format(fr.safetyContacts.editLabel, { name: contact.name })}
                    variant="secondary"
                    icon="create-outline"
                    disabled={editing !== null}
                    onPress={() => setEditing({ mode: 'edit', contact })}
                    testID={`safety-contact-edit-${contact.id}`}
                  />
                </View>
                <View style={styles.rowButton}>
                  <Button
                    label={fr.common.delete}
                    accessibilityLabel={format(fr.safetyContacts.deleteLabel, {
                      name: contact.name,
                    })}
                    variant="danger"
                    icon="trash-outline"
                    disabled={editing !== null}
                    onPress={() => {
                      removeContact.reset();
                      setConfirmingDelete(contact);
                    }}
                    testID={`safety-contact-delete-${contact.id}`}
                  />
                </View>
              </View>
            )}
          </Card>
        ),
      )}

      {editing?.mode === 'new' ? (
        <ContactForm onDone={() => setEditing(null)} />
      ) : limitReached ? (
        <Banner tone="info" title={fr.safetyContacts.limitReached} />
      ) : (
        <Button
          label={fr.safetyContacts.add}
          icon="person-add-outline"
          disabled={editing !== null}
          onPress={() => {
            setConfirmingDelete(null);
            setEditing({ mode: 'new' });
          }}
          testID="safety-contact-add"
        />
      )}
    </Screen>
  );
}

function ContactForm({ contact, onDone }: { contact?: SafetyContact; onDone: () => void }) {
  const saveContact = useSaveSafetyContact();
  const [name, setName] = useState(contact?.name ?? '');
  const [phone, setPhone] = useState(contact ? formatCameroonPhone(contact.phone) : '');
  const [relation, setRelation] = useState(contact?.relation ?? '');
  const [errors, setErrors] = useState<FormErrors>({});

  function save() {
    const result = validateForm(SafetyContactInputSchema, {
      id: contact?.id,
      name,
      phone,
      relation,
    });
    setErrors(result.errors);
    if (!result.success) return;
    saveContact.mutate(result.data, {
      onSuccess: onDone,
      onError: (error) => setErrors(serverFieldErrors(error)),
    });
  }

  return (
    <Card testID="safety-contact-form">
      <AppText variant="heading">
        {contact ? fr.safetyContacts.editContact : fr.safetyContacts.newContact}
      </AppText>
      <TextField
        label={fr.safetyContacts.name}
        value={name}
        onChangeText={setName}
        error={fieldMessage(errors, 'name')}
        autoCapitalize="words"
        autoComplete="name"
        maxLength={80}
        testID="safety-contact-name"
      />
      <TextField
        label={fr.form.phone}
        hint={fr.form.phoneHint}
        value={phone}
        onChangeText={setPhone}
        error={fieldMessage(errors, 'phone')}
        inputMode="tel"
        keyboardType="phone-pad"
        autoComplete="tel"
        testID="safety-contact-phone"
      />
      <TextField
        label={format(fr.common.optional, { label: fr.safetyContacts.relation })}
        hint={fr.safetyContacts.relationHint}
        value={relation}
        onChangeText={setRelation}
        error={fieldMessage(errors, 'relation')}
        maxLength={40}
        testID="safety-contact-relation"
      />
      <FormError error={saveContact.error} />
      <Button
        label={fr.common.save}
        icon="checkmark-outline"
        loading={saveContact.isPending}
        onPress={save}
        testID="safety-contact-save"
      />
      <Button
        label={fr.common.cancel}
        variant="ghost"
        disabled={saveContact.isPending}
        onPress={onDone}
        testID="safety-contact-cancel"
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  countRow: { flexDirection: 'row' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  rowButton: { flexGrow: 1, flexBasis: 120 },
  actions: { gap: spacing.sm },
});
