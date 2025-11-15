"use client";

export type ImageFailureType = 
  | 'invalid_url'
  | 'network_error'
  | 'fallback_trigger'
  | 'retry_exhausted'
  | 'load_timeout'
  | 'cors_error'
  | 'not_found'
  | 'server_error'
  | 'unknown_error';

export interface ImageFailureLog {
  id: string;
  timestamp: string;
  failureType: ImageFailureType;
  originalUrl: string;
  fallbackUrl?: string;
  componentName: string;
  errorMessage?: string;
  userAgent: string;
  retryCount: number;
  loadTime?: number;
  httpStatus?: number;
  metadata?: {
    productId?: string;
    productName?: string;
    userId?: string;
    sessionId?: string;
    pageUrl?: string;
    componentProps?: Record<string, any>;
  };
}

export class ImageFailureLogger {
  private logs: ImageFailureLog[] = [];
  private maxLogs = 1000; // Keep only the last 1000 logs in memory
  private isEnabled = true;
  private listeners: Array<(log: ImageFailureLog) => void> = [];

  constructor() {
    // Initialize with environment-based configuration
    this.isEnabled = process.env.NODE_ENV === 'development' || 
                    process.env.NEXT_PUBLIC_ENABLE_IMAGE_LOGGING === 'true';
    
    // Setup periodic log cleanup
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanup(), 60000); // Cleanup every minute
    }
  }

  /**
   * Log an image failure with comprehensive details
   */
  logFailure(failure: Omit<ImageFailureLog, 'id' | 'timestamp' | 'userAgent'>): void {
    if (!this.isEnabled) return;

    const log: ImageFailureLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      ...failure,
    };

    this.logs.push(log);
    
    // Notify listeners
    this.listeners.forEach(listener => listener(log));
    
    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🖼️ Image Failure: ${failure.failureType}`);
      if (failure.metadata) {
      }
      console.groupEnd();
    }

    // Send to external logging service if configured
    this.sendToExternalService(log);
    
    // Keep logs within limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  /**
   * Get all logs with optional filtering
   */
  getLogs(filter?: {
    failureType?: ImageFailureType;
    componentName?: string;
    since?: string;
    limit?: number;
  }): ImageFailureLog[] {
    let filteredLogs = this.logs;

    if (filter?.failureType) {
      filteredLogs = filteredLogs.filter(log => log.failureType === filter.failureType);
    }

    if (filter?.componentName) {
      filteredLogs = filteredLogs.filter(log => log.componentName === filter.componentName);
    }

    if (filter?.since) {
      const sinceDate = new Date(filter.since);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= sinceDate);
    }

    if (filter?.limit) {
      filteredLogs = filteredLogs.slice(-filter.limit);
    }

    return filteredLogs;
  }

  /**
   * Get failure statistics
   */
  getStats(): {
    totalFailures: number;
    failuresByType: Record<ImageFailureType, number>;
    failuresByComponent: Record<string, number>;
    averageRetryCount: number;
    recentFailures: number; // Last hour
  } {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentLogs = this.logs.filter(log => new Date(log.timestamp) >= oneHourAgo);

    const failuresByType = this.logs.reduce((acc, log) => {
      acc[log.failureType] = (acc[log.failureType] || 0) + 1;
      return acc;
    }, {} as Record<ImageFailureType, number>);

    const failuresByComponent = this.logs.reduce((acc, log) => {
      acc[log.componentName] = (acc[log.componentName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageRetryCount = this.logs.length > 0 
      ? this.logs.reduce((sum, log) => sum + log.retryCount, 0) / this.logs.length 
      : 0;

    return {
      totalFailures: this.logs.length,
      failuresByType,
      failuresByComponent,
      averageRetryCount,
      recentFailures: recentLogs.length,
    };
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Add a listener for new failure logs
   */
  onFailure(listener: (log: ImageFailureLog) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Helper method to categorize HTTP errors
   */
  categorizeHttpError(status: number): ImageFailureType {
    if (status === 404) return 'not_found';
    if (status >= 500) return 'server_error';
    if (status === 403 || status === 401) return 'cors_error';
    return 'network_error';
  }

  /**
   * Helper method to validate image URLs
   */
  validateImageUrl(url: string): { isValid: boolean; reason?: string } {
    if (!url) {
      return { isValid: false, reason: 'Empty URL' };
    }

    // Check for valid URL format
    try {
      const urlObj = new URL(url);
      if (!['http:', 'https:', 'data:'].includes(urlObj.protocol)) {
        return { isValid: false, reason: 'Invalid protocol' };
      }
    } catch {
      // If not a valid URL, check if it's a relative path
      if (!url.startsWith('/')) {
        return { isValid: false, reason: 'Invalid URL format' };
      }
    }

    // Check for common image extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg'];
    const hasImageExtension = imageExtensions.some(ext => 
      url.toLowerCase().includes(ext)
    );

    // Check for data URLs or common image paths
    const isDataUrl = url.startsWith('data:image/');
    const isImagePath = url.includes('/images/') || url.includes('/img/') || 
                       url.includes('placeholder') || url.includes('fallback');

    if (!hasImageExtension && !isDataUrl && !isImagePath) {
      return { isValid: false, reason: 'No image extension or data URL' };
    }

    return { isValid: true };
  }

  private generateId(): string {
    return `img_fail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private cleanup(): void {
    // Remove logs older than 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.logs = this.logs.filter(log => new Date(log.timestamp) >= oneDayAgo);
  }

  private async sendToExternalService(log: ImageFailureLog): Promise<void> {
    // Only send to external service in production or when explicitly enabled
    if (process.env.NODE_ENV !== 'production' && 
        process.env.NEXT_PUBLIC_EXTERNAL_LOGGING !== 'true') {
      return;
    }

    try {
      // You can replace this with your preferred logging service
      // Examples: Sentry, LogRocket, DataDog, etc.
      
      // Example for a generic logging endpoint
      const loggingEndpoint = process.env.NEXT_PUBLIC_LOGGING_ENDPOINT;
      if (loggingEndpoint) {
        await fetch(loggingEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            level: 'error',
            message: 'Image Loading Failure',
            data: log,
          }),
        });
      }
    } catch (error) {
      console.warn('Failed to send log to external service:', error);
    }
  }
}

// Global instance
export const imageFailureLogger = new ImageFailureLogger();

// Helper function to create failure logs with common metadata
export function createImageFailureLog(
  failureType: ImageFailureType,
  originalUrl: string,
  componentName: string,
  options: {
    errorMessage?: string;
    fallbackUrl?: string;
    retryCount?: number;
    loadTime?: number;
    httpStatus?: number;
    metadata?: ImageFailureLog['metadata'];
  } = {}
): Omit<ImageFailureLog, 'id' | 'timestamp' | 'userAgent'> {
  return {
    failureType,
    originalUrl,
    componentName,
    errorMessage: options.errorMessage || `Image failed to load: ${failureType}`,
    fallbackUrl: options.fallbackUrl,
    retryCount: options.retryCount || 0,
    loadTime: options.loadTime,
    httpStatus: options.httpStatus,
    metadata: {
      pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
      sessionId: typeof window !== 'undefined' ? 
        sessionStorage.getItem('sessionId') || 'unknown' : 'server',
      ...options.metadata,
    },
  };
}

// Hook for React components to easily use the logger
export function useImageFailureLogger() {
  return {
    logFailure: (failure: Omit<ImageFailureLog, 'id' | 'timestamp' | 'userAgent'>) => 
      imageFailureLogger.logFailure(failure),
    getLogs: (filter?: Parameters<typeof imageFailureLogger.getLogs>[0]) => 
      imageFailureLogger.getLogs(filter),
    getStats: () => imageFailureLogger.getStats(),
    clearLogs: () => imageFailureLogger.clearLogs(),
    exportLogs: () => imageFailureLogger.exportLogs(),
    onFailure: (listener: (log: ImageFailureLog) => void) => 
      imageFailureLogger.onFailure(listener),
  };
}
