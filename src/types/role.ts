/**
 * Role types for the application
 */

import { z } from 'zod';
import { UserRole } from '@/lib/api/auth';

/**
 * Permission represents a specific action that can be performed
 */
export enum Permission {
  // User management
  VIEW_USERS = 'view_users',
  CREATE_USER = 'create_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',
  
  // Role management
  VIEW_ROLES = 'view_roles',
  CREATE_ROLE = 'create_role',
  UPDATE_ROLE = 'update_role',
  DELETE_ROLE = 'delete_role',
  
  // School management
  VIEW_SCHOOLS = 'view_schools',
  CREATE_SCHOOL = 'create_school',
  UPDATE_SCHOOL = 'update_school',
  DELETE_SCHOOL = 'delete_school',
  
  // Class management
  VIEW_CLASSES = 'view_classes',
  CREATE_CLASS = 'create_class',
  UPDATE_CLASS = 'update_class',
  DELETE_CLASS = 'delete_class',
  
  // Category management
  VIEW_CATEGORIES = 'view_categories',
  CREATE_CATEGORY = 'create_category',
  UPDATE_CATEGORY = 'update_category',
  DELETE_CATEGORY = 'delete_category',
  
  // Module access
  VIEW_MODULES = 'view_modules',
  UPDATE_MODULE_ACCESS = 'update_module_access',
  
  // Registration
  VIEW_REGISTRATIONS = 'view_registrations',
  CREATE_REGISTRATION = 'create_registration',
  UPDATE_REGISTRATION = 'update_registration',
  DELETE_REGISTRATION = 'delete_registration',
  
  // Admissions
  VIEW_ADMISSIONS = 'view_admissions',
  UPDATE_ADMISSION_STATUS = 'update_admission_status',
  DELETE_ADMISSION = 'delete_admission',
  
  // Assessments
  VIEW_ASSESSMENTS = 'view_assessments',
  CREATE_ASSESSMENT = 'create_assessment',
  UPDATE_ASSESSMENT = 'update_assessment',
  DELETE_ASSESSMENT = 'delete_assessment',
  RECORD_ASSESSMENT_RESULTS = 'record_assessment_results',
  
  // Fees
  VIEW_FEES = 'view_fees',
  CREATE_FEE = 'create_fee',
  UPDATE_FEE = 'update_fee',
  DELETE_FEE = 'delete_fee',
  RECORD_PAYMENT = 'record_payment',
  
  // System settings
  VIEW_SETTINGS = 'view_settings',
  UPDATE_SETTINGS = 'update_settings',
}

/**
 * Permission category for grouping permissions
 */
export enum PermissionCategory {
  USER_MANAGEMENT = 'User Management',
  ROLE_MANAGEMENT = 'Role Management',
  SCHOOL_MANAGEMENT = 'School Management',
  CLASS_MANAGEMENT = 'Class Management',
  CATEGORY_MANAGEMENT = 'Category Management',
  MODULE_ACCESS = 'Module Access',
  REGISTRATION = 'Registration',
  ADMISSIONS = 'Admissions',
  ASSESSMENTS = 'Assessments',
  FEES = 'Fees',
  SYSTEM_SETTINGS = 'System Settings',
}

/**
 * Mapping of permissions to their categories
 */
export const permissionCategories: Record<Permission, PermissionCategory> = {
  // User management
  [Permission.VIEW_USERS]: PermissionCategory.USER_MANAGEMENT,
  [Permission.CREATE_USER]: PermissionCategory.USER_MANAGEMENT,
  [Permission.UPDATE_USER]: PermissionCategory.USER_MANAGEMENT,
  [Permission.DELETE_USER]: PermissionCategory.USER_MANAGEMENT,
  
  // Role management
  [Permission.VIEW_ROLES]: PermissionCategory.ROLE_MANAGEMENT,
  [Permission.CREATE_ROLE]: PermissionCategory.ROLE_MANAGEMENT,
  [Permission.UPDATE_ROLE]: PermissionCategory.ROLE_MANAGEMENT,
  [Permission.DELETE_ROLE]: PermissionCategory.ROLE_MANAGEMENT,
  
  // School management
  [Permission.VIEW_SCHOOLS]: PermissionCategory.SCHOOL_MANAGEMENT,
  [Permission.CREATE_SCHOOL]: PermissionCategory.SCHOOL_MANAGEMENT,
  [Permission.UPDATE_SCHOOL]: PermissionCategory.SCHOOL_MANAGEMENT,
  [Permission.DELETE_SCHOOL]: PermissionCategory.SCHOOL_MANAGEMENT,
  
  // Class management
  [Permission.VIEW_CLASSES]: PermissionCategory.CLASS_MANAGEMENT,
  [Permission.CREATE_CLASS]: PermissionCategory.CLASS_MANAGEMENT,
  [Permission.UPDATE_CLASS]: PermissionCategory.CLASS_MANAGEMENT,
  [Permission.DELETE_CLASS]: PermissionCategory.CLASS_MANAGEMENT,
  
  // Category management
  [Permission.VIEW_CATEGORIES]: PermissionCategory.CATEGORY_MANAGEMENT,
  [Permission.CREATE_CATEGORY]: PermissionCategory.CATEGORY_MANAGEMENT,
  [Permission.UPDATE_CATEGORY]: PermissionCategory.CATEGORY_MANAGEMENT,
  [Permission.DELETE_CATEGORY]: PermissionCategory.CATEGORY_MANAGEMENT,
  
  // Module access
  [Permission.VIEW_MODULES]: PermissionCategory.MODULE_ACCESS,
  [Permission.UPDATE_MODULE_ACCESS]: PermissionCategory.MODULE_ACCESS,
  
  // Registration
  [Permission.VIEW_REGISTRATIONS]: PermissionCategory.REGISTRATION,
  [Permission.CREATE_REGISTRATION]: PermissionCategory.REGISTRATION,
  [Permission.UPDATE_REGISTRATION]: PermissionCategory.REGISTRATION,
  [Permission.DELETE_REGISTRATION]: PermissionCategory.REGISTRATION,
  
  // Admissions
  [Permission.VIEW_ADMISSIONS]: PermissionCategory.ADMISSIONS,
  [Permission.UPDATE_ADMISSION_STATUS]: PermissionCategory.ADMISSIONS,
  [Permission.DELETE_ADMISSION]: PermissionCategory.ADMISSIONS,
  
  // Assessments
  [Permission.VIEW_ASSESSMENTS]: PermissionCategory.ASSESSMENTS,
  [Permission.CREATE_ASSESSMENT]: PermissionCategory.ASSESSMENTS,
  [Permission.UPDATE_ASSESSMENT]: PermissionCategory.ASSESSMENTS,
  [Permission.DELETE_ASSESSMENT]: PermissionCategory.ASSESSMENTS,
  [Permission.RECORD_ASSESSMENT_RESULTS]: PermissionCategory.ASSESSMENTS,
  
  // Fees
  [Permission.VIEW_FEES]: PermissionCategory.FEES,
  [Permission.CREATE_FEE]: PermissionCategory.FEES,
  [Permission.UPDATE_FEE]: PermissionCategory.FEES,
  [Permission.DELETE_FEE]: PermissionCategory.FEES,
  [Permission.RECORD_PAYMENT]: PermissionCategory.FEES,
  
  // System settings
  [Permission.VIEW_SETTINGS]: PermissionCategory.SYSTEM_SETTINGS,
  [Permission.UPDATE_SETTINGS]: PermissionCategory.SYSTEM_SETTINGS,
};

/**
 * Role represents a set of permissions assigned to users
 */
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  isSystem: boolean; // System roles cannot be modified/deleted
}

/**
 * Create role data
 */
export interface CreateRoleData {
  name: string;
  description: string;
  permissions: Permission[];
  isDefault?: boolean;
}

/**
 * Update role data
 */
export interface UpdateRoleData {
  name?: string;
  description?: string;
  permissions?: Permission[];
  isDefault?: boolean;
}

/**
 * Pagination params for role listing
 */
export interface RolePaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

/**
 * Response for paginated role list
 */
export interface PaginatedRoles {
  roles: Role[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}

/**
 * Default role mapping for user types
 */
export const defaultRolesByUserType: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: Object.values(Permission), // Admin has all permissions
  
  [UserRole.TEACHER]: [
    // Teachers can view users but not create/update/delete
    Permission.VIEW_USERS,
    
    // Teachers can view class information
    Permission.VIEW_CLASSES,
    
    // Teachers can view and work with assessments
    Permission.VIEW_ASSESSMENTS,
    Permission.CREATE_ASSESSMENT,
    Permission.UPDATE_ASSESSMENT,
    Permission.RECORD_ASSESSMENT_RESULTS,
    
    // Teachers can view registrations
    Permission.VIEW_REGISTRATIONS,
    
    // Teachers can view admissions
    Permission.VIEW_ADMISSIONS,
    
    // Teachers can view categories
    Permission.VIEW_CATEGORIES,
  ],
  
  [UserRole.STUDENT]: [
    // Students can view registrations
    Permission.VIEW_REGISTRATIONS,
    
    // Students can view their own assessment results (but not create/update)
    Permission.VIEW_ASSESSMENTS,
    
    // Students can view fee information
    Permission.VIEW_FEES,
  ],
  
  [UserRole.PARENT]: [
    // Parents can view registrations
    Permission.VIEW_REGISTRATIONS,
    
    // Parents can view assessment results
    Permission.VIEW_ASSESSMENTS,
    
    // Parents can view and pay fees
    Permission.VIEW_FEES,
    Permission.RECORD_PAYMENT,
  ],
  
  [UserRole.STAFF]: [
    // Staff can view users
    Permission.VIEW_USERS,
    
    // Staff can manage registrations
    Permission.VIEW_REGISTRATIONS,
    Permission.CREATE_REGISTRATION,
    Permission.UPDATE_REGISTRATION,
    
    // Staff can view classes
    Permission.VIEW_CLASSES,
    
    // Staff can view and manage admissions
    Permission.VIEW_ADMISSIONS,
    Permission.UPDATE_ADMISSION_STATUS,
    
    // Staff can view and manage fees
    Permission.VIEW_FEES,
    Permission.CREATE_FEE,
    Permission.UPDATE_FEE,
    Permission.RECORD_PAYMENT,
  ],

  [UserRole.SUPER_ADMIN]: Object.values(Permission), // Super Admin has all permissions

  [UserRole.GARRISON_DIRECTOR]: [
    Permission.VIEW_USERS,
    Permission.VIEW_SCHOOLS,
    Permission.VIEW_CLASSES,
    Permission.VIEW_CATEGORIES,
    Permission.VIEW_REGISTRATIONS,
    Permission.VIEW_ADMISSIONS,
    Permission.VIEW_ASSESSMENTS,
    Permission.VIEW_FEES,
    Permission.VIEW_SETTINGS,
  ],
};

// Zod schemas for validation

/**
 * Role creation schema
 */
export const createRoleSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  description: z
    .string()
    .min(5, 'Description must be at least 5 characters')
    .max(500, 'Description cannot exceed 500 characters'),
  permissions: z.array(
    z.nativeEnum(Permission, {
      errorMap: () => ({ message: 'Invalid permission' }),
    })
  ),
  isDefault: z.boolean().optional().default(false),
});

/**
 * Role update schema
 */
export const updateRoleSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .optional(),
  description: z
    .string()
    .min(5, 'Description must be at least 5 characters')
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  permissions: z
    .array(
      z.nativeEnum(Permission, {
        errorMap: () => ({ message: 'Invalid permission' }),
      })
    )
    .optional(),
  isDefault: z.boolean().optional(),
});

/**
 * Pagination schema for roles
 */
export const rolePaginationSchema = z.object({
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
    .enum(['name', 'createdAt'], {
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
});

