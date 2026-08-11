/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { type NextRequest, NextResponse } from 'next/server';
import { type z } from 'zod';
import crypto from 'crypto';
import { ValidationError } from './errors';
import { errorResponse, withErrorHandling } from './response';

// Helper function to get client IP from request headers
function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
}

/**
 * LRU Cache for rate limiting
 * Simple in-memory cache implementation for rate limiting
 */
class RateLimitCache {
  private cache: Map<string, { count: number; resetTime: number }>;
  private readonly maxSize: number;

  constructor(maxSize = 10000) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: string): { count: number; resetTime: number } | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: { count: number; resetTime: number }): void {
    // If cache is full, remove oldest entries
    if (this.cache.size >= this.maxSize) {
      const keysToDelete = Array.from(this.cache.keys()).slice(0, Math.floor(this.maxSize * 0.2));
      keysToDelete.forEach(k => this.cache.delete(k));
    }
    this.cache.set(key, value);
  }

  increment(key: string, resetTimeMs: number): number {
    const now = Date.now();
    const entry = this.cache.get(key);

    if (!entry || entry.resetTime <= now) {
      // Entry doesn't exist or has expired, create new entry
      this.cache.set(key, { count: 1, resetTime: now + resetTimeMs });
      return 1;
    } else {
      // Increment existing entry
      const newCount = entry.count + 1;
      this.cache.set(key, { count: newCount, resetTime: entry.resetTime });
      return newCount;
    }
  }

  // Clean expired entries to prevent memory leaks
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (value.resetTime <= now) {
        this.cache.delete(key);
      }
    }
  }
}

// Global rate limit cache instance
const rateLimitCache = new RateLimitCache();

// Failed login attempts tracking for progressive delays
const failedLoginAttemptsCache = new Map<string, { count: number; lastAttempt: number }>();

// Set to track used request IDs to prevent duplicates
const usedRequestIds = new Set<string>();

// Run cleanup every 5 minutes
setInterval(() => {
  rateLimitCache.cleanup();
  
  // Clean up failed login attempts older than 1 hour
  const now = Date.now();
  for (const [key, value] of failedLoginAttemptsCache.entries()) {
    if (now - value.lastAttempt > 60 * 60 * 1000) { // 1 hour
      failedLoginAttemptsCache.delete(key);
    }
  }
  
  // Clean up request IDs older than 24 hours
  if (usedRequestIds.size > 10000) {
    usedRequestIds.clear();
  }
}, 5 * 60 * 1000);

/**
 * Rate limiting middleware
 * Limits requests based on IP address or other identifier
 */
/**
 * Generate a unique request ID
 * Used for tracking requests across the system
 */
export function generateRequestId(): string {
  let requestId: string;
  do {
    requestId = crypto.randomBytes(16).toString('hex');
  } while (usedRequestIds.has(requestId));
  
  usedRequestIds.add(requestId);
  return requestId;
}

/**
 * Add security headers to response
 * Implements best practices for web security
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;");
  
  // Cache control
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  
  return response;
}

/**
 * Sanitize request data to prevent XSS attacks
 * @param data The data to sanitize
 */
export function sanitizeRequestData<T extends Record<string, any>>(data: T): T {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Basic sanitization - remove HTML and script tags
      sanitized[key] = value
        .replace(/<\/?[^>]+(>|$)/g, '') // Remove HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, ''); // Remove event handlers
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeRequestData(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
}

/**
 * CSRF protection middleware
 * Verifies CSRF token in requests
 */
export function csrfProtection() {
  return async function csrfMiddleware(
    req: NextRequest
  ): Promise<NextResponse | void> {
    // Skip CSRF check for GET, HEAD, OPTIONS requests as they should be safe
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return;
    }
    
    // Check for CSRF token in headers
    const csrfToken = req.headers.get('X-CSRF-Token');
    
    // In a real implementation, you would verify the CSRF token against the session
    // For demonstration purposes, we'll just check if a token exists
    if (!csrfToken) {
      return errorResponse('CSRF token missing', 403);
    }
    
    // Continue with request
    return;
  };
}

/**
 * Rate limiting middleware
 * Limits requests based on IP address or other identifier
 */
export function rateLimit(options: {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests in window
  keyGenerator?: (req: NextRequest) => string; // Function to generate a unique key for the request
  skipFailedRequests?: boolean; // Whether to skip counting failed requests
  handler?: (req: NextRequest) => NextResponse | Promise<NextResponse>; // Custom handler for rate limit exceeded
  includeHeaders?: boolean; // Whether to include rate limit headers in responses
}) {
  const {
    windowMs = 60 * 1000, // 1 minute by default
    maxRequests = 60, // 60 requests per minute by default
    keyGenerator = (req) => getClientIp(req), // Default to IP-based rate limiting
    handler,
    includeHeaders = true
  } = options;

  return async function rateLimitMiddleware(
    req: NextRequest
  ): Promise<NextResponse> {
    const key = keyGenerator(req);
    const requestCount = rateLimitCache.increment(key, windowMs);

    if (requestCount > maxRequests) {
      // Rate limit exceeded
      if (handler) {
        return handler(req);
      }

      // Default rate limit response
      const resetTime = rateLimitCache.get(key)?.resetTime || Date.now() + windowMs;
      const response = errorResponse('Rate limit exceeded. Please try again later.', 429);
      
      if (includeHeaders) {
        response.headers.set('X-RateLimit-Limit', maxRequests.toString());
        response.headers.set('X-RateLimit-Remaining', '0');
        response.headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
        response.headers.set('Retry-After', Math.ceil(windowMs / 1000).toString());
      }
      
      // Add security headers
      return addSecurityHeaders(response);
    }

    // Request is allowed
    const response = NextResponse.next();
    
    // Add rate limit headers if enabled
    if (includeHeaders) {
      const rateLimitInfo = rateLimitCache.get(key);
      const remaining = rateLimitInfo ? Math.max(0, maxRequests - rateLimitInfo.count) : maxRequests;
      const resetTime = rateLimitInfo?.resetTime || Date.now() + windowMs;
      
      response.headers.set('X-RateLimit-Limit', maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
    }
    
    return response;
  };
}

/**
 * Request validation middleware
 * Validates request body against a Zod schema
 */
export function validateRequest<T>(schema: z.ZodType<T>) {
  return async function validationMiddleware(
    req: NextRequest
  ): Promise<{ data: T; validation: { success: true } } | NextResponse> {
    try {
      // Parse request JSON body
      const body = await req.json().catch(() => ({}));
      
      // Validate against schema
      const result = schema.safeParse(body);
      
      if (!result.success) {
        const formatted = result.error.format();
        return errorResponse(
          new ValidationError('Validation error', formatted),
          422
        );
      }
      
      return { data: result.data, validation: { success: true } };
    } catch (error) {
      return errorResponse(
        new ValidationError('Invalid request body'),
        400
      );
    }
  };
}

/**
 * Request logger middleware
 * Logs information about incoming requests
 */
export function logRequest(options: { 
  logLevel?: 'info' | 'debug' | 'warn' | 'error';
  includeHeaders?: boolean;
  includeTiming?: boolean;
} = {}) {
  const { 
    logLevel = 'info',
    includeHeaders = false  } = options;
  
  return async function loggerMiddleware(
    req: NextRequest,
    _context: any = {}
  ): Promise<{ requestId: string, requestStartTime: number }> {
    const start = Date.now();
    const method = req.method;
    const url = req.url;
    const ip = getClientIp(req);
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // Generate a unique request ID for tracking
    const requestId = generateRequestId();
    
    // Basic request info
    let logMessage = `[${new Date().toISOString()}] ${requestId} - ${method} ${url} - ${ip} - ${userAgent}`;
    
    // Include headers if requested (but filter out sensitive data)
    if (includeHeaders) {
      const headers: Record<string, string> = {};
      req.headers.forEach((value, key) => {
        // Skip sensitive headers
        if (!['authorization', 'cookie', 'x-csrf-token'].includes(key.toLowerCase())) {
          headers[key] = value;
        }
      });
      logMessage += `\nHeaders: ${JSON.stringify(headers)}`;
    }
    
    // Log based on log level
    switch (logLevel) {
      case 'debug':
        console.debug(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'error':
        console.error(logMessage);
        break;
      case 'info':
      default:
        console.log(logMessage);
    }
    
    // Return the request ID and start time for later use
    return { requestId, requestStartTime: start };
  };
}

/**
 * Logs additional information upon completion of a request
 */
export function logRequestCompletion(req: NextRequest, response: NextResponse, context: any) {
  // If we have timing info from the request logger, use it
  if (context.requestStartTime) {
    const duration = Date.now() - context.requestStartTime;
    const status = response.status;
    
    console.log(
      `[${new Date().toISOString()}] ${context.requestId || 'UNKNOWN'} - Completed ${req.method} ${req.url} - ${status} - ${duration}ms`
    );
  }
  
  return response;
}

/**
 * Track failed login attempts for progressive delays and brute force protection
 */
export function trackFailedLoginAttempt(key: string): number {
  const now = Date.now();
  const entry = failedLoginAttemptsCache.get(key);
  
  if (!entry) {
    failedLoginAttemptsCache.set(key, { count: 1, lastAttempt: now });
    return 1;
  } else {
    const newCount = entry.count + 1;
    failedLoginAttemptsCache.set(key, { count: newCount, lastAttempt: now });
    return newCount;
  }
}

/**
 * Calculate delay for progressive backoff based on failed attempts
 */
export function calculateLoginDelay(attempts: number): number {
  // Base delay of 1 second, doubling each time, capped at 30 seconds
  return Math.min(1000 * Math.pow(2, attempts - 1), 30000);
}

/**
 * Middleware composition utility
 * Combines multiple middleware functions into a single handler
 */
export const withMiddleware = (handler: (req: NextRequest, context: any) => Promise<any>) => {
  return async (req: NextRequest, context: any = {}) => {
    try {
      // Add request logging
      const loggerMiddleware = logRequest();
      const logContext = await loggerMiddleware(req);
      
      // Combine the original context with the logger context
      const enrichedContext = { ...context, ...logContext };
      
      // Execute the handler with the enriched context
      const response = await withErrorHandling(() => handler(req, enrichedContext)) as any;
      
      // Add security headers to the response
      return addSecurityHeaders(response) as any;
    } catch (error) {
      // Handle any unhandled errors
      return errorResponse(error) as any;
    }
  };
};

