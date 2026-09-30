# Testing Guide - Responsive Images

## Device Testing Guide

### Mobile Testing (0px - 640px)

#### iPhone SE (375px)
- [ ] Hero image displays full-screen
- [ ] Story image height is 300px
- [ ] Gallery shows 1 column (full width)
- [ ] QR codes are 48x48 units (scannable)
- [ ] No horizontal scroll
- [ ] Text is readable

#### iPhone 12/13 (390px)
- [ ] Same as iPhone SE
- [ ] Verify on different orientation (landscape)

#### Galaxy S21 (360px)
- [ ] All mobile checks pass
- [ ] Verify Android-specific rendering

### Tablet Testing (641px - 1024px)

#### iPad Mini (768px)
- [ ] Story image height is 400px
- [ ] Gallery shows 2 columns
- [ ] QR codes are 56x56 units
- [ ] Content properly centered
- [ ] Proper spacing maintained

#### iPad Pro 11" (834px)
- [ ] Same tablet checks
- [ ] Verify on both portrait and landscape

### Desktop Testing (1025px+)

#### MacBook Air (1440px)
- [ ] Gallery shows 3 columns
- [ ] Story image height is 700px
- [ ] QR codes are 64x64 units
- [ ] Images properly scaled
- [ ] Typography readable

#### Desktop 24" Monitor (1920px)
- [ ] All desktop checks
- [ ] Verify maximum width constraints

## Browser Testing Matrix

```
┌──────────────┬─────────┬────────┬─────────┐
│ Browser      │ Mobile  │ Tablet │ Desktop │
├──────────────┼─────────┼────────┼─────────┤
│ Chrome       │ ✓ Test  │ ✓ Test │ ✓ Test  │
│ Safari       │ ✓ Test  │ ✓ Test │ ✓ Test  │
│ Firefox      │ ✓ Test  │ ✓ Test │ ✓ Test  │
│ Edge         │ ✓ Test  │ ✓ Test │ ✓ Test  │
│ Samsung (Mob)│ ✓ Test  │        │         │
└──────────────┴─────────┴────────┴─────────┘
```

## Performance Testing

### Lighthouse Score Check

```
Desktop Performance Test:
─────────────────────────
Performance:  > 80
Accessibility: > 90
Best Practices: > 90
SEO:          > 90

Mobile Performance Test:
──────────────────────
Performance:  > 70
Accessibility: > 90
Best Practices: > 90
SEO:          > 90
```

### Core Web Vitals

#### LCP (Largest Contentful Paint)
- **Target:** < 2.5 seconds
- **Check:** DevTools → Lighthouse
- **Expected:** Hero image loads eagerly (should improve)

#### FID (First Input Delay)
- **Target:** < 100ms
- **Check:** DevTools → Performance
- **Expected:** Should not be affected by images

#### CLS (Cumulative Layout Shift)
- **Target:** < 0.1
- **Check:** DevTools → Lighthouse
- **Expected:** Should be perfect (explicit heights prevent shifts)

## Lazy Loading Verification

### Chrome DevTools Method

1. Open DevTools (F12)
2. Go to Network tab
3. Scroll through page slowly
4. Observe images loading as they enter viewport
5. Verify hero image loads immediately
6. Verify other images load on scroll

### Expected Behavior

```
INITIAL LOAD (0s - 2s)
├─ Hero image: Loaded (priority=true)
└─ Other images: NOT loaded (deferred)

SCROLL TO STORY (2s - 4s)
├─ Story image: NOW loading (entered viewport)
└─ Gallery images: Still deferred

SCROLL TO GALLERY (4s - 6s)
├─ Gallery images: NOW loading (visible)
└─ Further images: Still deferred

SCROLL TO BOTTOM (6s+)
└─ All remaining images: Loaded on demand
```

## Mobile QR Code Testing

### Scannability Check

1. **iPhone Camera App**
   - Open Camera
   - Point at QR codes
   - Verify quick recognition
   - Check all breakpoints (mobile, tablet, desktop)

2. **Android Camera/Google Lens**
   - Test on different Android devices
   - Verify QR codes are scannable
   - Check various device sizes

3. **Desktop Testing**
   - Use online QR code readers
   - Verify QR code content is correct

### QR Code Size Guidelines

```
Mobile (w-48):    192px × 192px minimum
Tablet (w-56):    224px × 224px comfortable
Desktop (w-64):   256px × 256px optimal
```

## Image Quality Check

### Visual Inspection

1. **Hero Image**
   - [ ] No pixelation on mobile
   - [ ] No excessive quality loss on tablet
   - [ ] Sharp on desktop
   - [ ] Text overlay visible
   - [ ] Overlay opacity correct

2. **Story Image**
   - [ ] Proper aspect ratio maintained
   - [ ] Asymmetric border radius correct
   - [ ] Shadow effect visible
   - [ ] No stretching or distortion

3. **Gallery Images**
   - [ ] Column-based layout correct
   - [ ] Aspect ratios maintained
   - [ ] Hover effect smooth
   - [ ] Heart icon visible on hover

4. **QR Codes**
   - [ ] Clear and sharp
   - [ ] No compression artifacts
   - [ ] Scannable on all devices
   - [ ] Proper size on all breakpoints

## Responsive Height Testing

### Story Image Heights

```
Device       │ Expected Height
─────────────┼────────────────
Mobile       │ 300px
Tablet (sm)  │ 400px
Tablet (md)  │ 500px
Desktop (lg) │ 700px
```

### Testing Steps

1. Open DevTools Element Inspector
2. Hover over story image
3. Check computed height matches breakpoint
4. Resize window and verify height changes

## CSS Media Query Verification

### Using Browser DevTools

1. Open DevTools
2. Press Ctrl+Shift+M (or Cmd+Shift+M on Mac)
3. Select device from dropdown
4. Verify layout matches expected breakpoint

### Manual Breakpoint Testing

```
Breakpoint       │ Window Width │ Expected Layout
─────────────────┼──────────────┼─────────────────
Mobile           │ 375px        │ 1 column
Mobile Max       │ 640px        │ 1 column
Tablet Min       │ 641px        │ 2 columns
Tablet           │ 768px        │ 2 columns
Tablet Max       │ 1024px       │ 2 columns
Desktop Min      │ 1025px       │ 3 columns
Desktop          │ 1440px       │ 3 columns
Desktop Large    │ 1920px       │ 3 columns
```

## Network Throttling Test

### Simulate Slow Network

1. Open DevTools
2. Network tab → Throttling dropdown
3. Select "Slow 3G"
4. Reload page
5. Verify hero image loads (with priority)
6. Verify no layout shift
7. Verify lazy loading works

### Expected Results

- Hero image loads first (priority)
- Page remains usable during image loading
- No layout jump when images appear
- Gallery images load on demand

## Orientation Change Test

### Mobile Device Testing

1. Start in portrait mode
2. Load page
3. Rotate to landscape
4. Verify layout adapts correctly
5. Check image sizing
6. Verify no layout shift

### Tablet Testing

1. Start in portrait (1 column or 2-column gallery)
2. Rotate to landscape
3. Verify gallery columns adjust
4. Check image sizing
5. Verify proper spacing

## Accessibility Testing

### Screen Reader Test

1. Use VoiceOver (Mac), NVDA (Windows), or TalkBack (Android)
2. Read through page
3. Verify all images have proper alt text
4. Check alt text is descriptive

### Alt Text Verification

```
Image Type       │ Expected Alt Text
─────────────────┼──────────────────
Hero             │ "{Groom} and {Bride}"
Story            │ "Our Story"
Gallery 1        │ "Gallery 1"
Gallery 2        │ "Gallery 2"
QR Code (Groom)  │ "Groom gift QR code"
QR Code (Bride)  │ "Bride gift QR code"
```

## Error Prevention Checklist

- [ ] No console errors on any breakpoint
- [ ] No image 404 errors
- [ ] No layout warnings
- [ ] No accessibility warnings
- [ ] No performance warnings
- [ ] All images load correctly

## Test Results Template

```
Device:        _________________
Browser:       _________________
Orientation:   [ ] Portrait  [ ] Landscape
Screen Size:   _________________

Visual Tests:
[ ] Hero image displays correctly
[ ] Story image responsive
[ ] Gallery layout correct
[ ] QR codes scannable
[ ] No layout shift
[ ] Text readable

Performance:
[ ] LCP < 2.5s
[ ] CLS < 0.1
[ ] No layout shift
[ ] Lazy loading works

Accessibility:
[ ] Alt text present
[ ] No console errors
[ ] Screen reader friendly

Notes: _________________________
```

## Regression Testing Checklist

After making changes to images:

- [ ] Run full device test (mobile, tablet, desktop)
- [ ] Run Lighthouse audit
- [ ] Check Core Web Vitals
- [ ] Verify QR code scannability
- [ ] Test network throttling
- [ ] Check console for errors
- [ ] Run accessibility audit
- [ ] Verify all images load

## Quick Test Commands

### Check Image Loads
Open DevTools → Network tab and reload, look for image requests

### Check Lazy Loading
Open DevTools → Performance tab, scroll down, observe image loading timeline

### Check Responsive Design
DevTools → Ctrl+Shift+M → Test different devices

### Check Accessibility
DevTools → Lighthouse → Accessibility score should be 90+

---

**Remember:** Always test on real devices, not just browser emulation!
