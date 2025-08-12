import { NextRequest } from 'next/server';
import { GET, POST } from '../missions/route';
import { createMockUser, createMockMission, mockPrismaQuery, mockPrismaError } from '@/lib/testing/test-utils';

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    mission: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

describe('/api/missions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns missions for authenticated user', async () => {
      const mockUser = createMockUser();
      const mockMissions = [
        createMockMission({ id: 'mission-1', title: 'Mission 1' }),
        createMockMission({ id: 'mission-2', title: 'Mission 2' }),
      ];

      // Mock NextAuth session
      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValue({
        user: { id: mockUser.id, email: mockUser.email },
      });

      // Mock Prisma queries
      mockPrismaQuery('user', 'findUnique', mockUser);
      mockPrismaQuery('mission', 'findMany', mockMissions);

      const request = new NextRequest('http://localhost:3000/api/missions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.missions).toHaveLength(2);
      expect(data.missions[0].title).toBe('Mission 1');
      expect(data.missions[1].title).toBe('Mission 2');
    });

    it('returns 401 for unauthenticated user', async () => {
      // Mock NextAuth session as null
      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/missions');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('handles database errors gracefully', async () => {
      const mockUser = createMockUser();

      // Mock NextAuth session
      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValue({
        user: { id: mockUser.id, email: mockUser.email },
      });

      // Mock Prisma error
      mockPrismaError('mission', 'findMany', new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/missions');
      const response = await GET(request);

      expect(response.status).toBe(500);
    });

    it('filters missions by status', async () => {
      const mockUser = createMockUser();
      const mockMissions = [
        createMockMission({ id: 'mission-1', status: 'COMPLETED' }),
      ];

      // Mock NextAuth session
      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValue({
        user: { id: mockUser.id, email: mockUser.email },
      });

      // Mock Prisma queries
      mockPrismaQuery('user', 'findUnique', mockUser);
      mockPrismaQuery('mission', 'findMany', mockMissions);

      const request = new NextRequest('http://localhost:3000/api/missions?status=COMPLETED');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.missions).toHaveLength(1);
      expect(data.missions[0].status).toBe('COMPLETED');
    });

    it('paginates results correctly', async () => {
      const mockUser = createMockUser();
      const mockMissions = Array.from({ length: 10 }, (_, i) =>
        createMockMission({ id: `mission-${i}`, title: `Mission ${i}` })
      );

      // Mock NextAuth session
      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValue({
        user: { id: mockUser.id, email: mockUser.email },
      });

      // Mock Prisma queries
      mockPrismaQuery('user', 'findUnique', mockUser);
      mockPrismaQuery('mission', 'findMany', mockMissions.slice(0, 5));

      const request = new NextRequest('http://localhost:3000/api/missions?page=1&limit=5');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.missions).toHaveLength(5);
    });
  });

  describe('POST', () => {
    it('creates a new mission successfully', async () => {
      const mockUser = createMockUser();
      const newMission = createMockMission({
        id: 'new-mission',
        title: 'New Mission',
        description: 'Mission description',
      });

      // Mock NextAuth session
      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValue({
        user: { id: mockUser.id, email: mockUser.email },
      });

      // Mock Prisma queries
      mockPrismaQuery('user', 'findUnique', mockUser);
      mockPrismaQuery('mission', 'create', newMission);

      const requestBody = {
        title: 'New Mission',
        description: 'Mission description',
        agentId: 'karine-ai',
        type: 'content',
        complexity: 'medium',
        urgency: 'high',
      };

      const request = new NextRequest('http://localhost:3000/api/missions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.mission.title).toBe('New Mission');
      expect(data.mission.description).toBe('Mission description');
    });

    it('validates required fields', async () => {
      const mockUser = createMockUser();

      // Mock NextAuth session
      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValue({
        user: { id: mockUser.id, email: mockUser.email },
      });

      // Mock Prisma queries
      mockPrismaQuery('user', 'findUnique', mockUser);

      const requestBody = {
        // Missing required fields
        description: 'Mission description',
      };

      const request = new NextRequest('http://localhost:3000/api/missions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('title');
    });

    it('validates agent ID', async () => {
      const mockUser = createMockUser();

      // Mock NextAuth session
      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValue({
        user: { id: mockUser.id, email: mockUser.email },
      });

      // Mock Prisma queries
      mockPrismaQuery('user', 'findUnique', mockUser);

      const requestBody = {
        title: 'New Mission',
        description: 'Mission description',
        agentId: 'invalid-agent',
      };

      const request = new NextRequest('http://localhost:3000/api/missions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('agentId');
    });

    it('handles database creation errors', async () => {
      const mockUser = createMockUser();

      // Mock NextAuth session
      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValue({
        user: { id: mockUser.id, email: mockUser.email },
      });

      // Mock Prisma queries
      mockPrismaQuery('user', 'findUnique', mockUser);
      mockPrismaError('mission', 'create', new Error('Creation failed'));

      const requestBody = {
        title: 'New Mission',
        description: 'Mission description',
        agentId: 'karine-ai',
      };

      const request = new NextRequest('http://localhost:3000/api/missions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
    });

    it('validates mission type', async () => {
      const mockUser = createMockUser();

      // Mock NextAuth session
      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValue({
        user: { id: mockUser.id, email: mockUser.email },
      });

      // Mock Prisma queries
      mockPrismaQuery('user', 'findUnique', mockUser);

      const requestBody = {
        title: 'New Mission',
        description: 'Mission description',
        agentId: 'karine-ai',
        type: 'invalid-type',
      };

      const request = new NextRequest('http://localhost:3000/api/missions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('type');
    });

    it('validates complexity level', async () => {
      const mockUser = createMockUser();

      // Mock NextAuth session
      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValue({
        user: { id: mockUser.id, email: mockUser.email },
      });

      // Mock Prisma queries
      mockPrismaQuery('user', 'findUnique', mockUser);

      const requestBody = {
        title: 'New Mission',
        description: 'Mission description',
        agentId: 'karine-ai',
        complexity: 'invalid-complexity',
      };

      const request = new NextRequest('http://localhost:3000/api/missions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('complexity');
    });

    it('validates urgency level', async () => {
      const mockUser = createMockUser();

      // Mock NextAuth session
      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValue({
        user: { id: mockUser.id, email: mockUser.email },
      });

      // Mock Prisma queries
      mockPrismaQuery('user', 'findUnique', mockUser);

      const requestBody = {
        title: 'New Mission',
        description: 'Mission description',
        agentId: 'karine-ai',
        urgency: 'invalid-urgency',
      };

      const request = new NextRequest('http://localhost:3000/api/missions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('urgency');
    });
  });
});
