import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'gold' | 'blue';
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const GRADIENTS = {
  gold: ['#F6D78B', '#D4A63A', '#9C7420'] as const,
  blue: ['#0C2046', '#004F99'] as const,
};

export default function GoldButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'gold',
  style,
  testID,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrapper,
        variant === 'blue' && styles.wrapperBlue,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      <LinearGradient
        colors={GRADIENTS[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'gold' ? '#000' : '#fff'} />
        ) : (
          <Text style={[styles.text, variant === 'blue' && styles.textBlue]}>
            {title}
          </Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(246, 215, 139, 0.8)',
    shadowColor: '#D4A63A',
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  wrapperBlue: {
    borderColor: 'rgba(101, 129, 135, 1)',
    shadowColor: '#004F99',
  },
  gradient: {
    minHeight: 52,
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#000',
    fontFamily: 'Audiowide_400Regular',
    fontSize: 15,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  textBlue: { color: '#fff' },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  disabled: { opacity: 0.6 },
});
