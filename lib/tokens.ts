export const tokens = {
  dark: {
    bg: '#131110',
    bg2: '#1a1715',
    ink: '#f0ebe3',
    mute: '#a39d94',
    dim: '#8a847b',
    line: 'rgba(255,255,255,0.09)',
    accent: '#f2c14e',
    accentSoft: 'rgba(242,193,78,0.14)',
  },
  light: {
    bg: '#e9e6e0',
    bg2: '#f3f1ec',
    ink: '#151412',
    mute: '#5f5b55',
    dim: '#6b675f',
    line: 'rgba(0,0,0,0.10)',
    accent: '#7a5a00',
    accentSoft: 'rgba(122,90,0,0.14)',
  },
} as const

export type ThemeName = keyof typeof tokens
