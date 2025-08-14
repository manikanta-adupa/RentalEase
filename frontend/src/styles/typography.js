// RentalEase Typography System
export const typography = {
  // Font Families
  fontFamily: {
    primary: 'System',    // Default system font
    mono: 'monospace',    // Monospace for special cases
  },

  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 48,
    '6xl': 64,
  },

  // Font Weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Line Heights
  lineHeight: {
    tight: 16,
    normal: 20,
    relaxed: 24,
    loose: 28,
  },

  // Text Styles (Pre-defined combinations)
  textStyles: {
    // Headers
    h1: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 40,
      color: '#1f2937',
    },
    h2: {
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 36,
      color: '#1f2937',
    },
    h3: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
      color: '#1f2937',
    },
    h4: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
      color: '#1f2937',
    },
    h5: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 24,
      color: '#1f2937',
    },
    h6: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 20,
      color: '#1f2937',
    },

    // Body Text
    bodyLarge: {
      fontSize: 18,
      fontWeight: '400',
      lineHeight: 28,
      color: '#1f2937',
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
      color: '#1f2937',
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
      color: '#1f2937',
    },

    // Labels & Captions
    label: {
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 20,
      color: '#374151',
    },
    caption: {
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 16,
      color: '#6b7280',
    },

    // Interactive Elements
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 20,
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 16,
    },
    link: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
      color: '#0f766e',
    },

    // Special Text
    placeholder: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 20,
      color: '#9ca3af',
    },
    error: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
      color: '#ef4444',
    },
    success: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
      color: '#22c55e',
    },
  },
};

export default typography;
