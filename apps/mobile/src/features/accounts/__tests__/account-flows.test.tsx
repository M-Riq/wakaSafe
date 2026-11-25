import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  act,
  fireEvent,
  renderRouter,
  screen,
  testRouter,
  waitFor,
} from 'expo-router/testing-library';

import { createAppData } from '@/data/app-data';
import { format, fr } from '@/lib/i18n';
import { pickImage } from '@/services/media';

import { useSessionStore } from '../session-store';

jest.mock('@/services/media', () => ({
  canUseCamera: true,
  pickImage: jest.fn(async () => ({ status: 'picked', dataUri: 'data:image/jpeg;base64,AAAA' })),
}));

const APP_DIR = './app';
const NEW_PASSWORD = 'route2026';

async function renderApp(initialUrl = '/') {
  await renderRouter(APP_DIR, { initialUrl });
}

async function type(testID: string, value: string) {
  await fireEvent.changeText(screen.getByTestId(testID), value);
}

async function press(testID: string) {
  await fireEvent.press(await screen.findByTestId(testID));
}

/** Persisted session, restored on start (faster than going through a form). */
async function startSignedIn(phone: string, initialUrl = '/') {
  const { repositories, demo } = createAppData();
  await repositories.auth.login(phone, demo!.password);
  await renderApp(initialUrl);
}

async function fillIdentity(phone = '6 00 00 07 77') {
  await screen.findByTestId('register-identity');
  await type('register-first-name', 'Awa');
  await type('register-last-name', 'Bello');
  await type('register-phone', phone);
  await type('register-password', NEW_PASSWORD);
  await type('register-confirm-password', NEW_PASSWORD);
  await press('register-terms');
  await press('register-continue');
}

beforeEach(async () => {
  await AsyncStorage.clear();
  useSessionStore.setState({ status: 'loading', auth: null, landing: null });
  jest.mocked(pickImage).mockClear();
});

describe('sign-in (F1.2)', () => {
  it('signs in with the phone number in a free format', async () => {
    await renderApp('/welcome');
    await press('welcome-sign-in');
    await type('login-phone', '6 00 00 00 01');
    await type('login-password', 'demo-wakasafe');
    await press('login-submit');
    expect(await screen.findByTestId('coming-soon-map')).toBeOnTheScreen();
  });

  it('flags empty fields before calling the repository', async () => {
    await renderApp('/login');
    await press('login-submit');
    expect(screen.getAllByText(fr.validation.REQUIRED)).toHaveLength(2);
  });

  it('rejects a wrong password', async () => {
    await renderApp('/login');
    await type('login-phone', '600000001');
    await type('login-password', 'wrong-password1');
    await press('login-submit');
    expect(await screen.findByText(fr.errors.INVALID_CREDENTIALS)).toBeOnTheScreen();
  });

  it('keeps administrators out of the client app', async () => {
    await renderApp('/login');
    await type('login-phone', '600000000');
    await type('login-password', 'demo-wakasafe');
    await press('login-submit');
    expect(await screen.findByText(fr.errorReasons.ADMIN_ACCOUNT)).toBeOnTheScreen();
  });
});

describe('registration (F1.1, F1.3, F1.4)', () => {
  it('activates a citizen account immediately', async () => {
    await renderApp('/welcome');
    await press('welcome-register');
    await fillIdentity();
    await screen.findByTestId('register-profile');
    await press('register-submit');
    expect(await screen.findByTestId('coming-soon-map')).toBeOnTheScreen();
    await testRouter.navigate('/profile');
    expect(await screen.findByText('Awa Bello')).toBeOnTheScreen();
    expect(screen.getByTestId('profile-request-card')).toBeOnTheScreen();
  });

  it('keeps every field filled at once, as the browser autofill does', async () => {
    await renderApp('/register');
    await screen.findByTestId('register-identity');
    // A single act() batches the changes, like an autofill that fills several fields together.
    await act(async () => {
      await type('register-first-name', 'Awa');
      await type('register-last-name', 'Bello');
      await type('register-phone', '6 00 00 07 77');
      await type('register-password', NEW_PASSWORD);
      await type('register-confirm-password', NEW_PASSWORD);
    });
    await press('register-terms');
    await press('register-continue');
    expect(await screen.findByTestId('register-profile')).toBeOnTheScreen();
  });

  it('checks the password confirmation and the terms of use', async () => {
    await renderApp('/register');
    await type('register-password', NEW_PASSWORD);
    await type('register-confirm-password', 'route2027');
    await press('register-continue');
    expect(screen.getByText(fr.validation.PASSWORDS_DO_NOT_MATCH)).toBeOnTheScreen();
    expect(screen.getByText(fr.validation.TERMS_REQUIRED)).toBeOnTheScreen();
    expect(screen.getByTestId('register-identity')).toBeOnTheScreen();
  });

  it('sends a driver request with its documents and keeps citizen rights', async () => {
    await renderApp('/register');
    await fillIdentity();
    await press('profile-role-DRIVER');
    await press('register-continue');
    expect(screen.getByText(fr.validation.REQUIRED)).toBeOnTheScreen();
    await press('profile-agency-agency-mifi');
    await press('register-continue');
    await screen.findByTestId('register-documents');
    await press('document-ID_CARD-picker-camera');
    await press('document-DRIVING_LICENSE-picker-library');
    expect(await screen.findAllByText(fr.documents.added)).toHaveLength(2);
    expect(pickImage).toHaveBeenCalledWith({ source: 'camera', purpose: 'document' });
    await press('register-submit');

    expect(await screen.findByTestId('pending-banner')).toBeOnTheScreen();
    expect(screen).toHavePathname('/profile');
    expect(await screen.findByText(fr.profile.documentsComplete)).toBeOnTheScreen();
    expect(screen.queryByTestId('driver-area-link')).toBeNull();
    expect(screen.queryByTestId('profile-request-card')).toBeNull();
  });

  it('sends an existing phone number back to the first step', async () => {
    await renderApp('/register');
    await fillIdentity('+237 600 00 00 01');
    await press('register-submit');
    expect(await screen.findByText(fr.validation.PHONE_TAKEN)).toBeOnTheScreen();
    expect(screen.getByTestId('register-identity')).toBeOnTheScreen();
    await press('register-go-login');
    expect(await screen.findByTestId('login')).toBeOnTheScreen();
  });
});

describe('password reset (F1.2)', () => {
  async function requestCode() {
    await renderApp('/login');
    await type('login-phone', '6 00 00 00 01');
    await press('login-forgot-password');
    await press('reset-send-code');
    const title = await screen.findByText(/^Code de démonstration/);
    return String(title.props.children).match(/\d{6}/)![0];
  }

  it('sets a new password with the demo code, then signs in', async () => {
    const code = await requestCode();
    await type('reset-code', code);
    await type('reset-new-password', NEW_PASSWORD);
    await type('reset-confirm-password', NEW_PASSWORD);
    await press('reset-submit');
    expect(await screen.findByTestId('coming-soon-map')).toBeOnTheScreen();

    const { repositories } = createAppData();
    await expect(repositories.auth.login('+237600000001', NEW_PASSWORD)).resolves.toBeTruthy();
  });

  it('rejects a wrong code', async () => {
    const code = await requestCode();
    await type('reset-code', code === '000000' ? '111111' : '000000');
    await type('reset-new-password', NEW_PASSWORD);
    await type('reset-confirm-password', NEW_PASSWORD);
    await press('reset-submit');
    expect(await screen.findByText(fr.errors.INVALID_RESET_CODE)).toBeOnTheScreen();
  });
});

describe('profile management (F1.4, F1.5)', () => {
  it('edits the name; the phone number stays read-only', async () => {
    await startSignedIn('+237600000001', '/profile');
    await press('profile-edit');
    expect(screen.getByTestId('edit-phone')).toHaveProp('editable', false);
    await type('edit-first-name', 'Nadia');
    await press('edit-profile-save');
    expect(await screen.findByTestId('edit-profile-saved')).toBeOnTheScreen();
    await testRouter.navigate('/profile');
    expect(await screen.findByText('Nadia Atangana')).toBeOnTheScreen();
  });

  it('adds, refuses a duplicate and removes safety contacts', async () => {
    await startSignedIn('+237600000001', '/profile');
    await press('profile-safety-contacts');
    await screen.findByTestId('safety-contacts');
    expect(
      screen.getByText(format(fr.safetyContacts.count, { count: 2, max: 5 })),
    ).toBeOnTheScreen();

    await press('safety-contact-add');
    await type('safety-contact-name', 'Awa Bello');
    await type('safety-contact-phone', '6 00 00 09 01');
    await press('safety-contact-save');
    expect(await screen.findByText(fr.validation.SAFETY_CONTACT_DUPLICATE)).toBeOnTheScreen();
    await type('safety-contact-phone', '6 00 00 09 10');
    await press('safety-contact-save');
    expect(await screen.findByText('Awa Bello')).toBeOnTheScreen();
    expect(
      screen.getByText(format(fr.safetyContacts.count, { count: 3, max: 5 })),
    ).toBeOnTheScreen();

    await press('safety-contact-delete-contact-1');
    await press('safety-contact-confirm-delete-contact-1');
    await waitFor(() => expect(screen.queryByTestId('safety-contact-contact-1')).toBeNull());
  });

  it('saves the notification preferences', async () => {
    await startSignedIn('+237600000001', '/profile/preferences');
    await screen.findByTestId('preferences');
    await fireEvent(screen.getByTestId('preferences-quiz-reminders'), 'valueChange', false);
    await press('preferences-radius-5');
    await press('preferences-save');
    expect(await screen.findByTestId('preferences-saved')).toBeOnTheScreen();
    await testRouter.navigate('/profile');
    expect(await screen.findByText(fr.profile.remindersDisabled)).toBeOnTheScreen();
    expect(
      screen.getByText(
        `${fr.profile.alertsEnabled} · ${format(fr.profile.nearbyRadius, { km: 5 })}`,
      ),
    ).toBeOnTheScreen();
  });

  it('lets a citizen request the authority profile, then add a document', async () => {
    await startSignedIn('+237600000001', '/profile');
    await press('profile-request-link');
    await press('profile-role-AUTHORITY');
    await type('profile-organization', 'Mairie de Douala');
    await type('profile-position', 'Agent de circulation');
    await press('profile-request-submit');

    expect(await screen.findByTestId('documents')).toBeOnTheScreen();
    expect(screen).toHavePathname('/profile/documents');
    await press('document-FUNCTION_PROOF-picker-library');
    expect(await screen.findByText(/^Ajouté le/)).toBeOnTheScreen();

    await testRouter.navigate('/profile');
    expect(await screen.findByTestId('pending-banner')).toBeOnTheScreen();
    expect(
      screen.getByText(
        format(fr.profile.documentsMissing, { list: fr.enums.documentType.ID_CARD }),
      ),
    ).toBeOnTheScreen();
  });

  it('offers a new request after a rejection', async () => {
    await startSignedIn('+237600000106', '/profile');
    expect(await screen.findByTestId('rejected-banner')).toBeOnTheScreen();
    await press('profile-request-again');
    expect(await screen.findByTestId('profile-request-submit')).toBeOnTheScreen();
  });

  it('closes the documents of a reviewed request', async () => {
    await startSignedIn('+237600000002', '/profile/documents');
    expect(await screen.findByTestId('documents-closed')).toBeOnTheScreen();
    expect(screen.queryByTestId('document-ID_CARD-picker-library')).toBeNull();
  });

  it('gives a suspended account no profile request', async () => {
    await startSignedIn('+237600000105', '/profile');
    expect(await screen.findByTestId('suspended-banner')).toBeOnTheScreen();
    expect(screen.queryByTestId('profile-request-card')).toBeNull();
    await testRouter.navigate('/profile/request');
    expect(await screen.findByTestId('profile-request-unavailable')).toBeOnTheScreen();
  });
});
