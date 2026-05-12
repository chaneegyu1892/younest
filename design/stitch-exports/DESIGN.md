---
name: younest Design System
colors:
  surface: '#FFFFFF'
  surface-dim: '#e6d7d4'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff0ee'
  surface-container: '#faeae7'
  surface-container-high: '#f5e5e2'
  surface-container-highest: '#efdfdc'
  on-surface: '#221a18'
  on-surface-variant: '#54433f'
  inverse-surface: '#372e2c'
  inverse-on-surface: '#fdedea'
  outline: '#87726e'
  outline-variant: '#dac1bc'
  surface-tint: '#944838'
  primary: '#944838'
  on-primary: '#ffffff'
  primary-container: '#ff9f8a'
  on-primary-container: '#793425'
  inverse-primary: '#ffb4a4'
  secondary: '#655590'
  on-secondary: '#ffffff'
  secondary-container: '#cfbcff'
  on-secondary-container: '#594983'
  tertiary: '#006b5c'
  on-tertiary: '#ffffff'
  tertiary-container: '#69c9b5'
  on-tertiary-container: '#005347'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad3'
  primary-fixed-dim: '#ffb4a4'
  on-primary-fixed: '#3c0701'
  on-primary-fixed-variant: '#763223'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#cfbcff'
  on-secondary-fixed: '#200f48'
  on-secondary-fixed-variant: '#4d3d76'
  tertiary-fixed: '#94f4df'
  tertiary-fixed-dim: '#78d7c3'
  on-tertiary-fixed: '#00201b'
  on-tertiary-fixed-variant: '#005045'
  background: '#FAFAF8'
  on-background: '#221a18'
  surface-variant: '#efdfdc'
  sidebar-bg: '#F5F4F1'
  text-primary: '#1A1A1A'
  text-secondary: '#6B6B6B'
  text-tertiary: '#A8A8A8'
  border: '#E8E6E1'
  success: '#7FB069'
  warning: '#F4A261'
  private-accent: '#8B7AB8'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.3'
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.3'
  body:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.6'
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.6'
  display-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.3'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  huge: 64px
  sidebar-width: 240px
  container-max: 1440px
---

# Project: younest

## Product Context
younest is a personal workspace web app for individuals (primarily women in their 20s-30s in Korea) who want unlimited, private, free Notion-like note-taking. The product emphasizes warmth, calm, and personal sanctuary ("your nest"). Users write daily journals, prayer requests, work notes, and manage life with databases.

## Target Users
Korean-speaking women, 20-30s, who:
- Have outgrown Notion's free tier limits
- Want absolute privacy for personal notes
- Prefer a clean, gentle, cozy aesthetic over corporate/tech look

## Design Principles
1. Warm and cozy, not corporate
2. Clean and minimal, not cluttered
3. Trustworthy and calm (security is a feature)
4. Mobile-first responsive (375px) and desktop (1440px)
5. Korean-first language (use Korean text in UI)

## Visual Style

### Color Palette
- Primary: #FF9F8A (warm coral, used sparingly for CTAs and accents)
- Background: #FAFAF8 (off-white, slightly warm)
- Surface: #FFFFFF (cards, panels)
- Sidebar BG: #F5F4F1 (warm light gray)
- Text Primary: #1A1A1A
- Text Secondary: #6B6B6B
- Text Tertiary: #A8A8A8
- Border: #E8E6E1
- Success: #7FB069 (soft green)
- Warning: #F4A261 (soft orange)
- Lock/Private: #8B7AB8 (soft purple, for private/encrypted indicators)

### Typography
- Font: Pretendard (Korean-optimized sans-serif) or Inter as fallback
- Display: 32px / 700 weight
- H1: 24px / 600
- H2: 18px / 600
- Body: 14px / 400
- Caption: 12px / 400
- Line height: 1.6 for body, 1.3 for headings

### Spacing
8px grid system: 4, 8, 12, 16, 24, 32, 48, 64

### Border Radius
- Small (inputs, small buttons): 6px
- Medium (cards, buttons): 10px
- Large (modals): 16px
- Pill: 9999px

### Shadows
Very subtle, warm shadows:
- Card: 0 1px 3px rgba(0,0,0,0.04)
- Modal: 0 10px 40px rgba(0,0,0,0.08)
- Floating: 0 4px 12px rgba(0,0,0,0.06)

### Icons
Use line-style icons (Lucide or Phosphor style), 1.5px stroke, rounded caps. No filled icons except for lock/private indicators.

### Imagery
Soft, warm photography. Avoid corporate stock photos. Cozy interiors, soft natural light, plants, journals.

## Components Guidelines

### Sidebar
- Fixed left, 240px wide on desktop
- Warm light gray background (#F5F4F1)
- Logo on top, search button below, page tree, footer with user menu
- Page items have small emoji icons, indented for hierarchy
- Hover state: subtle background change

### Page Header
- Optional cover image area (200px tall)
- Large emoji icon (40px)
- Page title (32px display)
- Action icons in top-right: lock toggle, favorite star, more menu

### Block Editor (Notion-style)
- Clean blocks with hover-revealed drag handles on the left
- Slash command menu on "/" press
- Block types: heading, paragraph, toggle, callout, quote, code, image, divider

### Buttons
- Primary: coral background (#FF9F8A), white text, 10px radius
- Secondary: white background, gray border, dark text
- Ghost: no background, dark text, subtle hover

### Inputs
- White background, gray border, 6px radius
- 12px vertical padding
- Focus state: coral border

### Cards
- White background, subtle shadow
- 10px radius, 16px padding
- Hover: slight lift (shadow grows)

## Privacy Indicators
When a page is private (E2E encrypted), show:
- Soft purple lock icon in page header
- Optional "비공개" badge near title

## Tone of Voice (for any UI copy)
- Warm and conversational, like a friend
- Use Korean honorifics (해요체)
- Avoid corporate jargon
- Examples:
  - "오늘은 어떤 하루였나요?" (not "Today's diary")
  - "잠시만 기다려 주세요" (not "Loading...")
  - "이 페이지는 비공개예요. PIN을 입력해 주세요." (security-related copy)