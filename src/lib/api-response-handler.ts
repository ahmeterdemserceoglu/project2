import { NextResponse } from 'next/server';
import { addSecurityHeaders } from './security';

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

export class ApiResponseHandler {
  static success<T>(data: T, status: number = 200): NextResponse {
    const response = NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    } as ApiResponse<T>, { status });
    
    addSecurityHeaders(response);
    return response;
  }

  static error(
    code: string,
    message: string,
    status: number = 400,
    details?: any
  ): NextResponse {
    const response = NextResponse.json({
      success: false,
      error: { code, message, details },
      timestamp: new Date().toISOString(),
    } as ApiResponse, { status });
    
    addSecurityHeaders(response);
    return response;
  }

  static validationError(message: string, details?: any): NextResponse {
    return this.error('VALIDATION_ERROR', message, 400, details);
  }

  static authError(message: string = 'Authentication required'): NextResponse {
    return this.error('AUTH_ERROR', message, 401);
  }

  static forbiddenError(message: string = 'Access forbidden'): NextResponse {
    return this.error('FORBIDDEN', message, 403);
  }

  static notFoundError(message: string = 'Resource not found'): NextResponse {
    return this.error('NOT_FOUND', message, 404);
  }

  static serverError(message: string = 'Internal server error', details?: any): NextResponse {
    // Log server errors
    
    return this.error('SERVER_ERROR', message, 500, details);
  }

  static methodNotAllowed(): NextResponse {
    return this.error('METHOD_NOT_ALLOWED', 'Method not allowed', 405);
  }
}

// Wrapper for API route handlers
export function withApiHandler(handler: Function) {
  return async (request: Request, context?: any) => {
    try {
      return await handler(request, context);
    } catch (error: any) {
      
      return ApiResponseHandler.serverError(
        'An unexpected error occurred',
        process.env.NODE_ENV === 'development' ? error.message : undefined
      );
    }
  };
}