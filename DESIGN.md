---
version: alpha
name: shadcnblocks
description: The default shadcn/ui theme — pure black-and-white neutrals, functional clarity, and zero personality friction by shadcnblocks.
colors:
  background: "#ffffff"
  foreground: "#0a0a0a"
  card: "#ffffff"
  primary: "#171717"
  primary-foreground: "#fafafa"
  secondary: "#f5f5f5"
  secondary-foreground: "#171717"
  muted: "#f5f5f5"
  muted-foreground: "#737373"
  accent: "#f5f5f5"
  accent-foreground: "#171717"
  destructive: "#e7000b"
  border: "#e5e5e5"
  input: "#e5e5e5"
  ring: "#a1a1a1"
  sidebar: "#fafafa"
  sidebar-foreground: "#0a0a0a"
  sidebar-primary: "#171717"
  sidebar-accent: "#f5f5f5"
  chart-1: "#f54900"
  chart-2: "#009689"
  chart-3: "#104e64"
  chart-4: "#ffb900"
  chart-5: "#fe9a00"
  dark-background: "#0a0a0a"
  dark-foreground: "#fafafa"
  dark-card: "#0a0a0a"
  dark-primary: "#e5e5e5"
  dark-secondary: "#262626"
  dark-muted: "#262626"
  dark-muted-foreground: "#a1a1a1"
  dark-accent: "#262626"
  dark-border: "#262626"
  dark-sidebar: "#171717"
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.25
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
  serif-display:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: 600
    lineHeight: 1.15
  mono:
    fontFamily: IBM Plex Mono
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
rounded:
  xs: 2px
  sm: 4px
  md: 6px
  lg: 8px
  xl: 12px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  "2xl": 48px
  section: 64px
  gutter: 32px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.lg}"
    padding: 12px
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.lg}"
    padding: 12px
  button-outline:
    backgroundColor: transparent
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: 12px
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: 24px
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: 12px
  sidebar:
    backgroundColor: "{colors.sidebar}"
    textColor: "{colors.sidebar-foreground}"
---

# shadcnblocks

The default shadcn/ui theme by shadcnblocks. Keep this DESIGN.md in the project root so coding agents stay on-brand.
