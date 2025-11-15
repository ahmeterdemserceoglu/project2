import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ApiResponseBuilder {
  static success<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
    return NextResponse.json({
      success: true,
      data,
      message
    });
  }

  static error(
    error: string, 
    status: number = 400, 
    details?: any
  ): NextResponse<ApiResponse> {
    return NextResponse.json({
      success: false,
      error,
      ...(details && { details })
    }, { status });
  }

  static unauthorized(message: string = 'Unauthorized'): NextResponse<ApiResponse> {
    return this.error(message, 401);
  }

  static forbidden(message: string = 'Forbidden'): NextResponse<ApiResponse> {
    return this.error(message, 403);
  }

  static notFound(message: string = 'Not found'): NextResponse<ApiResponse> {
    return this.error(message, 404);
  }

  static methodNotAllowed(): NextResponse<ApiResponse> {
    return this.error('Method not allowed', 405);
  }

  static tooManyRequests(message: string = 'Too many requests'): NextResponse<ApiResponse> {
    return this.error(message, 429);
  }

  static internalError(message: string = 'Internal server error'): NextResponse<ApiResponse> {
    return this.error(message, 500);
  }
}

// Middleware wrapper for consistent error handling
export function withErrorHandling(
  handler: (request: Request, context?: any) => Promise<NextResponse>
) {
  return async (request: Request, context?: any): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error: any) {
      console.error('API Error:', error);
      return ApiResponseBuilder.internalError(
        process.env.NODE_ENV === 'development' ? error.message : undefined
      );
    }
  };
}