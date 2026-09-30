# Quick Reference: Responsive Images

## Key Breakpoints
- **Mobile:** 0px - 640px
- **Tablet:** 641px - 1024px  
- **Desktop:** 1025px+

## When to Use Each Component

### ResponsiveImage
Best for: General images, hero images, story images
```tsx
<ResponsiveImage
  src={imageUrl}
  alt="Description"
  priority={true}  // Only for above-the-fold images
/>
```

### ResponsiveGalleryImage
Best for: Gallery/grid layouts
```tsx
<ResponsiveGalleryImage
  src={imageUrl}
  alt="Gallery image"
/>
```

### ResponsivePicture
Best for: Different images per device
```tsx
<ResponsivePicture
  mobileSrc={mobileUrl}
  tabletSrc={tabletUrl}
  desktopSrc={desktopUrl}
  alt="Description"
/>
```

## Image Sizing Examples

### Hero Image (Full Screen)
```tsx
<ResponsiveImage
  className="w-full h-full"
  objectFit="cover"
  priority
/>
```

### Story/About Image (Responsive Height)
```tsx
<ResponsiveImage
  className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[700px]"
  objectFit="cover"
/>
```

### QR Code (Small, Responsive)
```tsx
<ResponsiveImage
  className="w-48 sm:w-56 md:w-64 h-48 sm:h-56 md:h-64"
  objectFit="contain"
/>
```

## CSS Classes Reference

### Height Classes (Tailwind)
- `h-[300px]` = 300px (mobile)
- `sm:h-[400px]` = 400px (tablet)
- `md:h-[500px]` = 500px (tablet+)
- `lg:h-[700px]` = 700px (desktop)

### Width Classes (Tailwind)
- `w-full` = 100% width
- `w-48` = 12rem (mobile)
- `sm:w-56` = 14rem (tablet)
- `md:w-64` = 16rem (desktop)

## Performance Tips

1. **Use `priority={true}` ONLY for:**
   - Hero images above the fold
   - Critical images users see immediately

2. **All other images should:**
   - Use lazy loading (default)
   - Use async decoding (default)

3. **For galleries:**
   - Use ResponsiveGalleryImage for column layouts
   - Maintain consistent aspect ratios

## Common Issues & Solutions

### Issue: Image looks blurry on mobile
**Solution:** Ensure image dimensions are set for each breakpoint

### Issue: QR code too small to scan on mobile
**Solution:** Use responsive sizing: `w-48 sm:w-56 md:w-64`

### Issue: Layout shift when images load
**Solution:** Set explicit height values on container

### Issue: Hero image takes too long to load
**Solution:** Add `priority={true}` to ResponsiveImage component

## Files Modified
- `src/App.tsx` - Updated all image usage
- `src/components/ResponsiveImage.tsx` - New component file
- `src/index.css` - Added responsive image styles
