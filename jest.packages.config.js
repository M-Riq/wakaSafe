/**
 * Shared Jest configuration for the platform-agnostic packages (packages/*).
 * TypeScript is stripped by Babel 7 (already used by Expo), without type-checking:
 * type-checking is done separately by `npm run typecheck`.
 * The React Native app (apps/mobile) uses the `jest-expo` preset instead.
 */
/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': [
      'babel-jest',
      {
        babelrc: false,
        configFile: false,
        presets: ['@babel/preset-typescript'],
        plugins: ['@babel/plugin-transform-modules-commonjs'],
      },
    ],
  },
};
