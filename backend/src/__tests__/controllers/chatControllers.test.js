import { jest } from '@jest/globals';
import { createMockRequest, createMockResponse, createMockChatClient, createMockUser } from '../setup/testSetup.js';

// Mock dependencies before importing the controller
const mockChatClient = createMockChatClient();

jest.unstable_mockModule('../../lib/stream.js', () => ({
  chatClient: mockChatClient
}));

const { getStreamToken } = await import('../../controllers/chatControllers.js');

describe('chatControllers', () => {
  describe('getStreamToken', () => {
    let req, res;

    beforeEach(() => {
      req = createMockRequest();
      res = createMockResponse();
      jest.clearAllMocks();
    });

    describe('Happy Path', () => {
      it('should return stream token with user details when user is authenticated', async () => {
        // Arrange
        const mockUser = createMockUser({
          clerkId: 'clerk-123',
          name: 'John Doe',
          profileImage: 'https://example.com/john.jpg'
        });
        req.user = mockUser;
        mockChatClient.createToken.mockReturnValue('mock-stream-token-xyz');

        // Act
        await getStreamToken(req, res);

        // Assert
        expect(mockChatClient.createToken).toHaveBeenCalledWith('clerk-123');
        expect(mockChatClient.createToken).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          token: 'mock-stream-token-xyz',
          userId: 'clerk-123',
          userName: 'John Doe',
          userImage: 'https://example.com/john.jpg'
        });
      });

      it('should handle user with minimal profile information', async () => {
        // Arrange
        const mockUser = createMockUser({
          clerkId: 'clerk-456',
          name: 'Jane Smith',
          profileImage: ''
        });
        req.user = mockUser;
        mockChatClient.createToken.mockReturnValue('token-456');

        // Act
        await getStreamToken(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          token: 'token-456',
          userId: 'clerk-456',
          userName: 'Jane Smith',
          userImage: ''
        });
      });

      it('should handle user with special characters in name', async () => {
        // Arrange
        const mockUser = createMockUser({
          clerkId: 'clerk-789',
          name: "O'Brien José",
          profileImage: 'https://example.com/avatar.png'
        });
        req.user = mockUser;
        mockChatClient.createToken.mockReturnValue('token-789');

        // Act
        await getStreamToken(req, res);

        // Assert
        expect(res.json).toHaveBeenCalledWith({
          token: 'token-789',
          userId: 'clerk-789',
          userName: "O'Brien José",
          userImage: 'https://example.com/avatar.png'
        });
      });
    });

    describe('Edge Cases', () => {
      it('should handle missing user object', async () => {
        // Arrange
        req.user = null;

        // Act & Assert
        await expect(async () => {
          await getStreamToken(req, res);
        }).rejects.toThrow();
      });

      it('should handle user with undefined clerkId', async () => {
        // Arrange
        const mockUser = createMockUser({ clerkId: undefined });
        req.user = mockUser;

        // Act
        await getStreamToken(req, res);

        // Assert
        expect(mockChatClient.createToken).toHaveBeenCalledWith(undefined);
      });

      it('should handle user with empty string clerkId', async () => {
        // Arrange
        const mockUser = createMockUser({ clerkId: '' });
        req.user = mockUser;
        mockChatClient.createToken.mockReturnValue('empty-token');

        // Act
        await getStreamToken(req, res);

        // Assert
        expect(mockChatClient.createToken).toHaveBeenCalledWith('');
        expect(res.status).toHaveBeenCalledWith(200);
      });
    });

    describe('Error Handling', () => {
      it('should handle chatClient.createToken throwing an error', async () => {
        // Arrange
        const mockUser = createMockUser();
        req.user = mockUser;
        const error = new Error('Stream API error');
        mockChatClient.createToken.mockImplementation(() => {
          throw error;
        });
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        // Act
        await getStreamToken(req, res);

        // Assert
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error in getstream token controller:',
          'Stream API error'
        );
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ msg: 'Internal server error' });

        consoleSpy.mockRestore();
      });

      it('should handle network timeout error', async () => {
        // Arrange
        const mockUser = createMockUser();
        req.user = mockUser;
        const timeoutError = new Error('ETIMEDOUT');
        timeoutError.code = 'ETIMEDOUT';
        mockChatClient.createToken.mockImplementation(() => {
          throw timeoutError;
        });
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        // Act
        await getStreamToken(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ msg: 'Internal server error' });

        consoleSpy.mockRestore();
      });
    });

    describe('Response Format Validation', () => {
      it('should return response with all required fields', async () => {
        // Arrange
        const mockUser = createMockUser();
        req.user = mockUser;
        mockChatClient.createToken.mockReturnValue('complete-token');

        // Act
        await getStreamToken(req, res);

        // Assert
        const response = res.json.mock.calls[0][0];
        expect(response).toHaveProperty('token');
        expect(response).toHaveProperty('userId');
        expect(response).toHaveProperty('userName');
        expect(response).toHaveProperty('userImage');
        expect(Object.keys(response)).toHaveLength(4);
      });

      it('should return correct data types for each field', async () => {
        // Arrange
        const mockUser = createMockUser();
        req.user = mockUser;
        mockChatClient.createToken.mockReturnValue('typed-token');

        // Act
        await getStreamToken(req, res);

        // Assert
        const response = res.json.mock.calls[0][0];
        expect(typeof response.token).toBe('string');
        expect(typeof response.userId).toBe('string');
        expect(typeof response.userName).toBe('string');
      });
    });

    describe('Concurrency', () => {
      it('should handle multiple simultaneous requests correctly', async () => {
        // Arrange
        const requests = Array.from({ length: 10 }, (_, i) => ({
          req: createMockRequest({
            user: createMockUser({ clerkId: `clerk-${i}` })
          }),
          res: createMockResponse()
        }));

        mockChatClient.createToken.mockImplementation(
          (id) => `token-${id}`
        );

        // Act
        await Promise.all(
          requests.map(({ req, res }) => getStreamToken(req, res))
        );

        // Assert
        expect(mockChatClient.createToken).toHaveBeenCalledTimes(10);
        requests.forEach(({ res }, i) => {
          expect(res.status).toHaveBeenCalledWith(200);
        });
      });
    });
  });
});