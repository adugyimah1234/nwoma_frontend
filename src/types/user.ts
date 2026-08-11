/**
 * User types for the application
 */

import { z } from 'zod';
import { UserRole } from '@/lib/api/auth';

/**
 * User status enum
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}

/**
 * Base user information
 */
export interface BaseUser {
  id: string;
  email: string;
}

/**
 * Full User interface that extends BaseUser with all fields
 */
export interface User extends BaseUser {
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  profileImage?: string;
  lastLogin?: string;
}

/**
 * Registration payload type
 */
interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  username: string;
  role: string;
  school_id: string;
}

/**
 * Login payload type
 */
export interface LoginPayload {
  username: string;
  password: string;
}

/**
 * Pagination params for user listing
 */
export interface UserPaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  role?: UserRole;
  status?: UserStatus;
}

/**
 * Response for paginated user list
 */
export interface PaginatedUsers {
  users: User[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}

/**
 * Create user data
 */
export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  status?: UserStatus;
  profileImage?: string;
}

/**
 * Update user data
 */
export interface UpdateUserData {
  name?: string;
  username?: string;
  role?: UserRole;
  status?: UserStatus;
  password?: string;
  profileImage?: string;
}

// Zod schema for validation

/**
 * User creation schema
 */
export const createUserSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(255, 'Email cannot exceed 255 characters'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password cannot exceed 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: 'Invalid user role' }),
  }),
  status: z
    .nativeEnum(UserStatus, {
      errorMap: () => ({ message: 'Invalid user status' }),
    })
    .optional(),
  profileImage: z.string().url('Profile image must be a valid URL').optional(),
});

/**
 * User update schema
 */
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .optional(),
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(255, 'Email cannot exceed 255 characters')
    .optional(),
  role: z
    .nativeEnum(UserRole, {
      errorMap: () => ({ message: 'Invalid user role' }),
    })
    .optional(),
  status: z
    .nativeEnum(UserStatus, {
      errorMap: () => ({ message: 'Invalid user status' }),
    })
    .optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password cannot exceed 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .optional(),
  profileImage: z.string().url('Profile image must be a valid URL').optional(),
});

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.coerce
    .number()
    .int('Page must be an integer')
    .positive('Page must be positive')
    .default(1),
  pageSize: z.coerce
    .number()
    .int('Page size must be an integer')
    .positive('Page size must be positive')
    .max(100, 'Page size cannot exceed 100')
    .default(10),
  sortBy: z
    .enum(['name', 'email', 'role', 'status', 'createdAt', 'lastLogin'], {
      errorMap: () => ({ message: 'Invalid sort field' }),
    })
    .optional()
    .default('createdAt'),
  sortOrder: z
    .enum(['asc', 'desc'], {
      errorMap: () => ({ message: 'Sort order must be asc or desc' }),
    })
    .optional()
    .default('desc'),
  search: z.string().optional(),
  role: z
    .nativeEnum(UserRole, {
      errorMap: () => ({ message: 'Invalid user role' }),
    })
    .optional(),
  status: z
    .nativeEnum(UserStatus, {
      errorMap: () => ({ message: 'Invalid user status' }),
    })
    .optional(),
});

