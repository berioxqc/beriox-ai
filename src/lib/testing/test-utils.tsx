import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    mission: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    deliverable: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    brief: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn(),
        retrieve: jest.fn(),
      },
    },
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
    },
    subscriptions: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
    },
  }));
});

// Mock OpenAI
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
    images: {
      generate: jest.fn(),
    },
  })),
}));

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setUser: jest.fn(),
  setTag: jest.fn(),
  setContext: jest.fn(),
}));

// Mock Resend
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn(),
    },
  })),
}));

// Mock Redis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    expire: jest.fn(),
    exists: jest.fn(),
    incr: jest.fn(),
    decr: jest.fn(),
    hget: jest.fn(),
    hset: jest.fn(),
    hdel: jest.fn(),
    hgetall: jest.fn(),
    lpush: jest.fn(),
    rpop: jest.fn(),
    llen: jest.fn(),
    zadd: jest.fn(),
    zrange: jest.fn(),
    zrem: jest.fn(),
    zcard: jest.fn(),
    disconnect: jest.fn(),
  }));
});

// Mock fetch
global.fetch = jest.fn();

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  session?: any;
  queryClient?: QueryClient;
}

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

export function renderWithProviders(
  ui: ReactElement,
  {
    session = null,
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <SessionProvider session={session}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </SessionProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  image: 'https://example.com/avatar.jpg',
  role: 'USER',
  emailVerified: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockMission = (overrides = {}) => ({
  id: 'mission-1',
  title: 'Test Mission',
  description: 'Test mission description',
  status: 'PENDING',
  agentId: 'karine-ai',
  userId: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  completedAt: null,
  satisfaction: null,
  ...overrides,
});

export const createMockDeliverable = (overrides = {}) => ({
  id: 'deliverable-1',
  missionId: 'mission-1',
  content: 'Test deliverable content',
  type: 'TEXT',
  quality: 0.8,
  structure: 'good',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockBrief = (overrides = {}) => ({
  id: 'brief-1',
  missionId: 'mission-1',
  content: 'Test brief content',
  type: 'REQUIREMENT',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Custom matchers
export const customMatchers = {
  toHaveBeenCalledWithMatch: (mock: jest.Mock, expected: any) => {
    const calls = mock.mock.calls;
    const hasMatch = calls.some(call => {
      try {
        expect(call).toEqual(expect.arrayContaining([expected]));
        return true;
      } catch {
        return false;
      }
    });
    
    if (!hasMatch) {
      throw new Error(
        `Expected mock to have been called with ${JSON.stringify(expected)}, but it was called with ${JSON.stringify(calls)}`
      );
    }
  },
};

// Test helpers
export const waitForLoadingToFinish = () =>
  new Promise(resolve => setTimeout(resolve, 0));

export const mockApiResponse = (data: any, status = 200) => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  });
};

export const mockApiError = (error: string, status = 500) => {
  (global.fetch as jest.Mock).mockRejectedValueOnce(new Error(error));
};

// Form testing helpers
export const fillForm = async (formData: Record<string, string>) => {
  const { fireEvent } = await import('@testing-library/react');
  
  for (const [name, value] of Object.entries(formData)) {
    const input = document.querySelector(`[name="${name}"]`) as HTMLInputElement;
    if (input) {
      fireEvent.change(input, { target: { value } });
    }
  }
};

export const submitForm = async (formSelector = 'form') => {
  const { fireEvent } = await import('@testing-library/react');
  const form = document.querySelector(formSelector) as HTMLFormElement;
  if (form) {
    fireEvent.submit(form);
  }
};

// Accessibility testing helpers
export const checkA11y = async (container: HTMLElement) => {
  const { axe, toHaveNoViolations } = await import('jest-axe');
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};

// Snapshot testing helpers
export const createSnapshot = (component: ReactElement) => {
  const { render } = require('@testing-library/react');
  const { container } = render(component);
  expect(container.firstChild).toMatchSnapshot();
};

// Mock environment variables
export const mockEnvVars = (vars: Record<string, string>) => {
  const originalEnv = process.env;
  process.env = { ...originalEnv, ...vars };
  
  return () => {
    process.env = originalEnv;
  };
};

// Test database helpers
export const mockPrismaQuery = (model: string, method: string, returnValue: any) => {
  const { prisma } = require('@/lib/prisma');
  prisma[model][method].mockResolvedValue(returnValue);
};

export const mockPrismaError = (model: string, method: string, error: Error) => {
  const { prisma } = require('@/lib/prisma');
  prisma[model][method].mockRejectedValue(error);
};

// Cleanup helpers
export const cleanupMocks = () => {
  jest.clearAllMocks();
  jest.clearAllTimers();
};

export const resetMocks = () => {
  jest.resetAllMocks();
  jest.resetModules();
};

// Export everything
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
