---
name: GhostGuard Precision Security
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464555'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#006c4a'
  on-secondary: '#ffffff'
  secondary-container: '#82f5c1'
  on-secondary-container: '#00714e'
  tertiary: '#703a00'
  on-tertiary: '#ffffff'
  tertiary-container: '#934e00'
  on-tertiary-container: '#ffd2b1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#85f8c4'
  secondary-fixed-dim: '#68dba9'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005137'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-code-lg:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: -0.01em
  label-code-md:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: '0'
  label-code-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
  ui-label:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.25rem
  margin: 1rem
  margin-desktop: 1.5rem
  space-xxs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
---

## Brand & Style

This design system is engineered for zero-trust data protection officers, forensic privacy engineers, and regulatory auditors executing verifiable identity and personal data purge operations. The brand personality is clinical, authoritative, unyielding, and forensically precise. 

The aesthetic leverages a high-density **Corporate / Modern Precision** framework combined with technical, data-dense utilities. It rejects decorative illustrations, whimsical micro-copy, and soft blurred abstractions in favor of crisp delineation, structured evidence manifests, monospaced validation hashes, and instant auditability. Interfaces must evoke the feeling of a flight recorder or cryptographic terminal: infallible, methodical, and calm under high-stakes compliance scrutiny.

## Colors

The system uses an asymmetric structural contrast model: a persistent deep slate-navy frame (`#0F172A` / `#1E293B`) anchoring navigation and system status, contrasting with an ultra-clean, clinical light canvas (`#F8FAFC` base with `#FFFFFF` panels) for intensive data parsing and cryptographic logs.

### Palette Directives
- **Primary Action (`#4F46E5` / Hover `#4338CA`)**: Dedicated strictly to active operational triggers, confirmed purge batches, and key transitions. Never used decoratively.
- **Verification & Immutability (`#059669` / Hover `#10B981`)**: Denotes fully purged records, cryptographic validation match, verified tombstone states, and zero-leak confirmation.
- **Recreation & Pipeline Hazard (`#D97706` / Hover `#F59E0B`)**: Flags model retraining ingestion risks, shadow pipeline re-hydration, or retention hold conflicts.
- **Audit Failure & Non-Compliance (`#DC2626` / Hover `#EF4444`)**: Flags breach of erasure SLA, non-responsive downstream processors, or failed tombstone verification.
- **Structural Chrome & Boundaries**: Borders and separators strictly utilize crisp slate grays (`#E2E8F0` on canvas, `#334155` within the dark frame) to preserve legibility under dense visual workloads without causing eye fatigue.

## Typography

The typography architecture balances high-throughput parsing with cryptographic legibility. 
- **Headings (Geist)** provide sharp, geometric, low-distortion hierarchy across security modules and analytical headers.
- **Body & Data Tables (Inter)** operate at compact base scales (`13px` body default) optimized for massive horizontal tabular views and deep relational audit graphs.
- **Forensic Identifiers (JetBrains Mono)** are mandatory for all dynamic identifiers, including case IDs (`CASE-518`), evidence tokens (`EV-8891`), SHA-256 hashes, payload sizes, database column addresses, and zero-knowledge verification receipts. Tabular figures must be enabled across all numerical outputs.

## Layout & Spacing

This design system runs on an information-dense, high-efficiency grid calibrated for dual-monitor SOC operations and forensic review workstations.

### Layout Mechanics
- **Structural Blueprint**: Fixed-width dark navigation rails (collapsible from `240px` to `64px`) coupled to a 12-column fluid workbench with strict horizontal boundary clamping at `1920px`.
- **Rhythm & Padding**: A strict 4px/8px incremental rhythm is enforced. Density is prioritized: compact component padding (`space-xs` and `space-sm`) allows operators to view complete ledger lines and cryptographic handshakes without scrolling.
- **Breakpoints & Adaptation**:
  - **Desktop (`≥1280px`)**: Full dual-pane split workspace (Audit Manifest on left, Cryptographic Verification Inspector on right) with 12-column layout.
  - **Tablet (`768px - 1279px`)**: Audit Inspector folds into a slide-over drawer; secondary metadata drops behind condensed toggle bars.
  - **Mobile (`<768px`)**: Stacked single-column view strictly for emergency incident acknowledgement, hash validation review, and operational kill-switches.

## Elevation & Depth

Visual hierarchy rejects blurry dramatic drop-shadows and skeuomorphic gradients in favor of **Tonal Layering** and **Low-Contrast Outlines**.

1. **Base Plane (Elevation 0)**: `#F8FAFC` canvas representing the operational bedrock.
2. **Surface Panels (Elevation 1)**: Flat `#FFFFFF` panels bounded by a crisp 1px solid `#E2E8F0` border. Zero shadow blur is applied during resting states.
3. **Hover & Interactive Tiers (Elevation 2)**: Maintained through an outline color step (`#CBD5E1`) and a hyper-subtle, non-diffused contact shadow: `box-shadow: 0 1px 2px 0 rgba(15, 23, 42, 0.05)`.
4. **Context Menus, Modals & Floating Inspectors (Elevation 3)**: Pure `#FFFFFF` panels reinforced by a dual border boundary (`1px solid #CBD5E1`) and a directed structural shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`.
5. **Dark Sidebar Chrome**: Layered flat with `#0F172A` as base, internal active routes highlighted with `#1E293B`, and separated from the main content viewport by a strict vertical border of `1px solid #1E293B`.

## Shapes

The interface embraces a **Soft / Technical (0.25rem / 4px base)** geometry. Soft corners minimize visual distraction, maintaining the structural rigidity expected of a mission-critical compliance console.

- **Standard Inputs, Table Rows, and Cards**: `0.25rem` (4px).
- **Surface Panels & Modal Windows**: `0.5rem` (8px).
- **Status Pills, Evidence Badges, and Verification Tags**: Full pill styling (`9999px`) to immediately distinguish scalar states, forensic statuses, and immutable tags from interactive buttons and structural panels.

## Components

### Buttons
- **Primary Action (Execute Deletion / Attest Audit)**: Deep Indigo background (`#4F46E5`), text `#FFFFFF`, 4px radius, `h-8` (dense 32px), `px-3`, `text-xs font-medium`. Focus state uses an accessible `2px` offset ring in `#4F46E5`.
- **Secondary (Inspect / Export Hash)**: Surface `#FFFFFF`, border `1px solid #E2E8F0`, text `#1E293B`, hover `#F8FAFC`.
- **Destructive Override (Hard Purge / Revoke System)**: Surface `#FEF2F2`, border `1px solid #FCA5A5`, text `#DC2626`, hover background `#FEE2E2`.

### Chips & Evidence Badges
- **Shape**: Compact pill (`rounded-full`), `px-2`, `py-0.5`, with `JetBrains Mono` at `10px` or `11px`.
- **Verified State**: Background `#ECFDF5`, text `#065F46`, border `1px solid #A7F3D0`. Prepended with an emerald geometric dot.
- **Recreation Hazard**: Background `#FFFBEB`, text `#92400E`, border `1px solid #FDE68A`.
- **Violation / Active Non-Compliance**: Background `#FEF2F2`, text `#991B1B`, border `1px solid #FECACA`.
- **Forensic Hash Tag**: Background `#F1F5F9`, text `#334155`, border `1px solid #E2E8F0`, monospaced truncated hash string with a 1-click copy action.

### Data Tables & Ledger Lists
- **Density**: Compact table rows (`h-9` or 36px total height), single-line data truncations with tooltip overlays for full paths.
- **Row Styling**: Alternating hover fill `#F8FAFC`, active selection `#EEF2FF`, dividing borders `1px solid #F1F5F9`.
- **Header Cell**: `#F8FAFC` background, uppercase `ui-label` typography (`11px`, letter-spacing `0.04em`), color `#64748B`.

### Form Controls & Filter Inputs
- **Text & Search Fields**: Height 32px (`h-8`), `#FFFFFF` background, `1px solid #CBD5E1` border, `text-xs` typography, placeholder color `#94A3B8`. Active focus triggers a crisp ring: `border-color #4F46E5` with `box-shadow: 0 0 0 1px #4F46E5`.
- **Checkboxes & Radios**: 14px square/circle with `1px solid #CBD5E1` resting state. Checked state switches to `#4F46E5` with a high-contrast white vector check mark.

### Cards & Ledger Blocks
- White background (`#FFFFFF`), `4px` or `8px` roundedness, bounded by `1px solid #E2E8F0`. 
- Card headers feature an integrated toolbar carrying metadata, total counts, and action menus, delineated from the body by a horizontal `1px solid #E2E8F0` rule.

### Specialized Security Operation Components
- **Audit Diff Inspector**: Split monospaced panel rendering pre-deletion personal data attributes against the post-deletion cryptographic tombstone, using tinted inline text removals (`#FEE2E2` / `#991B1B`) and additions (`#ECFDF5` / `#065F46`).
- **Pipeline Pipeline-Run Breadcrumb**: Connected monospace nodes (`INGEST -> MAPPING -> TOMBSTONE -> VALIDATED`) showing pipeline processing states and latency timestamps.