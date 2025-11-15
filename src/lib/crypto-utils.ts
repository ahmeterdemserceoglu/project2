// Environment-agnostic crypto utilities
import { createHash, randomBytes, timingSafeEqual } from 'crypto';

// Server-side crypto utilities
export const serverCrypto = {
  generateSecureToken: (length: number = 32): string => {
    return randomBytes(length).toString('hex');
  },

  createHash: (data: string, algorithm: string = 'sha256'): string => {
    return createHash(algorithm).update(data).digest('hex');
  },

  timingSafeEqual: (a: string, b: string): boolean => {
    const bufferA = Buffer.from(a);
    const bufferB = Buffer.from(b);
    return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
  }
};

// Client-side crypto utilities
export const clientCrypto = {
  generateSecureToken: (length: number = 32): string => {
    if (typeof window === 'undefined') {
      throw new Error('Client crypto functions can only be used in browser environment');
    }
    
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  createHash: async (data: string): Promise<string> => {
    if (typeof window === 'undefined') {
      throw new Error('Client crypto functions can only be used in browser environment');
    }
    
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
};

// Universal crypto utilities that work in both environments
export const universalCrypto = {
  generateSecureToken: (length: number = 32): string => {
    if (typeof window === 'undefined') {
      return serverCrypto.generateSecureToken(length);
    }
    return clientCrypto.generateSecureToken(length);
  }
};