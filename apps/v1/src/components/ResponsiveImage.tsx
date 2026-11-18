import React, { useCallback, useState } from 'react';
import type { ResponsiveImageSource } from '../config';

type ObjectFit = 'cover' | 'contain' | 'fill' | 'scale-down';

/**
 * Tracks whether an <img> has finished loading so we can show a soft shimmer
 * skeleton until then. Also handles images that were already cached before
 * React attached its listeners.
 */
const useImageLoaded = () => {
  const [loaded, setLoaded] = useState(false);
  const ref = useCallback((image: HTMLImageElement | null) => {
    if (image?.complete && image.naturalWidth > 0) setLoaded(true);
  }, []);
  const markLoaded = useCallback(() => setLoaded(true), []);
  return { ref, loaded, markLoaded };
};

const skeletonClass = (loaded: boolean) => `img-skeleton${loaded ? ' is-loaded' : ''}`;

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  objectFit?: ObjectFit;
  sizes?: string;
  aspectRatio?: string; // e.g., '16/9', '4/3', '3/4'
  referrerPolicy?: React.ImgHTMLAttributes<HTMLImageElement>['referrerPolicy'];
}

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
  const { ref, loaded, markLoaded } = useImageLoaded();
  const style: React.CSSProperties = { objectFit };
  if (aspectRatio) style.aspectRatio = aspectRatio;

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={`responsive-image ${skeletonClass(loaded)} ${className}`}
      style={style}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy={referrerPolicy}
      sizes={sizes}
      onLoad={markLoaded}
      onError={markLoaded}
    />
  );
};

interface ResponsivePictureProps {
  mobileSrc: ResponsiveImageSource;
  tabletSrc: ResponsiveImageSource;
  desktopSrc: ResponsiveImageSource;
  alt: string;
  className?: string;
  objectFit?: ObjectFit;
  priority?: boolean;
  referrerPolicy?: React.ImgHTMLAttributes<HTMLImageElement>['referrerPolicy'];
}

/**
 * Uses <picture> for device-specific hero sources. Only formats that actually
 * exist are emitted, so the browser never evaluates empty <source> elements.
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
  const breakpoints = [
    { media: '(max-width: 640px)', source: mobileSrc },
    { media: '(max-width: 1024px)', source: tabletSrc },
    { media: '(min-width: 1025px)', source: desktopSrc },
  ];

  return (
    <div className="responsive-picture">
      <picture className="relative z-10 block h-full w-full">
        {breakpoints.flatMap(({ media, source }) => [
          source.avif ? <source key={`${media}-avif`} media={media} srcSet={source.avif} type="image/avif" /> : null,
          source.webp ? <source key={`${media}-webp`} media={media} srcSet={source.webp} type="image/webp" /> : null,
          <source key={`${media}-fallback`} media={media} srcSet={source.fallback} />,
        ])}
        <img
          src={desktopSrc.fallback}
          alt={alt}
          className={`responsive-image ${className}`}
          style={{ objectFit }}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
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

export const ResponsiveGalleryImage: React.FC<ResponsiveGalleryImageProps> = ({
  src,
  alt,
  className = 'w-full h-auto object-cover',
  containerClassName = '',
  referrerPolicy = 'no-referrer',
}) => {
  const { ref, loaded, markLoaded } = useImageLoaded();

  return (
    <div className={`responsive-image-container ${containerClassName}`}>
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={`responsive-gallery-image ${skeletonClass(loaded)} ${className}`}
        loading="lazy"
        decoding="async"
        referrerPolicy={referrerPolicy}
        draggable={false}
        onLoad={markLoaded}
        onError={markLoaded}
      />
    </div>
  );
};
