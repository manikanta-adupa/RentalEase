import colors from './colors';
import typography from './typography';
import { spacing } from './spacing';
import { layout, createCarouselStyles } from './layout';

export { colors, typography, spacing, layout, createCarouselStyles };

// Re-export commonly used items for convenience

// Design tokens for easy access
export const theme = {
  colors: require('./colors').default,
  typography: require('./typography').default,
  spacing: require('./spacing').default,
  layout: require('./layout').default,
};

export default theme;
