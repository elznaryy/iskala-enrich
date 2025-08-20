# iSkala Logo Assets

This directory contains the official iSkala Business Solutions logo assets for the web application.

## Files

- `iskala-logo.png` - Full logo with text (primary usage)
- `iskala-logo.svg` - Full logo SVG version (fallback)
- `iskala-icon.png` - Icon only version (for favicons and compact spaces)
- `iskala-icon.svg` - Icon SVG version (fallback)
- `favicon.svg` - Simple favicon version

## Usage

Use the `Logo` component (`@/components/Logo`) for consistent logo implementation:

```tsx
import Logo from '@/components/Logo'

// Full logo
<Logo variant="full" size="md" />

// Icon with text
<Logo variant="icon" size="sm" showText={true} />

// White version for dark backgrounds
<Logo variant="full" size="lg" white={true} />
```

## Logo Specifications

### Full Logo

- Used in headers, footers, and main branding
- Includes the chevron symbol and "iSKALA BUSINESS SOLUTIONS" text
- Available in standard and white versions

### Icon Version

- Used for favicons, app icons, and compact layouts
- Features the distinctive chevron/arrow design
- Scalable SVG format for crisp display at any size

## Brand Colors

- Primary Blue: `#667eea`
- Secondary Blue: `#5a67d8`
- Accent Blue: `#4c51bf`
- Dark Text: `#2d3748`
- Light Text: `#718096`

## Best Practices

1. Maintain adequate whitespace around the logo
2. Use the full logo for primary branding contexts
3. Use the icon version only when space is limited
4. Ensure proper contrast on background colors
5. Use the white version on dark backgrounds
