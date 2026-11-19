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

/** Widths allowed by `images.sizes` in vercel.json. */
const IMAGE_WIDTHS = [480, 960, 1600] as const;
export type ImageWidth = (typeof IMAGE_WIDTHS)[number];

/**
 * Vercel Image Optimization resizes and converts to AVIF/WebP on the fly, so the
 * 1-1.6 MB originals are never sent to phones. Only on deployed builds: `vite dev`
 * and `vite preview` have no /_vercel/image endpoint.
 */
const useOptimizer = import.meta.env.PROD && !/^(localhost|127\.|192\.168\.|10\.)/.test(window.location.hostname);

/** Must match `images.localPatterns` / `remotePatterns` in vercel.json. */
const canOptimize = (url: string) =>
  useOptimizer && (url.startsWith('/data/') || /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/wedding\//.test(url));

export const optimizedSrc = (url: string, width: ImageWidth) =>
  canOptimize(url) ? `/_vercel/image?url=${encodeURIComponent(url)}&w=${width}&q=75` : url;

export const optimizedSrcSet = (url: string) =>
  canOptimize(url) ? IMAGE_WIDTHS.map((width) => `${optimizedSrc(url, width)} ${width}w`).join(', ') : undefined;

/** If the optimizer ever fails, fall back to the original file once. */
const fallBackToOriginal = (original: string) => (event: React.SyntheticEvent<HTMLImageElement>) => {
  const image = event.currentTarget;
  if (image.dataset.fallback || !canOptimize(original)) return;
  image.dataset.fallback = '1';
  image.removeAttribute('srcset');
  image.src = original;
};

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  objectFit?: ObjectFit;
  sizes?: string;
  aspectRatio?: string; // e.g., '16/9', '4/3', '3/4'
  /** Set false to always serve the original file (e.g. QR codes guests save). */
  optimize?: boolean;
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
  optimize = true,
  referrerPolicy = 'no-referrer',
}) => {
  const { ref, loaded, markLoaded } = useImageLoaded();
  const style: React.CSSProperties = { objectFit };
  if (aspectRatio) style.aspectRatio = aspectRatio;

  return (
    <img
      ref={ref}
      src={optimize ? optimizedSrc(src, 960) : src}
      srcSet={optimize ? optimizedSrcSet(src) : undefined}
      sizes={optimize ? sizes ?? '(max-width: 768px) 100vw, 50vw' : undefined}
      alt={alt}
      className={`responsive-image ${skeletonClass(loaded)} ${className}`}
      style={style}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy={referrerPolicy}
      onLoad={markLoaded}
      onError={(event) => {
        fallBackToOriginal(src)(event);
        markLoaded();
      }}
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
  sizes?: string;
  referrerPolicy?: React.ImgHTMLAttributes<HTMLImageElement>['referrerPolicy'];
}

export const ResponsiveGalleryImage: React.FC<ResponsiveGalleryImageProps> = ({
  src,
  alt,
  className = 'w-full h-auto object-cover',
  containerClassName = '',
  sizes = '(max-width: 640px) 50vw, 360px',
  referrerPolicy = 'no-referrer',
}) => {
  const { ref, loaded, markLoaded } = useImageLoaded();

  return (
    <div className={`responsive-image-container ${containerClassName}`}>
      <img
        ref={ref}
        src={optimizedSrc(src, 480)}
        srcSet={optimizedSrcSet(src)}
        sizes={sizes}
        alt={alt}
        className={`responsive-gallery-image ${skeletonClass(loaded)} ${className}`}
        loading="lazy"
        decoding="async"
        referrerPolicy={referrerPolicy}
        draggable={false}
        onLoad={markLoaded}
        onError={(event) => {
          fallBackToOriginal(src)(event);
          markLoaded();
        }}
      />
    </div>
  );
};
