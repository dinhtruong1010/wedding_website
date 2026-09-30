import React from 'react';

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
  mobileSrc: string;
  tabletSrc: string;
  desktopSrc: string;
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
    <picture>
      {/* Mobile: 0px to 640px */}
      <source media="(max-width: 640px)" srcSet={mobileSrc} />
      {/* Tablet: 641px to 1024px */}
      <source media="(max-width: 1024px)" srcSet={tabletSrc} />
      {/* Desktop: 1025px and above */}
      <source media="(min-width: 1025px)" srcSet={desktopSrc} />
      {/* Fallback */}
      <img
        src={desktopSrc}
        alt={alt}
        className={`responsive-image ${className}`}
        style={{ objectFit }}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        referrerPolicy={referrerPolicy}
      />
    </picture>
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
