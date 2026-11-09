import React from 'react';

/**
 * Resolves book cover image URLs cleanly for all environments:
 * - Vercel production deployments
 * - Local Vite development
 * - Cloud Run / Vite Preview
 * - Backward compatibility with existing Firestore records containing /src/assets/images/...
 */
export function getBookCoverUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // If already an absolute remote URL or data URI, keep as-is
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  // Extract the filename (e.g., "cover_1984_george_orwell_1793962875863.jpg")
  const parts = trimmed.split('/');
  const filename = parts[parts.length - 1];

  if (
    filename &&
    (filename.endsWith('.jpg') ||
      filename.endsWith('.png') ||
      filename.endsWith('.webp') ||
      filename.endsWith('.jpeg'))
  ) {
    // Canonical public path served in root on Vercel, Netlify, and Vite
    return `/covers/${filename}`;
  }

  return trimmed;
}

export function handleCoverImageError(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  const img = e.currentTarget;
  // If the image fails to load, hide cleanly to let the stylized gradient and title show
  img.style.display = 'none';
}
