import React from "react";

export const FALLBACK_PRODUCT_IMAGE = "/images/hero_prime_meat.jpg";
export const FALLBACK_CATEGORY_IMAGE = "/images/cat_chicken.jpg";

/**
 * Normalizes image URLs: handles null/undefined, ensures valid path format.
 */
export function getProductImageUrl(url?: string | null): string {
  if (!url || typeof url !== "string" || !url.trim()) {
    return FALLBACK_PRODUCT_IMAGE;
  }
  const trimmed = url.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }
  if (!trimmed.startsWith("/")) {
    return `/${trimmed}`;
  }
  return trimmed;
}

/**
 * Safely handles image loading errors by replacing the source with a verified fallback image.
 * Nullifies onerror immediately to prevent potential infinite loops.
 */
export function handleProductImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackSrc: string = FALLBACK_PRODUCT_IMAGE
) {
  const target = e.currentTarget;
  if (!target) return;
  target.onerror = null; // Prevent infinite error loops
  target.src = fallbackSrc;
}

/**
 * Normalizes category image URLs.
 */
export function getCategoryImageUrl(url?: string | null): string {
  if (!url || typeof url !== "string" || !url.trim()) {
    return FALLBACK_CATEGORY_IMAGE;
  }
  const trimmed = url.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }
  if (!trimmed.startsWith("/")) {
    return `/${trimmed}`;
  }
  return trimmed;
}

/**
 * Handles category image loading errors.
 */
export function handleCategoryImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackSrc: string = FALLBACK_CATEGORY_IMAGE
) {
  const target = e.currentTarget;
  if (!target) return;
  target.onerror = null;
  target.src = fallbackSrc;
}
