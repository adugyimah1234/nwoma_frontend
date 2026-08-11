/* eslint-disable @next/next/no-assign-module-variable */
/**
 * Module types for the application
 */
import { z } from 'zod';
import { UserRole } from '@/lib/api/auth';

/**
 * Module interface represents a section or feature in the application
 */
export interface Module {
  id: string;
  name: string;
  path: string;
  description: string;
  children?: Module[];
}

/**
 * User module access mapping
 */
export interface UserModuleAccess {
  userId: string;
  modules: Record<string, boolean>;
}

/**
 * Available modules in the system
 */
export const availableModules: Module[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    path: '/',
    description: 'Main dashboard access'
  },
  {
    id: 'registration',
    name: 'Registration',
    path: '/registration',
    description: 'Student registration management',
    children: [
      { id: 'new-registration', name: 'New Registration', path: '/registration/new', description: 'Create new student registrations' },
      { id: 'manage-applicant', name: 'Manage Applicant', path: '/registration/manage', description: 'Manage existing registrations' }
    ]
  },
  {
    id: 'assessments',
    name: 'Entrance Assessments',
    path: '/assessments',
    description: 'Assessment management',
    children: [
      { id: 'view-results', name: 'View Results', path: '/assessments/results', description: 'View assessment results' },
      { id: 'recordings', name: 'Recordings', path: '/assessments/recordings', description: 'Manage assessment recordings' },
      { id: 'shortlisted', name: 'Shortlisted', path: '/assessments/shortlisted', description: 'View shortlisted candidates' }
    ]
  },
  {
    id: 'admissions',
    name: 'Admissions',
    path: '/admissions',
    description: 'Manage student admissions',
    children: [
      { id: 'admission-process', name: 'Admission Process', path: '/admissions/admission-process', description: 'Manage admission process' },
      { id: 'enrolled-students', name: 'Enrolled Students', path: '/admissions/enrolled-students', description: 'View enrolled students' }
    ]
  },
  {
    id: 'fees',
    name: 'Fees',
    path: '/fees',
    description: 'Fee management',
    children: [
      { id: 'invoices', name: 'Invoices', path: '/fees/invoices', description: 'Manage fee invoices' },
      { id: 'payment-history', name: 'Payment History', path: '/fees/payment-history', description: 'View payment history' },
      { id: 'records', name: 'Records', path: '/fees/records', description: 'Fee records' }
    ]
  },
  {
    id: 'admin',
    name: 'Administration',
    path: '/admin',
    description: 'Administrative functions',
    children: [
      { id: 'user-management', name: 'User Management', path: '/admin/user-management', description: 'Manage system users' },
      { id: 'roles', name: 'Roles', path: '/admin/roles', description: 'Manage user roles' },
      { id: 'module-access', name: 'Module Access', path: '/admin/module-access', description: 'Control module access' },
      { id: 'schools', name: 'Schools', path: '/admin/schools', description: 'Manage schools' },
      { id: 'classes', name: 'Classes', path: '/admin/classes', description: 'Manage classes' },
      { id: 'categories', name: 'Categories', path: '/admin/categories', description: 'Manage categories' },
      { id: 'assessment-config', name: 'Assessment Config', path: '/admin/assessment-config', description: 'Configure assessments' },
      { id: 'fees', name: 'Fee Configuration', path: '/admin/fees', description: 'Configure fees' },
      { id: 'system-settings', name: 'System Settings', path: '/admin/system-settings', description: 'Configure system settings' }
    ]
  },
  {
    id: 'profile',
    name: 'Profile',
    path: '/profile',
    description: 'User profile management'
  },
];

/**
 * Default module access by user role
 */
export const defaultModuleAccessByRole: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: availableModules.flatMap(module => 
    [module.id, ...(module.children?.map(child => child.id) || [])]
  ),
  [UserRole.SUPER_ADMIN]: availableModules.flatMap(module =>
    [module.id, ...(module.children?.map(child => child.id) || [])]
  ),
  [UserRole.GARRISON_DIRECTOR]: availableModules.flatMap(module =>
    [module.id, ...(module.children?.map(child => child.id) || [])]
  ),
  [UserRole.TEACHER]: [
    'dashboard',
    'assessments', 'view-results', 'recordings',
    'profile'
  ],
  [UserRole.STUDENT]: [
    'dashboard',
    'profile',
    'assessments', 'view-results',
    'fees', 'invoices', 'payment-history'
  ],
  [UserRole.PARENT]: [
    'dashboard',
    'profile',
    'assessments', 'view-results',
    'fees', 'invoices', 'payment-history', 'records'
  ],
  [UserRole.STAFF]: [
    'dashboard',
    'profile',
    'registration', 'new-registration', 'manage-applicant',
    'admissions', 'admission-process', 'enrolled-students',
    'fees', 'invoices', 'payment-history', 'records'
  ]
};

/**
 * Module access update schema
 */
export const moduleAccessSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  moduleId: z.string().min(1, "Module ID is required"),
  hasAccess: z.boolean()
});

/**
 * Get user module access schema
 */
export const getUserModuleAccessSchema = z.object({
  userId: z.string().min(1, "User ID is required")
});

/**
 * Get all modules for user role schema
 */
export const getAllModulesForRoleSchema = z.object({
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: 'Invalid user role' })
  })
});

/**
 * Utility function to get all module IDs, including children
 */
export function getAllModuleIds(modules: Module[] = availableModules): string[] {
  return modules.flatMap(module => 
    [module.id, ...(module.children?.map(child => child.id) || [])]
  );
}

/**
 * Utility function to find a module by ID
 */
export function findModuleById(
  moduleId: string,
  modules: Module[] = availableModules
): Module | undefined {
  for (const module of modules) {
    if (module.id === moduleId) {
      return module;
    }
    
    if (module.children) {
      const childModule = findModuleById(moduleId, module.children);
      if (childModule) {
        return childModule;
      }
    }
  }
  
  return undefined;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  path: string;
  children?: Module[];
}

export interface ModuleAccess {
  id: string;
  userId: string;
  moduleId: string;
  hasAccess: boolean;
}