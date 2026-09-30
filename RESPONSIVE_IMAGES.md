# Responsive Image Implementation Guide

## Overview
This document outlines the responsive image handling implemented for the wedding website to ensure optimal display across all devices (mobile, tablet, desktop).

## Components

### 1. ResponsiveImage Component
**Location:** `src/components/ResponsiveImage.tsx`

Used for standard image display with lazy loading and proper optimization.

**Features:**
- Automatic lazy loading for performance
- Support for priority images (hero images load eagerly)
- Object-fit support for different layout needs
- Proper alt text for accessibility
- Referrer policy for security

**Usage:**
```tsx
<ResponsiveImage
  src={imageUrl}
  alt="Description"
  className="w-full h-auto"
  priority={true}  // Only for hero/critical images
  objectFit="cover"
/>
```

### 2. ResponsiveGalleryImage Component
**Optimized for gallery layouts**

Used specifically for photo gallery columns to maintain proper aspect ratios.

**Features:**
- Optimized for column-based layouts
- Smooth transitions
- Lazy loading enabled by default

**Usage:**
```tsx
<ResponsiveGalleryImage
  src={imageUrl}
  alt="Gallery image"
  className="w-full h-auto object-cover transition-transform"
/>
```

### 3. ResponsivePicture Component
**For device-specific image sources**

Use when you have different optimized images for different devices.

**Features:**
- Mobile: 0px to 640px
- Tablet: 641px to 1024px
- Desktop: 1025px and above

**Usage:**
```tsx
<ResponsivePicture
  mobileSrc={mobileImageUrl}
  tabletSrc={tabletImageUrl}
  desktopSrc={desktopImageUrl}
  alt="Description"
/>
```

## CSS Breakpoints

### Mobile (0px - 640px)
- Single column layouts
- Maximum width: 100vw
- Compensated padding for full-width images

### Tablet (641px - 1024px)
- Two column layouts where applicable
- Optimized spacing

### Desktop (1025px and above)
- Three+ column layouts
- Full image optimization

## Responsive Classes Used

### Height Scaling
Images use responsive height classes:
```
- h-[300px] @ mobile
- sm:h-[400px] @ tablet
- md:h-[500px] @ tablet+
- lg:h-[700px] @ desktop
```

### Width Handling
- Hero image: Full width, full height
- Story image: 100% width with responsive height
- Gallery images: Column-based layout (1-3 columns)
- QR codes: Responsive sizing (48px to 64px base)

## Updated Sections

### 1. Hero Section
- **Change:** Added `priority={true}` for eager loading
- **Benefit:** Faster LCP (Largest Contentful Paint)

### 2. Our Story Section
- **Change:** Added responsive heights for different breakpoints
- **Benefit:** Better aspect ratio management on mobile/tablet

### 3. Photo Gallery
- **Change:** Replaced img with ResponsiveGalleryImage
- **Benefit:** Optimized for column layouts across devices

### 4. Gifts Section (QR Codes)
- **Change:** Added responsive sizing for QR codes
- **Before:** Fixed w-64 h-64
- **After:** w-48 sm:w-56 md:w-64 (and heights)
- **Benefit:** QR codes properly sized on mobile for easy scanning

## Performance Optimizations

### Lazy Loading
- All images except hero use `loading="lazy"`
- Improves initial page load time
- Images load as user scrolls

### Decoding Strategy
- Hero/priority images: `decoding="sync"`
- Gallery/secondary images: `decoding="async"`
- Prevents layout shift and improves perceived performance

### Referrer Policy
- Set to `"no-referrer"` for privacy
- Prevents referrer leakage to external servers

## Mobile-First Responsive Design

The implementation follows mobile-first principles:
1. Base styles optimized for mobile
2. Media queries enhance for tablet (641px)
3. Further optimization for desktop (1025px+)

## Testing Checklist

- [ ] Test hero image loading on 3G connection
- [ ] Verify gallery images responsive on mobile portrait
- [ ] Check QR code sizing on mobile (should be scannable)
- [ ] Test on tablet landscape orientation
- [ ] Verify desktop 3-column gallery layout
- [ ] Check for layout shifts during image loading
- [ ] Test lazy loading with slow network
- [ ] Verify aspect ratios maintained on all breakpoints
- [ ] Check hover effects on touch devices (should not interfere)
- [ ] Test with actual high-resolution images

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Fallback for picture element in older browsers (uses desktop src)
- Lazy loading supported in all modern browsers

## Future Improvements

1. **WebP Format Support:**
   Add WebP images for better compression:
   ```tsx
   <ResponsivePicture
     mobileSrc={mobileSrc}
     tabletSrc={tabletSrc}
     desktopSrc={desktopSrc}
     webpMobileSrc={webpMobileSrc}  // Add WebP variants
     // ...
   />
   ```

2. **Image Optimization Service:**
   - Consider using image optimization APIs (ImageKit, Cloudinary)
   - Automatic format conversion and compression

3. **Responsive Image srcset:**
   - Add high DPI image variants (1x, 2x, 3x)
   - For retina display optimization

4. **CSS Container Queries:**
   - Use for truly responsive image sizing based on container
   - Better than viewport-based breakpoints

## Resources

- [MDN: Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
- [CSS Tricks: A Guide to the Responsive Images Syntax](https://css-tricks.com/a-guide-to-the-responsive-images-syntax-in-html/)
- [Web Vitals: LCP (Largest Contentful Paint)](https://web.dev/lcp/)
