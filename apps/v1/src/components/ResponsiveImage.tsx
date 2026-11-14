import React from 'react';
import type { ResponsiveImageSource } from '../config';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  sizes?: string;
  aspectRatio?: string; // e.g., '16/9', '4/3', '3/4'
  referrerPolicy?: React.ImgHTMLAttributes<HTMLImageElement>['referrerPolicy'];
}

/**
 * ResponsiveImage Component
 * Handles responsive image display for multi-device compatibility
 * - Automatically optimizes images for different screen sizes
 * - Uses CSS-based size optimization with media queries
 * - Provides fallback for older browsers
 */
export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className = '',
  priority = false,
  objectFit = 'cover',
  sizes,
  aspectRatio,
  referrerPolicy = 'no-referrer',
}) => {
  const style: React.CSSProperties = { objectFit };
  if (aspectRatio) {
    style.aspectRatio = aspectRatio;
  }
  
  return (
    <img
      src={src}
      alt={alt}
      className={`responsive-image ${className}`}
      style={style}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      referrerPolicy={referrerPolicy}
      sizes={sizes}
    />
  );
};

interface ResponsivePictureProps {
  mobileSrc: ResponsiveImageSource;
  tabletSrc: ResponsiveImageSource;
  desktopSrc: ResponsiveImageSource;
  alt: string;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  priority?: boolean;
  referrerPolicy?: React.ImgHTMLAttributes<HTMLImageElement>['referrerPolicy'];
}

/**
 * ResponsivePicture Component
 * Uses HTML5 <picture> element for device-specific image sources
 * - Mobile: optimized for small screens
 * - Tablet: optimized for medium screens
 * - Desktop: optimized for large screens
 */
export const ResponsivePicture: React.FC<ResponsivePictureProps> = ({
  mobileSrc,
  tabletSrc,
  desktopSrc,
  alt,
  className = '',
  objectFit = 'cover',
  priority = false,
  referrerPolicy = 'no-referrer',
}) => {
  return (
    <div className="responsive-picture">
      <picture className="relative z-10 block h-full w-full">
      <source media="(max-width: 640px)" srcSet={mobileSrc.avif} type="image/avif" />
      <source media="(max-width: 640px)" srcSet={mobileSrc.webp} type="image/webp" />
      <source media="(max-width: 1024px)" srcSet={tabletSrc.avif} type="image/avif" />
      <source media="(max-width: 1024px)" srcSet={tabletSrc.webp} type="image/webp" />
      <source media="(min-width: 1025px)" srcSet={desktopSrc.avif} type="image/avif" />
      <source media="(min-width: 1025px)" srcSet={desktopSrc.webp} type="image/webp" />
      <img
        src={desktopSrc.fallback}
        alt={alt}
        className={`responsive-image ${className}`}
        style={{ objectFit }}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        referrerPolicy={referrerPolicy}
      />
      </picture>
    </div>
  );
};

interface ResponsiveGalleryImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  referrerPolicy?: React.ImgHTMLAttributes<HTMLImageElement>['referrerPolicy'];
}

/**
 * ResponsiveGalleryImage Component
 * Optimized for gallery layouts with proper aspect ratio handling
 */
export const ResponsiveGalleryImage: React.FC<ResponsiveGalleryImageProps> = ({
  src,
  alt,
  className = 'w-full h-auto object-cover',
  containerClassName = '',
  referrerPolicy = 'no-referrer',
}) => {
  return (
    <div className={`responsive-image-container ${containerClassName}`}>
      <img
        src={src}
        alt={alt}
        className={`responsive-gallery-image ${className}`}
        loading="lazy"
        decoding="async"
        referrerPolicy={referrerPolicy}
      />
    </div>
  );
};
