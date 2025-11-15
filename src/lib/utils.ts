import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClientComponentClient } from "./supabase";
import type { SupabaseClient } from '@supabase/supabase-js';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a price as a string with the Turkish Lira symbol
 * @param price - The price to format
 * @returns Formatted price string
 */
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) {
    return "₺0.00";
  }
  return `₺${price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Calculates the discount percentage between two prices
 * @param originalPrice - The original price
 * @param discountedPrice - The discounted price
 * @returns Discount percentage as a whole number
 */
export function calculateDiscountPercentage(
  originalPrice: number,
  discountedPrice: number
): number {
  if (originalPrice <= 0 || discountedPrice >= originalPrice) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}

/**
 * Generates a URL-friendly slug from a string
 * @param text - The text to convert to a slug
 * @returns URL-friendly slug
 */
export function generateSlug(name: string): string {
  return name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

/**
 * Generates a unique slug by appending a random suffix if needed
 * @param text - The base text to generate a slug from
 * @param existingSlug - Optional slug to make unique
 * @returns A unique slug with a random string appended if needed
 */
export async function generateUniqueSlug(supabase: any, name: string, existingId?: string): Promise<string> {
  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let counter = 1;
  let isUnique = false;

  while (!isUnique) {
    const query = supabase.from('products').select('id').eq('slug', slug);

    // If we're updating an existing product, exclude it from the check
    if (existingId) {
      query.neq('id', existingId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    if (data.length === 0) {
      isUnique = true;
    } else {
      // If slug exists, append a counter
      slug = `${baseSlug}-${counter}-${Math.floor(Math.random() * 1000000).toString(36)}`;
      counter++;
    }
  }

  return slug;
}

/**
 * Generates a unique SKU by appending a random suffix
 * @param baseSku - The base SKU to make unique
 * @returns A unique SKU with a random string appended
 */
export async function generateUniqueSku(supabase: any, baseSku: string, existingId?: string): Promise<string> {
  let sku = baseSku;
  let counter = 1;
  let isUnique = false;

  while (!isUnique) {
    const query = supabase.from('products').select('id').eq('sku', sku);

    // If we're updating an existing product, exclude it from the check
    if (existingId) {
      query.neq('id', existingId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    if (data.length === 0) {
      isUnique = true;
    } else {
      // If SKU exists, append a counter
      sku = `${baseSku}-${counter}`;
      counter++;
    }
  }

  return sku;
}

/**
 * Normalizes a slug for comparison
 * @param slug - The slug to normalize
 * @returns Normalized slug
 */
export function normalizeSlug(slug: string): string {
  return slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/**
 * Inserts a record into the admin_logs table
 */
export async function logAdminAction(supabase: any, userId: string, action: string, entity: string, entityId: string | null, details: any = {}) {
  try {
    // Check if admin_logs table exists first
    const { data: tableCheck, error: tableError } = await supabase
      .from('admin_logs')
      .select('id')
      .limit(1);

    // If table doesn't exist, skip logging silently
    if (tableError && tableError.code === '42P01') {
      
      return;
    }

    // Insert the log entry
    const { data, error } = await supabase.from('admin_logs').insert({
      admin_id: userId,
      action,
      entity,
      entity_id: entityId,
      details: details || {}
    });

    if (error) {
      // Log the specific error for debugging
      console.warn('Admin action logging failed:', {
        error: error.message || error,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
    } else {
    }
  } catch (error: any) {
    console.warn('Admin action logging failed (catch):', {
      error: error.message || error,
      action,
      entity,
      entityId
    });
  }
}

// Supabase Storage URL'lerini imzalı URL'lere dönüştürme fonksiyonu
export function getSignedImageUrl(url: string | null | undefined, supabase: SupabaseClient): string {
    if (!url) return '/images/placeholder.png';

    // Sadece Supabase'den alınmış resim URL'leriyle çalış
    if (url.includes('supabase') && url.includes('storage')) {
        // Supabase storage URL'lerini imzalı yap
        const publicURL = supabase.storage.from('your_bucket').getPublicUrl(url);
        return publicURL.data.publicUrl;
    }

    return url;
}
