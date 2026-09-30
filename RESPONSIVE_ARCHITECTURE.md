# Responsive Design Architecture

## Image Display Strategy Across Devices

```
┌─────────────────────────────────────────────────────────────┐
│               RESPONSIVE IMAGE HIERARCHY                    │
└─────────────────────────────────────────────────────────────┘

MOBILE (0px - 640px)
┌────────────────────┐
│   Hero Image       │  - Full width, optimized for 
│   h-screen         │    mobile viewport
│   priority=true    │  - Eager loading for faster LCP
└────────────────────┘
└────────────────────┐
│   Story Image      │  - Full width responsive height
│   h-[300px]        │  - h-[300px] on mobile
│   lazy loaded      │  - Responsive aspect ratio
└────────────────────┘
┌────────────────────┐
│   Gallery (1col)   │  - Single column layout
│   responsive       │  - Full width images
│   aspect ratio     │  - Lazy loaded
└────────────────────┘
┌────────────────────┐
│   QR Codes         │  - w-48 (responsive)
│   w-48 h-48        │  - Scannable size maintained
│   centered         │  - Lazy loaded
└────────────────────┘

TABLET (641px - 1024px)
┌─────────────────┬─────────────────┐
│  Story Image    │    Content      │  - Side-by-side layout
│  h-[400px]      │                 │  - h-[400px] on tablet
│  sm:h-[400px]   │                 │  - Lazy loaded
└─────────────────┴─────────────────┘
┌──────────────────────┐
│   Gallery (2col)     │  - Two column layout
│  responsive aspect   │  - Better use of space
│       ratio          │  - Lazy loaded
└──────────────────────┘
┌─────────────────┬─────────────────┐
│  Groom QR       │   Bride QR      │  - Side-by-side QR codes
│  w-56 h-56      │   w-56 h-56     │  - Easy for both to scan
└─────────────────┴─────────────────┘

DESKTOP (1025px+)
┌──────────────────────────────────────────┐
│       Hero Image (Full Screen)           │  - Optimal for large
│       h-screen priority=true             │    monitors
└──────────────────────────────────────────┘
┌──────────────────────┬──────────────────────┐
│   Story Image        │    Content           │  - Balanced layout
│   lg:h-[700px]       │                      │  - Maximum height
│   asymmetric-img     │                      │  - Lazy loaded
└──────────────────────┴──────────────────────┘
┌──────────────┬──────────────┬──────────────┐
│  Gallery     │   Gallery    │   Gallery    │  - Three column layout
│  (col 1)     │   (col 2)    │   (col 3)    │  - Optimal gallery view
│  responsive  │  responsive  │  responsive  │  - Lazy loaded
└──────────────┴──────────────┴──────────────┘
┌──────────────┬──────────────────────────────┐
│   QR Code    │     QR Code                  │  - Full width with space
│   md:w-64    │     md:w-64                  │  - Easy scanning
└──────────────┴──────────────────────────────┘
```

## Component Usage Flow

```
┌──────────────────────────────────┐
│  Choose Image Type               │
└──────────────────────────────────┘
              ↓
    ┌─────────┴─────────┬────────────┐
    ↓                   ↓            ↓
Hero/Regular      Gallery        Different
  Images           Images         per device
    ↓                   ↓            ↓
┌────────────┐  ┌──────────────┐ ┌──────────────┐
│Responsive  │  │Responsive    │ │Responsive    │
│Image       │  │Gallery       │ │Picture       │
│Component   │  │Image         │ │Component     │
└────────────┘  │Component     │ └──────────────┘
     ↓          └──────────────┘        ↓
     ↓                ↓                  ↓
  lazy or       lazy loaded        responsive
  priority    + transitions       srcset per
  loading     + smooth hover      breakpoint
     ↓                ↓                  ↓
     └────────┬───────┴──────────────────┘
              ↓
        ┌──────────────┐
        │ Rendered in  │
        │  responsive  │
        │   layout     │
        └──────────────┘
```

## Performance Optimization Timeline

```
INITIAL LOAD
├─ Hero image: priority=true (eager, sync)
│  └─ LCP starts immediately
└─ Other images: lazy loaded
   └─ Deferred until needed

WHILE SCROLLING
├─ Gallery images: lazy load as visible
├─ Story image: lazy load as visible
└─ Deferred images: async decoding

INTERACTION
└─ Gallery hover: transform animation
   (runs smoothly due to lazy loading earlier)
```

## CSS Cascade for Responsive Images

```
Base Styles (Mobile First)
├─ .responsive-image
│  └─ max-width: 100%
│  └─ height: auto
│  └─ display: block
│
Tablet Override (641px+)
├─ Maintain responsive behavior
│ 
Desktop Override (1025px+)
└─ Full optimization
   └─ max-width: 100%
   └─ proper spacing
```

## Breakpoint Decision Tree

```
START: Image to display?
│
├─ Is it above the fold? 
│  ├─ YES → Use ResponsiveImage with priority=true
│  └─ NO → Use ResponsiveImage with lazy loading
│
├─ Is it in a gallery/grid?
│  ├─ YES → Use ResponsiveGalleryImage
│  └─ NO → Continue
│
├─ Do you have different images per device?
│  ├─ YES → Use ResponsivePicture
│  └─ NO → Use ResponsiveImage
│
└─ Render with appropriate className
   ├─ Mobile: base height/width
   ├─ sm: tablet height/width  
   ├─ md: tablet+ height/width
   └─ lg: desktop height/width
```

## Image Size Reference

### Common Image Sizes by Device

```
MOBILE (640px max width)
├─ Hero: 640px × 640px (full screen)
├─ Story: 640px × 300px (responsive)
├─ Gallery: 640px × 480px (column)
└─ QR Code: 192px × 192px (48 × 4)

TABLET (1024px max width)
├─ Hero: 1024px × 720px (full screen)
├─ Story: 500px × 400px (grid column)
├─ Gallery: 512px × 512px (2 columns)
└─ QR Code: 224px × 224px (56 × 4)

DESKTOP (1200px+)
├─ Hero: 1920px × 1080px (full screen)
├─ Story: 600px × 700px (side by side)
├─ Gallery: 400px × 400px (3 columns)
└─ QR Code: 256px × 256px (64 × 4)
```

## Layout Shift Prevention

```
BEFORE OPTIMIZATION
├─ Image loads without height
├─ Content shifts down
└─ Poor CLS (Cumulative Layout Shift) score

AFTER OPTIMIZATION
├─ Container has explicit height
├─ Image fills known space
└─ No layout shift, perfect CLS
```

## Testing Matrix

```
┌─────────────┬──────────┬──────────┬──────────┐
│   Device    │  Mobile  │  Tablet  │ Desktop  │
├─────────────┼──────────┼──────────┼──────────┤
│ Hero Image  │ ✓        │ ✓        │ ✓        │
│ Story Image │ ✓        │ ✓        │ ✓        │
│ Gallery (1) │ ✓        │ ✓        │ ✓        │
│ Gallery (2) │          │ ✓        │ ✓        │
│ Gallery (3) │          │          │ ✓        │
│ QR Codes    │ ✓        │ ✓        │ ✓        │
│ Lazy Load   │ ✓        │ ✓        │ ✓        │
│ Performance │ ✓        │ ✓        │ ✓        │
└─────────────┴──────────┴──────────┴──────────┘
```
