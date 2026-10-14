import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, spacing, radius, fontSize } from '../theme';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: boolean;
};

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error = false,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.input, error && styles.inputError]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, color: colors.textLight, marginBottom: spacing.xs },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
  },
  inputError: { borderColor: colors.error },
});