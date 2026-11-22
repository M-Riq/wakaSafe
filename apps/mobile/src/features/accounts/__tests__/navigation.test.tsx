import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, renderRouter, screen, testRouter } from 'expo-router/testing-library';

import { createAppData } from '@/data/app-data';

import { useSessionStore } from '../session-store';

// Real route tree; renderRouter resolves it from the Jest working directory (apps/mobile).
const APP_DIR = './app';

async function renderApp(initialUrl = '/') {
  await renderRouter(APP_DIR, { initialUrl });
}

async function signInAs(userId: string) {
  await renderApp('/demo-access');
  await fireEvent.press(await screen.findByTestId(`demo-sign-in-${userId}`));
  await screen.findByTestId('coming-soon-map');
}

async function openProfile() {
  await testRouter.navigate('/profile');
  return screen.findByTestId('profile');
}

beforeEach(async () => {
  await AsyncStorage.clear();
  useSessionStore.setState({ status: 'loading', auth: null });
});

describe('client navigation and role guards', () => {
  it('sends visitors to the welcome screen', async () => {
    await renderApp();
    expect(await screen.findByTestId('welcome')).toBeOnTheScreen();
    expect(screen).toHavePathname('/welcome');
  });

  it('keeps visitors out of the signed-in area', async () => {
    await renderApp('/profile');
    expect(await screen.findByTestId('welcome')).toBeOnTheScreen();
  });

  it('signs a citizen in from the demo access screen', async () => {
    await signInAs('user-citizen');
    expect(screen).toHavePathname('/map');
    await openProfile();
    expect(screen.queryByTestId('driver-area-link')).toBeNull();
  });

  it('restores a persisted session on start', async () => {
    const { repositories, demo } = createAppData();
    await repositories.auth.login('+237600000001', demo!.password);
    await renderApp();
    expect(await screen.findByTestId('coming-soon-map')).toBeOnTheScreen();
  });

  it('never restores an administrator session in the client app', async () => {
    const { repositories, demo } = createAppData();
    await repositories.auth.login('+237600000000', demo!.password);
    await renderApp();
    expect(await screen.findByTestId('welcome')).toBeOnTheScreen();
    expect(await repositories.auth.getSession()).toBeNull();
  });

  it('gives a pending driver citizen rights only (F1.3)', async () => {
    await signInAs('user-driver-pending');
    await openProfile();
    expect(await screen.findByTestId('pending-banner')).toBeOnTheScreen();
    expect(screen.queryByTestId('driver-area-link')).toBeNull();
  });

  it('blocks a deep link to the driver area without the driver role', async () => {
    const { repositories, demo } = createAppData();
    await repositories.auth.login('+237600000003', demo!.password);
    await renderApp('/driver');
    expect(await screen.findByTestId('coming-soon-map')).toBeOnTheScreen();
    expect(screen.queryByTestId('driver-area')).toBeNull();
  });

  it('opens the driver area for a validated driver', async () => {
    await signInAs('user-driver');
    await openProfile();
    await fireEvent.press(await screen.findByTestId('driver-area-link'));
    expect(await screen.findByTestId('driver-area')).toBeOnTheScreen();
    expect(screen).toHavePathname('/driver');
  });

  it('keeps the tabs under a deep-linked driver area so back works', async () => {
    const { repositories, demo } = createAppData();
    await repositories.auth.login('+237600000002', demo!.password);
    await renderApp('/driver');
    expect(await screen.findByTestId('driver-area')).toBeOnTheScreen();
    await testRouter.back('/map');
    expect(await screen.findByTestId('coming-soon-map')).toBeOnTheScreen();
  });

  it('offers a home button on the progress page opened by URL only', async () => {
    await renderApp('/project-progress');
    await fireEvent.press(await screen.findByTestId('header-home'));
    expect(await screen.findByTestId('welcome')).toBeOnTheScreen();

    await fireEvent.press(screen.getByTestId('welcome-project-progress'));
    expect(await screen.findByTestId('project-progress')).toBeOnTheScreen();
    expect(screen.queryByTestId('header-home')).toBeNull();
  });

  it('shows the read-only banner to a suspended account', async () => {
    await signInAs('user-105');
    await openProfile();
    expect(await screen.findByTestId('suspended-banner')).toBeOnTheScreen();
  });

  it('signs out back to the welcome screen', async () => {
    await signInAs('user-citizen');
    await openProfile();
    await fireEvent.press(screen.getByTestId('sign-out'));
    expect(await screen.findByTestId('welcome')).toBeOnTheScreen();
  });
});
