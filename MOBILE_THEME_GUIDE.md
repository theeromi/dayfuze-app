# DayFuse Mobile Theme Guide

## 🎨 Design System Translation: Web to Mobile

This guide ensures visual consistency between the DayFuse web app and React Native mobile app by translating web design tokens to mobile-compatible styles.

---

## Color System

### Brand Colors (Exact Match)
```javascript
// React Native color constants
const colors = {
  // Primary Brand Colors
  dayBlue: '#5B7FFF',        // Primary brand color
  fuseOrange: '#FFB833',     // Secondary brand color
  accentRed: '#FF5A77',      // Error/high priority
  accentYellow: '#FFB833',   // Warning/medium priority  
  accentGreen: '#30D394',    // Success/low priority
  
  // Light Theme
  light: {
    background: '#FFFFFF',
    foreground: '#0F172A',
    card: '#FFFFFF',
    surface: '#F8FAFC',       // For elevated surfaces
    border: '#E2E8F0',
    primary: '#1E293B',
    secondary: '#F1F5F9',
    muted: '#F8FAFC',
    text: '#0F172A',
    textSecondary: '#64748B',
    success: '#30D394',
    warning: '#FFB833',
    error: '#FF5A77',
  },
  
  // Dark Theme
  dark: {
    background: '#0F172A',
    foreground: '#F8FAFC',
    card: '#1E293B',
    surface: '#334155',       // For elevated surfaces
    border: '#334155',
    primary: '#F8FAFC',
    secondary: '#334155',
    muted: '#1E293B',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    success: '#30D394',
    warning: '#FFB833',
    error: '#FF5A77',
  }
};
```

### Priority Color System
```javascript
const priorityColors = {
  high: {
    background: '#FEF2F2',    // Very light red
    border: '#FCA5A5',        // Light red
    text: '#DC2626',          // Dark red
  },
  medium: {
    background: '#FFFBEB',    // Very light yellow
    border: '#FDE68A',        // Light yellow
    text: '#D97706',          // Dark yellow
  },
  low: {
    background: '#F0FDF4',    // Very light green
    border: '#BBF7D0',        // Light green
    text: '#16A34A',          // Dark green
  }
};
```

---

## Typography

### Font Configuration
```javascript
// iOS and Android compatible fonts
const fonts = {
  // Primary: System fonts that match Inter's characteristics
  ios: {
    regular: 'SF Pro Text',
    medium: 'SF Pro Text Medium',
    semibold: 'SF Pro Text Semibold',
    bold: 'SF Pro Text Bold',
  },
  android: {
    regular: 'Roboto',
    medium: 'Roboto Medium', 
    semibold: 'Roboto Medium',
    bold: 'Roboto Bold',
  },
  
  // Fallback to Inter if loaded as custom font
  custom: {
    regular: 'Inter',
    medium: 'Inter Medium',
    semibold: 'Inter SemiBold', 
    bold: 'Inter Bold',
  }
};

// Font sizes (matches web app)
const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};
```

### Text Styles
```javascript
const textStyles = {
  // Headers
  h1: {
    fontSize: fontSizes['3xl'],
    fontWeight: 'bold',
    lineHeight: 36,
  },
  h2: {
    fontSize: fontSizes['2xl'],
    fontWeight: '600',
    lineHeight: 28,
  },
  h3: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    lineHeight: 24,
  },
  
  // Body text
  body: {
    fontSize: fontSizes.base,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: fontSizes.base,
    fontWeight: '500',
    lineHeight: 24,
  },
  
  // Small text
  small: {
    fontSize: fontSizes.sm,
    fontWeight: '400',
    lineHeight: 20,
  },
  caption: {
    fontSize: fontSizes.xs,
    fontWeight: '400',
    lineHeight: 16,
  }
};
```

---

## Layout & Spacing

### Spacing System (8px Grid)
```javascript
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
  '5xl': 64,
};
```

### Border Radius
```javascript
const borderRadius = {
  none: 0,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 999,
};
```

### Shadows (iOS/Android Compatible)
```javascript
const shadows = {
  // Light shadow for cards
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2, // Android
  },
  
  // Medium shadow for modals
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8, // Android
  },
  
  // Strong shadow for FAB
  fab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8, // Android
  }
};
```

---

## Component Styles

### Card Components
```javascript
const cardStyles = {
  container: {
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.light.border,
    padding: spacing.lg,
    ...shadows.card,
  },
  
  // Task card specific
  taskCard: {
    marginBottom: spacing.md,
    // Add priority-based border color dynamically
  },
  
  // Hover effect equivalent (pressable)
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.8,
  }
};
```

### Button Styles
```javascript
const buttonStyles = {
  // Primary button
  primary: {
    backgroundColor: colors.dayBlue,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  primaryText: {
    color: '#FFFFFF',
    fontSize: fontSizes.base,
    fontWeight: '600',
  },
  
  // Secondary button
  secondary: {
    backgroundColor: colors.light.secondary,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  secondaryText: {
    color: colors.light.primary,
    fontSize: fontSizes.base,
    fontWeight: '600',
  },
  
  // FAB (Floating Action Button)
  fab: {
    position: 'absolute',
    bottom: spacing['2xl'],
    right: spacing['2xl'],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.dayBlue,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.fab,
  }
};
```

### Input Styles
```javascript
const inputStyles = {
  container: {
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.light.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSizes.base,
    color: colors.light.text,
  },
  
  focused: {
    borderColor: colors.dayBlue,
    borderWidth: 2,
  },
  
  error: {
    borderColor: colors.accentRed,
  }
};
```

---

## Touch Interactions

### Minimum Touch Targets
```javascript
const touchTargets = {
  minimum: 44,              // iOS minimum
  recommended: 48,          // Android recommended
  comfortable: 56,          // Comfortable for thumbs
};
```

### Gesture Configurations
```javascript
const gestures = {
  // Swipe sensitivity
  swipeThreshold: 50,
  
  // Long press duration
  longPressDuration: 500,
  
  // Animation durations
  animationDuration: {
    fast: 150,
    normal: 250,
    slow: 350,
  }
};
```

---

## Mobile-Specific Adaptations

### Safe Area Handling
```javascript
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SafeAreaStyle = () => {
  const insets = useSafeAreaInsets();
  
  return {
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };
};
```

### Platform-Specific Styles
```javascript
import { Platform } from 'react-native';

const platformStyles = {
  // iOS specific
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  // Android specific  
  android: {
    elevation: 4,
  },
  
  // Apply platform style
  card: {
    ...Platform.select({
      ios: platformStyles.ios,
      android: platformStyles.android,
    }),
  }
};
```

---

## Icon System

### Icon Sizes
```javascript
const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

// Usage with @expo/vector-icons
<MaterialIcons 
  name="check-circle" 
  size={iconSizes.md} 
  color={colors.light.success} 
/>
```

### Icon Color Mapping
```javascript
const iconColors = {
  primary: colors.light.text,
  secondary: colors.light.textSecondary,
  success: colors.accentGreen,
  warning: colors.accentYellow,
  error: colors.accentRed,
  brand: colors.dayBlue,
};
```

---

## Animation Guidelines

### Transition Timings
```javascript
import { Animated } from 'react-native';

const animations = {
  // Standard easing curves
  easeInOut: 'easeInOut',
  easeOut: 'easeOut',
  
  // Duration constants
  duration: {
    quick: 150,
    normal: 250,
    slow: 350,
  },
  
  // Common animations
  fadeIn: {
    opacity: 1,
    duration: 250,
  },
  
  slideUp: {
    transform: [{ translateY: 0 }],
    duration: 300,
  }
};
```

---

## Implementation Example

### Complete Theme Provider
```javascript
// ThemeContext.tsx
import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [theme, setTheme] = useState(deviceTheme || 'light');
  
  const colors = theme === 'dark' ? darkColors : lightColors;
  
  return (
    <ThemeContext.Provider value={{ theme, colors, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
```

This guide ensures your React Native mobile app maintains perfect visual consistency with the DayFuse web application while leveraging native mobile design patterns and performance optimizations.