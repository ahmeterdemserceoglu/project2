import { z } from 'zod';
import { NextRequest } from 'next/server';
import { ApiResponseHandler } from './api-response-handler';

// Common validation schemas
export const schemas = {
  email: z.string().email('Invalid email format').toLowerCase().trim(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  id: z.string().uuid('Invalid ID format'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  positiveNumber: z.number().positive('Must be a positive number'),
  nonEmptyString: z.string().min(1, 'Field cannot be empty').trim(),
};

// Validation decorator
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (request: NextRequest, ...args: any[]) {
      try {
        const body = await request.json();
        const validatedData = schema.parse(body);
        
        // Attach validated data to request
        (request as any).validatedBody = validatedData;
        
        return method.call(this, request, ...args);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return ApiResponseHandler.validationError(
            'Validation failed',
            error.errors
          );
        }
        throw error;
      }
    };
  };
}

// Rate limiting decorator
export function rateLimit(maxRequests: number = 10, windowMs: number = 60000) {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (request: NextRequest, ...args: any[]) {
      const ip = request.headers.get('x-forwarded-for') || 'unknown';
      const now = Date.now();
      const windowStart = now - windowMs;
      
      // Clean old entries
      for (const [key, value] of requests.entries()) {
        if (value.resetTime < windowStart) {
          requests.delete(key);
        }
      }
      
      const current = requests.get(ip) || { count: 0, resetTime: now + windowMs };
      
      if (current.count >= maxRequests && current.resetTime > now) {
        return ApiResponseHandler.error(
          'RATE_LIMIT_EXCEEDED',
          'Too many requests',
          429
        );
      }
      
      current.count++;
      requests.set(ip, current);
      
      return method.call(this, request, ...args);
    };
  };
}

// Auth middleware
export function requireAuth() {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (request: NextRequest, ...args: any[]) {
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return ApiResponseHandler.authError();
      }
      
      // Add token validation logic here
      const token = authHeader.substring(7);
      // Validate token with Supabase or your auth system
      
      return method.call(this, request, ...args);
    };
  };
}