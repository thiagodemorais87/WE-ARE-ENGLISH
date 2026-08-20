export const theme = {
  colors: {
    cherry: '#D20001',
    softPink: '#FEC6E9',
    cobalt: '#0212EE',
    sand: '#F3F3E9',
    ink: '#111111',
    graphite: '#2A2A2A',
    muted: '#5C5C5C',
    white: '#FFFFFF',
  },
  fonts: {
    display: '"Instrument Serif", Georgia, serif',
    sans: '"DM Sans", system-ui, sans-serif',
  },
} as const

export type ThemeColor = keyof typeof theme.colors
