---
name: Alza Fintech & Trading
colors:
  surface: '#f7f9fc'
  surface-dim: '#d8dadd'
  surface-bright: '#f7f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f7'
  surface-container: '#eceef1'
  surface-container-high: '#e6e8eb'
  surface-container-highest: '#e0e3e6'
  on-surface: '#191c1e'
  on-surface-variant: '#43474d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f4'
  outline: '#74777d'
  outline-variant: '#c3c6cd'
  surface-tint: '#4b6078'
  primary: '#000f1e'
  on-primary: '#ffffff'
  primary-container: '#0d253a'
  on-primary-container: '#778da6'
  inverse-primary: '#b2c9e4'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#270002'
  on-tertiary: '#ffffff'
  tertiary-container: '#500006'
  on-tertiary-container: '#f94b4a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cfe5ff'
  primary-fixed-dim: '#b2c9e4'
  on-primary-fixed: '#041d32'
  on-primary-fixed-variant: '#33495f'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ad'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#930013'
  background: '#f7f9fc'
  on-background: '#191c1e'
  surface-variant: '#e0e3e6'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.03em
  display-sm:
    fontFamily: Manrope
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Manrope
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 22px
  body-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Manrope
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
  label-sm:
    fontFamily: Manrope
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
  label-xs:
    fontFamily: Manrope
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 12px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 0.75rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system embodies a modern, high-precision financial trading and equity intelligence platform. It prioritizes clarity, data integrity, and confident decision-making for individual investors and analytical market participants. 

The aesthetic is grounded in **Corporate / Modern FinTech Minimalism** characterized by:
- A crisp, clinical light-mode canvas paired with deep midnight navy ink for maximum contrast and legibility.
- Electric emerald greens signaling growth, positive delta, and vitality, complemented by sharp crimson alerts for market dips.
- Layered rounded containers that soften complex financial metrics into digestible, touch-friendly units.
- Tactical micro-interactions and dark-mode popover callouts (e.g., candlestick inspection tooltips) providing immediate contextual focus without cluttering the main stage.

## Colors

The palette establishes an immediate hierarchy between institutional stability, crisp navigation, and real-time market movement:

- **Primary (`#0D253A`)**: A deep navy charcoal. Used for primary typography, solid button states (active toggles), top ticker banners, and dark contextual inspection tooltips.
- **Secondary (`#10B981`)**: Electric emerald green. Used for bullish candlestick bodies, positive price deltas (`+1,55 %`), gain badges, and active tab indicator highlights.
- **Tertiary (`#EF4444`)**: Balanced crimson red. Used for bearish candlestick bodies, negative price trajectories, and critical alert states.
- **Neutral Canvas (`#F4F6F9`)**: A soft cool-gray tint providing clean separation against pure white (`#FFFFFF`) card surfaces.

### Semantic & Functional Roles
- **Surface Pure (`#FFFFFF`)**: Base container for primary chart modules, summary cards, and inputs.
- **Surface Muted / Chip (`#EAEFF5`)**: Pill background for inactive asset tags and subtle segment containers.
- **Accent Soft Blue (`#E0EDFF`)**: Pill highlight for asset sector categorization (e.g., *Finanzas*) with text tinted in `#1D68CD`.
- **Text Muted (`#64748B`)**: Secondary labels, axis numbers, and breadcrumbs.
- **Border Subtle (`#E2E8F0`)**: Hairline outlines on selector dropdowns, timeframes, and chart gridlines (`#F1F5F9`).

## Typography

**Manrope** serves across all touchpoints due to its modern geometric construction, open apertures, and crisp numeric glyphs essential for financial readouts.

- **Numerics & Price Tickers**: Numbers are prioritized with semi-bold to extra-bold weights (`600`–`800`) with tight letter spacing for unified visual density.
- **Breadcrumbs and Overlines**: Rendered in small, medium-weight (`11px`–`13px`) muted slate (`#64748B`) to keep visual prominence anchored on the ticker entity and price.
- **Tooltip Values**: Monospaced tabular alignment via Manrope figures ensures financial figures line up seamlessly inside dark callouts.

## Layout & Spacing

The layout is built around an ergonomic mobile-first column model enclosed within a fluid vertical stream:

- **Outer Margins**: Set to `1rem` (16px) on mobile viewports to maximize data visualization real estate.
- **Card Padding**: Primary modules (such as the interactive candlestick viewport) use `1rem` internal padding; compact summary metric cards utilize `0.75rem` to maintain dense scannability.
- **Multi-Card Grids**: Sub-metrics at the bottom (`Apertura`, `Máximo`, `Cierre`) split evenly into a 3-column flex container with `0.5rem` to `0.75rem` gap spacing.
- **Vertical Rhythm**: Headers, controls, chart canvases, and summary cards are separated by uniform `0.75rem` to `1rem` gaps to avoid cognitive overload.

## Elevation & Depth

Visual hierarchy relies on **Tonal Separation** and subtle **Ambient Shadows**:

- **Canvas to Card**: The base background (`#F4F6F9`) provides a soft floor upon which pure white cards (`#FFFFFF`) rest with a soft, diffused drop shadow: `0 2px 8px -2px rgba(13, 37, 58, 0.04), 0 1px 4px -1px rgba(13, 37, 58, 0.02)`.
- **Selected Controls & Tooltips**: Active timeframe selectors and chart inspection overlays use pure midnight navy (`#0D253A`) with a crisp elevated presence: `0 8px 16px -4px rgba(13, 37, 58, 0.25)`.
- **Form Selectors**: Dropped entity menus use hairline strokes (`1px solid #E2E8F0`) with zero shadow, prioritizing precision and utility.

## Shapes

The design uses a balanced rounded geometry (Level `2`):
- **Base Components**: Select dropdowns, standard buttons, and small metric cards feature `0.5rem` to `0.75rem` (8px–12px) corners.
- **Primary Data Containers**: The main chart wrapper uses `1rem` (16px) border radii for an organic, contained appearance.
- **Pills & Status Indicators**: Filter tags, category chips, ticker delta indicators (`+1,55 %`), and timeframe toggles adopt fully rounded pill radii (`9999px`) to distinguish actionable or dynamic badges from structural layout cards.

## Components

### Buttons & Toggle Segments
- **Segmented Timeframe / Chart Type**: Contained in a low-contrast neutral pill container (`#F1F5F9`). Active pills switch to `#0D253A` (Midnight) or deep vibrant blue (`#1D68CD`) with white text; inactive items stay transparent with muted slate text (`#64748B`).
- **Entity Dropdown Selectors**: Full-width bordered containers (`#FFFFFF` fill, `1px solid #E2E8F0`, rounded `10px`) containing asset name, ticker code, and a subtle chevron icon.

### Chips & Badges
- **Tag Badges**: Pill-shaped badges (`rounded-full`, padding `4px 10px`). Asset ticker codes use neutral grey tint (`#EAEFF5`), while industry verticals use soft primary tints (e.g., `#E0EDFF` with `#1D68CD` text).
- **Gain / Loss Indicators**: Soft emerald pill backgrounds (`#E6F8F0`) paired with bold emerald text (`#10B981`) and micro directional arrows (`▲`).

### Interactive Candlestick Chart
- **Green (Bullish) Candles**: `#10B981` fill and wick stroke.
- **Red (Bearish) Candles**: `#EF4444` fill and wick stroke.
- **Grid Lines**: Ultra-soft `#EDF2F7` horizontal rules with muted right-aligned price scales (`11px`, `#94A3B8`).
- **Floating HUD / Tooltip**: Dark floating capsule (`#0D253A`, text `#FFFFFF`, rounded `8px`) with labeled tabular data (`Apertura`, `Máximo`, `Mínimo`, `Cierre`).

### Data Metric Summary Cards
- **Structure**: Surface `#FFFFFF`, rounded `12px`, padding `12px 14px`.
- **Content**: Tiny uppercase/title label in `#64748B`, followed by high-contrast numeric values in `#0D253A` (Manrope Bold, `18px`).

### Navigation Bar
- **Bottom Navigation Dock**: Elevated white surface with subtle top stroke (`#E2E8F0`). Inactive navigation items use `#94A3B8`; the active icon and label use `#1D68CD` with an active bar pill indicator underneath.