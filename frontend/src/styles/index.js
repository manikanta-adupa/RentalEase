// RentalEase Design System - Main Export
export { default as colors } from './colors';
export { default as typography } from './typography';
export { default as spacing } from './spacing';
export { default as layout } from './layout';

// Re-export commonly used items for convenience
export { colors as Colors } from './colors';
export { typography as Typography } from './typography';
export { spacing as Spacing } from './spacing';
export { layout as Layout } from './layout';

// Design tokens for easy access
export const theme = {
  colors: require('./colors').default,
  typography: require('./typography').default,
  spacing: require('./spacing').default,
  layout: require('./layout').default,
};

export default theme;
