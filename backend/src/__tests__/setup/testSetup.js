// Test setup and utilities for mocking common dependencies

// Mock Clerk requireAuth
export const mockRequireAuth = () => {
  return jest.fn(() => (req, res, next) => {
    req.auth = jest.fn(() => ({ userId: 'test-clerk-id-123' }));
    next();
  });
};

// Mock User model
export const createMockUser = (overrides = {}) => ({
  _id: 'mock-user-id',
  clerkId: 'test-clerk-id-123',
  name: 'Test User',
  email: 'test@example.com',
  profileImage: 'https://example.com/image.jpg',
  ...overrides
});

// Mock Stream Chat client
export const createMockChatClient = () => ({
  createToken: jest.fn((userId) => `mock-token-for-${userId}`)
});

// Mock Express request object
export const createMockRequest = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: null,
  auth: jest.fn(() => ({ userId: null })),
  Auth: jest.fn(() => ({ userId: null })),
  ...overrides
});

// Mock Express response object
export const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

// Mock Express next function
export const createMockNext = () => jest.fn();