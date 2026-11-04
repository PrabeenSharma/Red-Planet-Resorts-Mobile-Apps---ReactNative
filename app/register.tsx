import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import GoldButton from '@/components/GoldButton';
import {
  EMAIL_REGEX,
  RegistrationPayload,
  submitRegistration,
  SubmitTarget,
  validateNasaId,
} from '@/services/registration';
import { saveRegistration } from '@/utils/storage';

type Field = keyof RegistrationPayload;
type Errors = Partial<Record<Field, string>>;
type Status = { type: 'success' | 'error'; message: string } | null;

const TARGET_LABELS: Record<SubmitTarget, string> = {
  wordpress: 'Red Planet Resorts server',
  googleSheet: 'Google Sheets',
};

function validate(values: RegistrationPayload): Errors {
  const errors: Errors = {};

  if (!values.fullName) errors.fullName = 'Full name is required.';
  else if (values.fullName.length < 2) errors.fullName = 'Please enter your full name.';

  if (!values.email) errors.email = 'Email address is required.';
  else if (!EMAIL_REGEX.test(values.email)) errors.email = 'Please enter a valid email address.';

  if (!values.address) errors.address = 'Address is required.';
  else if (values.address.length < 5) errors.address = 'Please enter your complete address.';

  return errors;
}

export default function RegisterScreen() {
  const router = useRouter();

  const [values, setValues] = useState<RegistrationPayload>({
    fullName: '',
    email: '',
    address: '',
    nasaId: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const submittingRef = useRef(false);
  const completedTargets = useRef<Set<SubmitTarget>>(new Set());
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const emailRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);
  const nasaRef = useRef<TextInput>(null);

  useEffect(() => () => {
    if (redirectTimer.current) clearTimeout(redirectTimer.current);
  }, []);

  const setField = (field: Field, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Edited data must be re-sent everywhere.
    completedTargets.current.clear();
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (status?.type === 'error') setStatus(null);
  };

  const handleSubmit = async () => {
    if (submittingRef.current || status?.type === 'success') return;

    const payload: RegistrationPayload = {
      fullName: values.fullName.trim().replace(/\s+/g, ' '),
      email: values.email.trim().toLowerCase(),
      address: values.address.trim(),
      nasaId: values.nasaId.trim().toUpperCase(),
    };

    const validationErrors = validate(payload);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) {
      setStatus({ type: 'error', message: 'Please fix the highlighted fields.' });
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setStatus(null);

    try {
      if (payload.nasaId) {
        let valid = false;
        try {
          valid = await validateNasaId(payload.nasaId);
        } catch (err: any) {
          setStatus({ type: 'error', message: err?.message || 'Unable to verify NASA ID. Please try again.' });
          return;
        }
        if (!valid) {
          setErrors((prev) => ({ ...prev, nasaId: 'This NASA ID was not found in our records.' }));
          setStatus({ type: 'error', message: 'NASA ID could not be verified.' });
          return;
        }
      }

      const { succeeded, errors: submitErrors } = await submitRegistration(
        payload,
        completedTargets.current,
      );
      succeeded.forEach((t) => completedTargets.current.add(t));

      if (submitErrors.length) {
        const details = submitErrors
          .map((e) => `${TARGET_LABELS[e.target]}: ${e.message}`)
          .join('\n');
        setStatus({
          type: 'error',
          message: `Registration could not be completed.\n${details}\nPlease try again.`,
        });
        return;
      }

      await saveRegistration({ ...payload, registeredAt: new Date().toISOString() });
      setStatus({ type: 'success', message: 'Registration successful! Preparing your mission...' });
      redirectTimer.current = setTimeout(() => router.replace('/ticket'), 1500);
    } catch (err: any) {
      setStatus({ type: 'error', message: err?.message || 'Something went wrong. Please try again.' });
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const done = status?.type === 'success';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.kicker}>Crew Registration</Text>
          <Text style={styles.title}>Join the Mission</Text>
          <Text style={styles.subtitle}>
            Register to access your Red Planet Resorts mission dashboard.
          </Text>

          <FormField
            label="Full Name"
            required
            value={values.fullName}
            error={errors.fullName}
            onChangeText={(v) => setField('fullName', v)}
            placeholder="Jane Doe"
            autoComplete="name"
            textContentType="name"
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
            editable={!submitting && !done}
            testID="input-fullName"
          />

          <FormField
            ref={emailRef}
            label="Email Address"
            required
            value={values.email}
            error={errors.email}
            onChangeText={(v) => setField('email', v)}
            placeholder="jane@example.com"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => addressRef.current?.focus()}
            editable={!submitting && !done}
            testID="input-email"
          />

          <FormField
            ref={addressRef}
            label="Address"
            required
            value={values.address}
            error={errors.address}
            onChangeText={(v) => setField('address', v)}
            placeholder="Street, City, State, ZIP"
            autoComplete="street-address"
            textContentType="fullStreetAddress"
            multiline
            numberOfLines={3}
            editable={!submitting && !done}
            testID="input-address"
          />

          <FormField
            ref={nasaRef}
            label="NASA ID"
            hint="Optional — verified against our crew records"
            value={values.nasaId}
            error={errors.nasaId}
            onChangeText={(v) => setField('nasaId', v)}
            placeholder="NASA-000000"
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            editable={!submitting && !done}
            testID="input-nasaId"
          />

          {status && (
            <View
              style={[styles.statusBox, status.type === 'success' ? styles.statusSuccess : styles.statusError]}
              accessibilityLiveRegion="polite"
            >
              <Text
                testID="register-status"
                style={[styles.statusText, { color: status.type === 'success' ? '#7CFFB2' : '#FF8A80' }]}
              >
                {status.message}
              </Text>
            </View>
          )}

          <GoldButton
            testID="register-submit"
            title={done ? 'Registered' : 'Register'}
            onPress={handleSubmit}
            loading={submitting}
            disabled={done}
            style={{ marginTop: 8 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type FormFieldProps = TextInputProps & {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  ref?: React.Ref<TextInput>;
};

function FormField({ label, required, error, hint, ref, multiline, style, ...inputProps }: FormFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <TextInput
        ref={ref}
        {...inputProps}
        multiline={multiline}
        placeholderTextColor="rgba(204, 246, 255, 0.35)"
        onFocus={(e) => {
          setFocused(true);
          inputProps.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          inputProps.onBlur?.(e);
        }}
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          focused && styles.inputFocused,
          !!error && styles.inputError,
          style,
        ]}
        accessibilityLabel={label}
      />
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    width: '100%',
    maxWidth: 520,
    padding: 22,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(246, 215, 139, 0.35)',
    backgroundColor: 'rgba(0, 8, 20, 0.72)',
  },
  kicker: {
    color: '#F6D78B',
    fontFamily: 'Audiowide_400Regular',
    fontSize: 11,
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#fff',
    fontFamily: 'Audiowide_400Regular',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#CCF6FF',
    fontFamily: 'Audiowide_400Regular',
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 22,
  },
  field: { marginBottom: 16 },
  label: {
    color: '#CCF6FF',
    fontFamily: 'Audiowide_400Regular',
    fontSize: 11,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  required: { color: '#F6D78B' },
  input: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(101, 129, 135, 1)',
    backgroundColor: 'rgba(24, 58, 86, 0.25)',
    color: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  inputMultiline: { minHeight: 84, textAlignVertical: 'top' },
  inputFocused: { borderColor: '#F6D78B' },
  inputError: { borderColor: '#FF6B6B' },
  errorText: { color: '#FF8A80', fontSize: 12, marginTop: 6 },
  hintText: { color: 'rgba(204, 246, 255, 0.55)', fontSize: 11, marginTop: 6 },
  statusBox: { borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 14 },
  statusSuccess: { borderColor: 'rgba(124, 255, 178, 0.5)', backgroundColor: 'rgba(124, 255, 178, 0.08)' },
  statusError: { borderColor: 'rgba(255, 107, 107, 0.5)', backgroundColor: 'rgba(255, 107, 107, 0.08)' },
  statusText: { fontSize: 13, lineHeight: 19, textAlign: 'center' },
});
