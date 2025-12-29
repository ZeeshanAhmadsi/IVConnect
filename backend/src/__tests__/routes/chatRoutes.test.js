import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

// Mock the controller
const mockGetStreamToken = jest.fn();
jest.unstable_mockModule('../../controllers/chatControllers.js', () => ({
  getStreamToken: mockGetStreamToken
}));

// Mock the middleware
const mockProtectRoute = [
  jest.fn((req, res, next) => next()),
  jest.fn((req, res, next) => next())
];
jest.unstable_mockModule('../../middlewares/protectRoute.js', () => ({
  protectRoute: mockProtectRoute
}));

const chatRoutes = await import('../../routes/chatRoutes.js');

describe('chatRoutes', () => {
  let app;

  beforeEach(() => {
    // Create a fresh Express app for each test
    app = express();
    app.use(express.json());
    app.use('/api/chat', chatRoutes.default);
    jest.clearAllMocks();
  });

  describe('Route Configuration', () => {
    it('should export a valid Express router', () => {
      expect(chatRoutes.default).toBeDefined();
      expect(typeof chatRoutes.default).toBe('function');
    });

    it('should have GET /token route defined', async () => {
      // Arrange
      mockGetStreamToken.mockImplementation((req, res) => {
        res.status(200).json({ success: true });
      });

      // Act
      const response = await request(app).get('/api/chat/token');

      // Assert - Should not be 404
      expect(response.status).not.toBe(404);
    });
  });

  describe('GET /token - Happy Path', () => {
    it('should call protectRoute middleware before controller', async () => {
      // Arrange
      mockGetStreamToken.mockImplementation((req, res) => {
        res.status(200).json({ token: 'test-token' });
      });

      // Act
      await request(app).get('/api/chat/token');

      // Assert
      expect(mockProtectRoute[0]).toHaveBeenCalled();
      expect(mockGetStreamToken).toHaveBeenCalled();
    });

    it('should return 200 with token on successful request', async () => {
      // Arrange
      const mockResponse = {
        token: 'mock-stream-token',
        userId: 'user-123',
        userName: 'Test User',
        userImage: 'https://example.com/avatar.jpg'
      };
      mockGetStreamToken.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      // Act
      const response = await request(app).get('/api/chat/token');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
    });
  });

  describe('GET /token - Protected Route', () => {
    it('should not call controller if protectRoute fails', async () => {
      // Arrange - Reset middleware to fail
      mockProtectRoute[0] = jest.fn((req, res) => {
        res.status(401).json({ msg: 'Unauthorized' });
      });
      
      // Recreate app with new middleware
      app = express();
      app.use(express.json());
      app.use('/api/chat', chatRoutes.default);

      // Act
      const response = await request(app).get('/api/chat/token');

      // Assert
      expect(response.status).toBe(401);
      expect(mockGetStreamToken).not.toHaveBeenCalled();
    });
  });

  describe('GET /token - Error Handling', () => {
    it('should return 500 when controller throws error', async () => {
      // Arrange
      mockGetStreamToken.mockImplementation((req, res) => {
        res.status(500).json({ msg: 'Internal server error' });
      });

      // Act
      const response = await request(app).get('/api/chat/token');

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('msg');
    });
  });

  describe('HTTP Methods', () => {
    it('should only accept GET requests on /token', async () => {
      // Arrange
      mockGetStreamToken.mockImplementation((req, res) => {
        res.status(200).json({ success: true });
      });

      // Act & Assert
      const getResponse = await request(app).get('/api/chat/token');
      expect(getResponse.status).not.toBe(404);

      const postResponse = await request(app).post('/api/chat/token');
      expect(postResponse.status).toBe(404);

      const putResponse = await request(app).put('/api/chat/token');
      expect(putResponse.status).toBe(404);

      const deleteResponse = await request(app).delete('/api/chat/token');
      expect(deleteResponse.status).toBe(404);
    });
  });

  describe('Route Path Validation', () => {
    it('should respond to exact path /token', async () => {
      // Arrange
      mockGetStreamToken.mockImplementation((req, res) => {
        res.status(200).json({ success: true });
      });

      // Act
      const response = await request(app).get('/api/chat/token');

      // Assert
      expect(response.status).toBe(200);
    });

    it('should return 404 for /tokens (plural)', async () => {
      // Act
      const response = await request(app).get('/api/chat/tokens');

      // Assert
      expect(response.status).toBe(404);
    });

    it('should be case-sensitive', async () => {
      // Act
      const response = await request(app).get('/api/chat/TOKEN');

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe('Middleware Execution Order', () => {
    it('should execute middlewares in correct order', async () => {
      // Arrange
      const executionOrder = [];
      
      mockProtectRoute[0] = jest.fn((req, res, next) => {
        executionOrder.push('requireAuth');
        next();
      });
      
      mockProtectRoute[1] = jest.fn((req, res, next) => {
        executionOrder.push('authMiddleware');
        next();
      });
      
      mockGetStreamToken.mockImplementation((req, res) => {
        executionOrder.push('controller');
        res.status(200).json({ success: true });
      });

      // Act
      await request(app).get('/api/chat/token');

      // Assert
      expect(executionOrder).toEqual(['requireAuth', 'authMiddleware', 'controller']);
    });
  });

  describe('Concurrency', () => {
    it('should handle multiple simultaneous requests', async () => {
      // Arrange
      mockGetStreamToken.mockImplementation((req, res) => {
        res.status(200).json({ success: true });
      });

      // Act
      const requests = Array.from({ length: 5 }, () =>
        request(app).get('/api/chat/token')
      );
      const responses = await Promise.all(requests);

      // Assert
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
      expect(mockGetStreamToken).toHaveBeenCalledTimes(5);
    });
  });
});