const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/*.spec.{js,jsx,ts,tsx}',
    '!src/**/index.{js,jsx,ts,tsx}',
    '!src/**/types.{js,jsx,ts,tsx}',
    '!src/**/constants.{js,jsx,ts,tsx}',
    '!src/**/utils.{js,jsx,ts,tsx}',
    '!src/**/helpers.{js,jsx,ts,tsx}',
    '!src/**/mocks.{js,jsx,ts,tsx}',
    '!src/**/fixtures.{js,jsx,ts,tsx}',
    '!src/**/stories.{js,jsx,ts,tsx}',
    '!src/**/test.{js,jsx,ts,tsx}',
    '!src/**/spec.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/**/__fixtures__/**',
    '!src/**/__stories__/**',
    '!src/**/__test__/**',
    '!src/**/__spec__/**',
    '!src/**/coverage/**',
    '!src/**/dist/**',
    '!src/**/build/**',
    '!src/**/.next/**',
    '!src/**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/styles/(.*)$': '<rootDir>/src/styles/$1',
    '^@/public/(.*)$': '<rootDir>/public/$1',
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
    },
  },
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
  testTimeout: 10000,
  maxWorkers: '50%',
  bail: false,
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  collectCoverage: false,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  errorOnDeprecated: true,
  forceExit: true,
  injectGlobals: true,
  notify: false,
  notifyMode: 'failure-change',
  onlyChanged: false,
  onlyFailures: false,
  passWithNoTests: true,

  reporters: [
    'default'
  ],

  roots: ['<rootDir>/src'],
  runTestsByPath: false,
  runner: 'jest-runner',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  skipFilter: false,
  slowTestThreshold: 5,
  snapshotSerializers: [],
  testLocationInResults: false,
  testNamePattern: '',
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/dist/',
    '/build/',
    '/coverage/',
  ],
  testRunner: 'jest-circus/runner',
  testSequencer: '@jest/test-sequencer',

  fakeTimers: {
    enableGlobally: false,
  },
  transformIgnorePatterns: [
    'node_modules/(?!(next|@next|react|@react|@testing-library|jest-axe)/)',
  ],

  updateSnapshot: false,
  useStderr: false,
  watch: false,
  watchAll: false,
  watchman: true,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
