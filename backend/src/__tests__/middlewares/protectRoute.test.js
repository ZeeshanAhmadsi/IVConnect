import { jest } from '@jest/globals';
import { createMockRequest, createMockResponse, createMockNext, createMockUser } from '../setup/testSetup.js';

// Mock @clerk/express
const mockRequireAuth = jest.fn();
jest.unstable_mockModule('@clerk/express', () => ({
  requireAuth: mockRequireAuth
}));

// Mock User model
const mockUserFindOne = jest.fn();
jest.unstable_mockModule('../../models/User.js', () => ({
  default: {
    findOne: mockUserFindOne
  }
}));

const { protectRoute } = await import('../../middlewares/protectRoute.js');

describe('protectRoute middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    next = createMockNext();
    jest.clearAllMocks();
    
    // Default requireAuth mock implementation
    mockRequireAuth.mockReturnValue((req, res, next) => {
      next();
    });
  });

  describe('Middleware Array Structure', () => {
    it('should be an array with two middleware functions', () => {
      expect(Array.isArray(protectRoute)).toBe(true);
      expect(protectRoute).toHaveLength(2);
    });
  });

  describe('Happy Path - Successful Authentication', () => {
    it('should attach user to request and call next when user is found', async () => {
      // Arrange
      const clerkId = 'clerk-abc-123';
      req.Auth = jest.fn(() => ({ userId: clerkId }));
      const mockUser = createMockUser({ clerkId });
      mockUserFindOne.mockResolvedValue(mockUser);

      // Act
      await protectRoute[1](req, res, next);

      // Assert
      expect(mockUserFindOne).toHaveBeenCalledWith({ clerkId });
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should work with different clerkId formats', async () => {
      // Arrange
      const clerkId = 'user_2abcdefghijklmnop';
      req.Auth = jest.fn(() => ({ userId: clerkId }));
      const mockUser = createMockUser({ clerkId });
      mockUserFindOne.mockResolvedValue(mockUser);

      // Act
      await protectRoute[1](req, res, next);

      // Assert
      expect(mockUserFindOne).toHaveBeenCalledWith({ clerkId });
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it('should handle user with complete profile information', async () => {
      // Arrange
      const clerkId = 'clerk-complete-user';
      req.Auth = jest.fn(() => ({ userId: clerkId }));
      const mockUser = createMockUser({
        clerkId,
        name: 'Complete User',
        email: 'complete@example.com',
        profileImage: 'https://example.com/avatar.jpg'
      });
      mockUserFindOne.mockResolvedValue(mockUser);

      // Act
      await protectRoute[1](req, res, next);

      // Assert
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Authentication Failures', () => {
    it('should return 401 when clerkId is missing', async () => {
      // Arrange
      req.Auth = jest.fn(() => ({ userId: null }));

      // Act
      await protectRoute[1](req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Unauthorized invalid Token' });
      expect(next).not.toHaveBeenCalled();
      expect(mockUserFindOne).not.toHaveBeenCalled();
    });

    it('should return 401 when clerkId is undefined', async () => {
      // Arrange
      req.Auth = jest.fn(() => ({ userId: undefined }));

      // Act
      await protectRoute[1](req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Unauthorized invalid Token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when clerkId is empty string', async () => {
      // Arrange
      req.Auth = jest.fn(() => ({ userId: '' }));

      // Act
      await protectRoute[1](req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Unauthorized invalid Token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when Auth() returns null', async () => {
      // Arrange
      req.Auth = jest.fn(() => null);

      // Act
      await protectRoute[1](req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('User Not Found', () => {
    it('should return 404 when user is not found in database', async () => {
      // Arrange
      const clerkId = 'non-existent-clerk-id';
      req.Auth = jest.fn(() => ({ userId: clerkId }));
      mockUserFindOne.mockResolvedValue(null);

      // Act
      await protectRoute[1](req, res, next);

      // Assert
      expect(mockUserFindOne).toHaveBeenCalledWith({ clerkId });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'User not Found' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 404 when findOne returns undefined', async () => {
      // Arrange
      const clerkId = 'undefined-user';
      req.Auth = jest.fn(() => ({ userId: clerkId }));
      mockUserFindOne.mockResolvedValue(undefined);

      // Act
      await protectRoute[1](req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'User not Found' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Database Errors', () => {
    it('should return 500 when database query fails', async () => {
      // Arrange
      const clerkId = 'clerk-db-error';
      req.Auth = jest.fn(() => ({ userId: clerkId }));
      const dbError = new Error('Database connection failed');
      mockUserFindOne.mockRejectedValue(dbError);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      await protectRoute[1](req, res, next);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in protectRoute Middleware:',
        dbError
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Internal Server Error' });
      expect(next).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle MongoDB timeout error', async () => {
      // Arrange
      const clerkId = 'clerk-timeout';
      req.Auth = jest.fn(() => ({ userId: clerkId }));
      const timeoutError = new Error('MongoTimeoutError');
      timeoutError.name = 'MongoTimeoutError';
      mockUserFindOne.mockRejectedValue(timeoutError);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      await protectRoute[1](req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Internal Server Error' });

      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle Auth() throwing an error', async () => {
      // Arrange
      req.Auth = jest.fn(() => {
        throw new Error('Auth function failed');
      });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      await protectRoute[1](req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Internal Server Error' });

      consoleSpy.mockRestore();
    });

    it('should handle very long clerkId strings', async () => {
      // Arrange
      const longClerkId = 'clerk-' + 'a'.repeat(1000);
      req.Auth = jest.fn(() => ({ userId: longClerkId }));
      const mockUser = createMockUser({ clerkId: longClerkId });
      mockUserFindOne.mockResolvedValue(mockUser);

      // Act
      await protectRoute[1](req, res, next);

      // Assert
      expect(mockUserFindOne).toHaveBeenCalledWith({ clerkId: longClerkId });
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it('should handle special characters in clerkId', async () => {
      // Arrange
      const specialClerkId = 'clerk-test-@#$';
      req.Auth = jest.fn(() => ({ userId: specialClerkId }));
      const mockUser = createMockUser({ clerkId: specialClerkId });
      mockUserFindOne.mockResolvedValue(mockUser);

      // Act
      await protectRoute[1](req, res, next);

      // Assert
      expect(mockUserFindOne).toHaveBeenCalledWith({ clerkId: specialClerkId });
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Concurrency', () => {
    it('should handle multiple concurrent requests independently', async () => {
      // Arrange
      const requests = [
        {
          req: createMockRequest(),
          res: createMockResponse(),
          next: createMockNext(),
          clerkId: 'user-1'
        },
        {
          req: createMockRequest(),
          res: createMockResponse(),
          next: createMockNext(),
          clerkId: 'user-2'
        },
        {
          req: createMockRequest(),
          res: createMockResponse(),
          next: createMockNext(),
          clerkId: 'user-3'
        }
      ];

      requests.forEach(({ req, clerkId }, index) => {
        req.Auth = jest.fn(() => ({ userId: clerkId }));
        mockUserFindOne.mockResolvedValueOnce(
          createMockUser({ clerkId, name: `User ${index + 1}` })
        );
      });

      // Act
      await Promise.all(
        requests.map(({ req, res, next }) => protectRoute[1](req, res, next))
      );

      // Assert
      requests.forEach(({ req, next }, index) => {
        expect(req.user.name).toBe(`User ${index + 1}`);
        expect(next).toHaveBeenCalled();
      });
    });
  });
});