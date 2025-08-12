import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  /* Global setup and teardown */
  globalSetup: require.resolve('./tests/e2e/global-setup'),
  globalTeardown: require.resolve('./tests/e2e/global-teardown'),

  /* Test timeout */
  timeout: 30000,
  expect: {
    timeout: 10000,
  },

  /* Output directory for test artifacts */
  outputDir: 'test-results/',

  /* Test matching patterns */
  testMatch: '**/*.spec.ts',

  /* Ignore patterns */
  testIgnore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/.next/**',
    '**/coverage/**',
  ],

  /* Environment variables */
  env: {
    NODE_ENV: 'test',
  },

  /* Custom test fixtures */
  use: {
    /* Custom action to wait for page load */
    actionTimeout: 10000,
    navigationTimeout: 30000,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: {
      'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
    },
  },

  /* Custom reporter configuration */
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['allure-playwright', { outputFolder: 'test-results/allure-results' }],
  ],

  /* Custom test annotations */
  annotations: {
    type: 'annotation',
    description: 'Custom test annotation',
  },

  /* Custom test metadata */
  metadata: {
    browser: {
      name: 'chromium',
      version: 'latest',
    },
    device: {
      name: 'desktop',
      viewport: { width: 1280, height: 720 },
    },
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris',
  },

  /* Custom test hooks */
  hooks: {
    beforeAll: async () => {
      console.log('Starting E2E tests...');
    },
    afterAll: async () => {
      console.log('E2E tests completed.');
    },
  },

  /* Custom test utilities */
  use: {
    /* Custom action to fill form */
    fillForm: async (page, formData) => {
      for (const [selector, value] of Object.entries(formData)) {
        await page.fill(selector, value);
      }
    },

    /* Custom action to wait for API response */
    waitForAPI: async (page, url, method = 'GET') => {
      await page.waitForResponse(
        response => response.url().includes(url) && response.request().method() === method
      );
    },

    /* Custom action to check accessibility */
    checkA11y: async (page) => {
      // Add accessibility checks here
      await page.evaluate(() => {
        // Basic accessibility checks
        const images = document.querySelectorAll('img');
        images.forEach(img => {
          if (!img.alt) {
            throw new Error(`Image without alt text: ${img.src}`);
          }
        });
      });
    },
  },
});
