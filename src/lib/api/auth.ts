import { type NextRequest, type NextResponse } from 'next/server';
import { AuthorizationError } from './errors';
import { errorResponse } from './response';

/**
 * Types of user roles in the system
 */
export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
  PARENT = 'parent',
  STAFF = 'staff',
  SUPER_ADMIN = 'super_admin',
  GARRISON_DIRECTOR = 'garrison_director',
}

/**
 * Middleware to verify that a user is authenticated
 */
export function requireAuth() {
  return async function authMiddleware(
    req: NextRequest
  ): Promise<NextResponse | void> {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    
    // If no auth header, return unauthorized
    if (!authHeader) {
      return errorResponse('Authentication required', 401);
    }
    
    // Check if it's a Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      return errorResponse('Invalid authentication format', 401);
    }
    
    const token = authHeader.substring(7);
    
    // For the sake of this example, we'll consider a non-empty token as valid
    // In a real application, you would verify the JWT token here
    if (!token) {
      return errorResponse('Invalid token', 401);
    }
    
    try {
      // In a real app, validate the token and extract user info
      // For this example, we'll use mock user data
      const user = mockVerifyToken(token);
      
      (req as any).user = user;
      return;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return errorResponse('Authentication failed', 401);
    }
  };
}

/**
 * Middleware to verify user has required role
 */
export function requireRole(allowedRoles: UserRole[]) {
  return async function roleMiddleware(
    req: NextRequest,
    context: { user?: { role: string } }
  ): Promise<NextResponse | void> {
    // Ensure we have a user (auth middleware should run first)
    if (!context.user) {
      return errorResponse('Authentication required', 401);
    }
    
    // Check if user has an allowed role
    if (!allowedRoles.includes(context.user.role as UserRole)) {
      return errorResponse('Insufficient permissions', 403);
    }
    
    // User is authorized, continue
    return;
  };
}

/**
 * Mock function to verify token
 * In a real application, you would verify the JWT token against your secret
 */
function mockVerifyToken(token: string): { id: string; email: string; role: string; name: string } {
  // This is just a mock implementation
  // In a real application, you would decode and verify the JWT
  if (token === 'mock-jwt-token') {
    return {
      id: '123456',
      email: 'admin@example.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
    };
  }
  
  throw new AuthorizationError('Invalid token');
}

