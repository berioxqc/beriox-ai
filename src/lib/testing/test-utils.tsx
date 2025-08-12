import React, { ReactElement } from 'apos;react'apos;;
import { render, RenderOptions } from 'apos;@testing-library/react'apos;;
import { SessionProvider } from 'apos;next-auth/react'apos;;
import { QueryClient, QueryClientProvider } from 'apos;@tanstack/react-query'apos;;

// Mock Next.js router
jest.mock('apos;next/router'apos;, () => ({
  useRouter() {
    return {
      route: 'apos;/'apos;,
      pathname: 'apos;/'apos;,
      query: {},
      asPath: 'apos;/'apos;,
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
jest.mock('apos;next/navigation'apos;, () => ({
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
    return 'apos;/'apos;;
  },
}));

// Mock Prisma
jest.mock('apos;@/lib/prisma'apos;, () => ({
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
jest.mock('apos;stripe'apos;, () => {
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
jest.mock('apos;openai'apos;, () => ({
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
jest.mock('apos;@sentry/nextjs'apos;, () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setUser: jest.fn(),
  setTag: jest.fn(),
  setContext: jest.fn(),
}));

// Mock Resend
jest.mock('apos;resend'apos;, () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn(),
    },
  })),
}));

// Mock Redis
jest.mock('apos;ioredis'apos;, () => {
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
Object.defineProperty(window, 'apos;matchMedia'apos;, {
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
interface CustomRenderOptions extends Omit<RenderOptions, 'apos;wrapper'apos;> {
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
  id: 'apos;user-1'apos;,
  email: 'apos;test@example.com'apos;,
  name: 'apos;Test User'apos;,
  image: 'apos;https://example.com/avatar.jpg'apos;,
  role: 'apos;USER'apos;,
  emailVerified: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockMission = (overrides = {}) => ({
  id: 'apos;mission-1'apos;,
  title: 'apos;Test Mission'apos;,
  description: 'apos;Test mission description'apos;,
  status: 'apos;PENDING'apos;,
  agentId: 'apos;karine-ai'apos;,
  userId: 'apos;user-1'apos;,
  createdAt: new Date(),
  updatedAt: new Date(),
  completedAt: null,
  satisfaction: null,
  ...overrides,
});

export const createMockDeliverable = (overrides = {}) => ({
  id: 'apos;deliverable-1'apos;,
  missionId: 'apos;mission-1'apos;,
  content: 'apos;Test deliverable content'apos;,
  type: 'apos;TEXT'apos;,
  quality: 0.8,
  structure: 'apos;good'apos;,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockBrief = (overrides = {}) => ({
  id: 'apos;brief-1'apos;,
  missionId: 'apos;mission-1'apos;,
  content: 'apos;Test brief content'apos;,
  type: 'apos;REQUIREMENT'apos;,
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
  const { fireEvent } = await import('apos;@testing-library/react'apos;);
  
  for (const [name, value] of Object.entries(formData)) {
    const input = document.querySelector(`[name="${name}"]`) as HTMLInputElement;
    if (input) {
      fireEvent.change(input, { target: { value } });
    }
  }
};

export const submitForm = async (formSelector = 'apos;form'apos;) => {
  const { fireEvent } = await import('apos;@testing-library/react'apos;);
  const form = document.querySelector(formSelector) as HTMLFormElement;
  if (form) {
    fireEvent.submit(form);
  }
};

// Accessibility testing helpers
export const checkA11y = async (container: HTMLElement) => {
  const { axe, toHaveNoViolations } = await import('apos;jest-axe'apos;);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};

// Snapshot testing helpers
export const createSnapshot = (component: ReactElement) => {
  const { render } = require('apos;@testing-library/react'apos;);
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
  const { prisma } = require('apos;@/lib/prisma'apos;);
  prisma[model][method].mockResolvedValue(returnValue);
};

export const mockPrismaError = (model: string, method: string, error: Error) => {
  const { prisma } = require('apos;@/lib/prisma'apos;);
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
export * from 'apos;@testing-library/react'apos;;
export { default as userEvent } from 'apos;@testing-library/user-event'apos;;
