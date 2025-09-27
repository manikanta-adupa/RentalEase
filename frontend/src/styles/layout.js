// RentalEase Layout & Component Styles
import { StyleSheet, Dimensions } from 'react-native';
import colors from './colors';
import typography from './typography';
import spacing from './spacing';

export const createCarouselStyles = (width) => {
  return StyleSheet.create({
    carouselImage: {
      width: width * 0.9,
      height: 250,
      borderRadius: spacing.md,
      marginHorizontal: spacing.sm,
    },
    carouselContainer: {
      paddingHorizontal: spacing.sm,
    },
  });
};

export const layout = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  scrollContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxl
  },

  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header Styles
  header: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderBottomLeftRadius: spacing.xl,
    borderBottomRightRadius: spacing.xl,
    marginBottom: spacing.lg,
  },

  headerCentered: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderBottomLeftRadius: spacing.xl,
    borderBottomRightRadius: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },

  // Card Styles
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: spacing.md,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 7,
  },

  cardLarge: {
    backgroundColor: colors.background.secondary,
    borderRadius: 20,
    padding: 30,
    marginHorizontal: spacing.lg,
    marginBottom: spacing['2xl'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },

  cardProperty: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 7,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },

  // Form Styles
  formContainer: {
    paddingHorizontal: spacing.lg,
    flex: 1,
  },

  inputGroup: {
    marginBottom: 20,
  },

  inputContainer: {
    position: 'relative',
  },

  input: {
    height: 52,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderRadius: spacing.input,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.base,
    backgroundColor: colors.neutral[50],
    color: colors.text.primary,
  },

  inputFocused: {
    borderColor: colors.border.focus,
    backgroundColor: colors.primary.background,
  },

  inputWithIcon: {
    paddingRight: 50,
  },

  // Button Styles
  buttonPrimary: {
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.md,
    borderRadius: spacing.input,
    alignItems: 'center',
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  buttonSecondary: {
    backgroundColor: colors.background.secondary,
    paddingVertical: spacing.md,
    borderRadius: spacing.input,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.error.main,
  },

  buttonDisabled: {
    backgroundColor: colors.neutral[300],
    paddingVertical: spacing.md,
    borderRadius: spacing.input,
    alignItems: 'center',
  },

  buttonGroup: {
    gap: spacing.button,
  },

  // Footer Styles
  footer: {
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },

  footerTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: 80,
  },

  // List Styles
  listContainer: {
    flex: 1,
  },

  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 80,
  },

  listItem: {
    backgroundColor: colors.background.secondary,
    borderRadius: spacing.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },

  // Utility Styles
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  rowStart: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  column: {
    flexDirection: 'column',
  },

  flex1: {
    flex: 1,
  },

  flex: {
    flex: 1,
  },

  spacer: {
    flex: 1,
  },

  // Input Label Styles
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },

  // Text Input Styles
  textInput: {
    height: 52,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderRadius: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.base,
    backgroundColor: colors.neutral[50],
    color: colors.text.primary,
  },

  textInputFocused: {
    borderColor: colors.border.focus,
    backgroundColor: colors.primary.background,
  },

  // Status Styles
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.xs,
  },

  badge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: spacing.input,
    alignSelf: 'flex-start',
  },

  // Error & Success Styles
  errorContainer: {
    backgroundColor: colors.error.light,
    borderRadius: 8,
    padding: spacing.input,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.error.main,
  },

  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Icon Button Styles
  iconButton: {
    position: 'absolute',
    right: 12,
    height: 52,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8
    },
    addImageButton: {
        width: 100,
        height: 100,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: colors.primary.main,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.primary.background,
    },
    addImageText: {
        ...typography.textStyles.caption,
        color: colors.primary.main,
        marginTop: spacing.xs,
    },
    imageContainer: {
        position: 'relative',
    },
    thumbnail: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: colors.error.main,
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        borderWidth: 2,
        borderColor: colors.background.primary,
    },

  // Property Detail Screen Styles
  sectionTitle: {
    ...typography.textStyles.h3,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  description: {
    ...typography.textStyles.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  detailLabel: {
    ...typography.textStyles.label,
    color: colors.text.secondary,
  },
  detailValue: {
    ...typography.textStyles.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  amenityPill: {
    backgroundColor: colors.primary.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary.light,
  },
  amenityText: {
    ...typography.textStyles.bodySmall,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.medium,
  },
});

export default layout;
