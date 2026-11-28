import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GeoPoint } from '@wakasafe/domain';
import { fireEvent, renderRouter, screen, testRouter } from 'expo-router/testing-library';

import { createAppData } from '@/data/app-data';
import { useSessionStore } from '@/features/accounts';
import { format, fr } from '@/lib/i18n';
import { locateDevice } from '@/services/location';

jest.mock('@/services/location', () => ({ locateDevice: jest.fn() }));
jest.mock('@/services/media', () => ({
  canUseCamera: true,
  pickImage: jest.fn(async () => ({ status: 'picked', dataUri: 'data:image/jpeg;base64,AAAA' })),
}));

const APP_DIR = './app';
const CITIZEN_PHONE = '+237600000001';
const SUSPENDED_PHONE = '+237600000105';
/** Akwa, Douala. */
const DOUALA_POINT: GeoPoint = { latitude: 4.0511, longitude: 9.7679, accuracyMeters: 12 };
/** Public seed reports: CREATED, VALIDATED or HANDLED (7 in Yaoundé, 7 in Douala, 5 in Bafoussam). */
const PUBLIC_REPORT_COUNT = 19;

async function startSignedIn(phone: string, initialUrl: string) {
  const { repositories, demo } = createAppData();
  await repositories.auth.login(phone, demo!.password);
  await renderRouter(APP_DIR, { initialUrl });
}

async function press(testID: string) {
  await fireEvent.press(await screen.findByTestId(testID));
}

function results(count: number) {
  return format(count < 2 ? fr.reportMap.results.one : fr.reportMap.results.other, { count });
}

async function fillReport() {
  await press('report-category-OBSTACLE');
  await press('report-severity-HIGH');
  await press('report-affected-group-ALL_ROAD_USERS');
}

beforeEach(async () => {
  await AsyncStorage.clear();
  useSessionStore.setState({ status: 'loading', auth: null, landing: null });
  jest
    .mocked(locateDevice)
    .mockReset()
    .mockResolvedValue({ status: 'located', point: DOUALA_POINT });
});

describe('public map (F2.3)', () => {
  it('lists active reports only and filters them by zone', async () => {
    await startSignedIn(CITIZEN_PHONE, '/map');
    expect(await screen.findByText(results(PUBLIC_REPORT_COUNT))).toBeOnTheScreen();
    expect(screen.getByTestId('report-card-report-01')).toBeOnTheScreen();
    // Refuted, under moderation or closed reports stay off the public map.
    for (const hidden of ['report-07', 'report-15', 'report-18']) {
      expect(screen.queryByTestId(`report-card-${hidden}`)).toBeNull();
    }

    await press('map-filters-toggle');
    await press('filter-city-Douala');
    expect(await screen.findByText(results(7))).toBeOnTheScreen();
    expect(screen.getByTestId('report-card-report-16')).toBeOnTheScreen();
    expect(screen.queryByTestId('report-card-report-01')).toBeNull();

    await press('filter-reset');
    expect(await screen.findByText(results(PUBLIC_REPORT_COUNT))).toBeOnTheScreen();
  });

  it('opens a report from the list', async () => {
    await startSignedIn(CITIZEN_PHONE, '/map');
    await press('report-card-report-16');
    expect(await screen.findByTestId('report-detail')).toBeOnTheScreen();
    expect(screen).toHavePathname('/reports/report-16');
  });
});

describe('report form (F2.1, F2.2)', () => {
  it('sends a located report with a photo, then shows it to its author', async () => {
    await startSignedIn(CITIZEN_PHONE, '/report');
    expect(await screen.findByTestId('report-location-gps')).toBeOnTheScreen();
    expect(screen.getByText(format(fr.reportForm.zone, { city: 'Douala' }))).toBeOnTheScreen();
    // The demo citizen already sent 2 reports in the last 24 hours.
    expect(
      await screen.findByText(format(fr.reportForm.quotaLeft.other, { count: 8 })),
    ).toBeOnTheScreen();

    await fillReport();
    await press('report-photo-library');
    expect(await screen.findByTestId('report-photo-preview')).toBeOnTheScreen();
    await press('report-submit');

    expect(await screen.findByText(fr.reportForm.sentTitle)).toBeOnTheScreen();
    await press('report-sent-view');
    expect(await screen.findByTestId('report-detail')).toBeOnTheScreen();
    expect(screen.getByText(fr.enums.reportCategory.OBSTACLE)).toBeOnTheScreen();
    expect(screen.getByText(fr.enums.reportStatus.CREATED)).toBeOnTheScreen();
    expect(screen.getByTestId('report-detail-photo')).toBeOnTheScreen();
    expect(screen.getByTestId('vote-own-report')).toBeOnTheScreen();

    const { repositories } = createAppData();
    const mine = await repositories.reports.list({ authorId: 'user-citizen' });
    expect(mine[0]).toMatchObject({ category: 'OBSTACLE', city: 'Douala', location: DOUALA_POINT });

    // Back on the tab, a blank form replaces the confirmation.
    await testRouter.navigate('/report');
    expect(await screen.findByTestId('report-submit')).toBeOnTheScreen();
    expect(screen.queryByText(fr.reportForm.sentTitle)).toBeNull();
  });

  it('asks for the city when the position is refused', async () => {
    jest.mocked(locateDevice).mockResolvedValue({ status: 'denied' });
    await startSignedIn(CITIZEN_PHONE, '/report');
    expect(await screen.findByText(fr.reportForm.locationDenied)).toBeOnTheScreen();

    await fillReport();
    await press('report-submit');
    expect(await screen.findByText(fr.validation.REQUIRED)).toBeOnTheScreen();

    await press('report-city-Bafoussam');
    expect(await screen.findByTestId('report-location-city')).toBeOnTheScreen();
    await press('report-submit');
    expect(await screen.findByText(fr.reportForm.sentTitle)).toBeOnTheScreen();

    const { repositories } = createAppData();
    const [latest] = await repositories.reports.list({ authorId: 'user-citizen' });
    expect(latest).toMatchObject({ city: 'Bafoussam', location: { accuracyMeters: null } });
  });

  it('retries the location on request', async () => {
    jest.mocked(locateDevice).mockResolvedValueOnce({ status: 'unavailable' });
    await startSignedIn(CITIZEN_PHONE, '/report');
    expect(await screen.findByText(fr.reportForm.locationUnavailable)).toBeOnTheScreen();
    await press('report-location-retry');
    expect(await screen.findByTestId('report-location-gps')).toBeOnTheScreen();
    expect(locateDevice).toHaveBeenCalledTimes(2);
  });

  it('lists the author’s reports, whatever their status', async () => {
    await startSignedIn(CITIZEN_PHONE, '/reports/mine');
    expect(await screen.findByTestId('my-reports')).toBeOnTheScreen();
    for (const id of ['report-01', 'report-04', 'report-08']) {
      expect(screen.getByTestId(`report-card-${id}`)).toBeOnTheScreen();
    }
    expect(screen.queryByTestId('report-card-report-16')).toBeNull();
  });
});

describe('community votes (F2.4)', () => {
  it('validates a report with the third confirmation', async () => {
    await startSignedIn(CITIZEN_PHONE, '/reports/report-16');
    expect(await screen.findByText(fr.enums.reportStatus.CREATED)).toBeOnTheScreen();
    await press('vote-confirm');

    expect(await screen.findByTestId('vote-done')).toBeOnTheScreen();
    expect(
      screen.getByText(`${fr.reportDetail.thanks} ${fr.reportDetail.nowValidated}`),
    ).toBeOnTheScreen();
    expect(await screen.findByText(fr.enums.reportStatus.VALIDATED)).toBeOnTheScreen();
    expect(
      screen.getByText(format(fr.reportDetail.confirmations.other, { count: 3 })),
    ).toBeTruthy();
  });

  it('shows the vote already given', async () => {
    await startSignedIn(CITIZEN_PHONE, '/reports/report-10');
    expect(await screen.findByTestId('vote-done')).toBeOnTheScreen();
    expect(screen.queryByTestId('vote-confirm')).toBeNull();
  });

  it('keeps a hidden report private', async () => {
    await startSignedIn(CITIZEN_PHONE, '/reports/report-15');
    expect(await screen.findByTestId('report-unavailable')).toBeOnTheScreen();
  });
});

describe('suspended account (F2.6)', () => {
  it('can read reports but neither report nor vote', async () => {
    await startSignedIn(SUSPENDED_PHONE, '/report');
    expect(await screen.findByTestId('report-read-only')).toBeOnTheScreen();
    expect(screen.queryByTestId('report-submit')).toBeNull();

    await testRouter.navigate('/reports/report-16');
    expect(await screen.findByTestId('vote-read-only')).toBeOnTheScreen();
    expect(screen.queryByTestId('vote-confirm')).toBeNull();
  });
});
