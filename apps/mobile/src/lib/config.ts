const DEFAULT_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const DEFAULT_MOCK_LATENCY_MS = 300;

function readLatency(value: string | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_MOCK_LATENCY_MS;
}

/**
 * Public configuration (EXPO_PUBLIC_* variables, see .env.example). Read on demand so
 * tests can override it; secrets must never be stored here.
 */
export function getAppConfig() {
  return {
    dataSource: process.env.EXPO_PUBLIC_DATA_SOURCE || 'mock',
    mapTileUrl: process.env.EXPO_PUBLIC_MAP_TILE_URL || DEFAULT_TILE_URL,
    mockLatencyMs: readLatency(process.env.EXPO_PUBLIC_MOCK_LATENCY_MS),
  };
}
