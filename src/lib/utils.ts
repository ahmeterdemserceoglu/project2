import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a price as a string with the Turkish Lira symbol
 * @param price - The price to format
 * @returns Formatted price string
 */
export function formatPrice(price: number): string {
  return `₺${price.toFixed(2)}`;
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
export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[üÜ]/g, 'u')          // Handle Turkish characters
    .replace(/[şŞ]/g, 's')
    .replace(/[ıİ]/g, 'i')
    .replace(/[öÖ]/g, 'o')
    .replace(/[çÇ]/g, 'c')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

/**
 * Generates a unique slug by appending a random suffix if needed
 * @param text - The base text to generate a slug from
 * @param existingSlug - Optional slug to make unique
 * @returns A unique slug with a random string appended if needed
 */
export function generateUniqueSlug(text: string, existingSlug?: string): string {
  const baseSlug = existingSlug || generateSlug(text);
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const randomString = Math.random().toString(36).substring(2, 6);
  return `${baseSlug}-${timestamp}-${randomString}`;
}

/**
 * Generates a unique SKU by appending a random suffix
 * @param baseSku - The base SKU to make unique
 * @returns A unique SKU with a random string appended
 */
export function generateUniqueSku(baseSku: string): string {
  const randomString = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${baseSku}-${randomString}`;
}

/**
 * Normalizes a slug for comparison
 * @param slug - The slug to normalize
 * @returns Normalized slug
 */
export function normalizeSlug(slug: string): string {
  return slug.toLowerCase().trim();
} 