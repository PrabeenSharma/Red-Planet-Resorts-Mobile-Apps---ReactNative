import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  EMAIL_REGEX,
  RegistrationPayload,
  updateRegistration,
} from '@/services/registration';
import {
  getRegistration,
  Registration,
  saveRegistration,
} from '@/utils/storage';

type Field = keyof RegistrationPayload;
type Errors = Partial<Record<Field, string>>;
type Status = { type: 'success' | 'error'; message: string } | null;

function validate(values: RegistrationPayload): Errors {
  const errors: Errors = {};
  if (!values.firstName.trim()) errors.firstName = 'First name is required.';
  if (!values.lastName.trim()) errors.lastName = 'Last name is required.';
  if (!values.callSign.trim()) errors.callSign = 'Call sign is required.';
  if (!values.city.trim()) errors.city = 'City is required.';
  if (!values.state.trim()) errors.state = 'State is required.';
  if (!values.country.trim()) errors.country = 'Country is required.';
  if (!values.email.trim()) errors.email = 'Email address is required.';
  else if (!EMAIL_REGEX.test(values.email.trim())) errors.email = 'Please enter a valid email address.';
  return errors;
}

const EMPTY_VALUES: RegistrationPayload = {
  firstName: '',
  lastName: '',
  callSign: '',
  city: '',
  state: '',
  country: '',
  email: '',
  nasaId: '',
  instagramHandle: '',
  discordUsername: '',
};

export default function AccountUpdateScreen() {
  const router = useRouter();
  const [values, setValues] = useState<RegistrationPayload>(EMPTY_VALUES);
  const [original, setOriginal] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>(null);

  const lastNameRef = useRef<TextInput>(null);
  const callSignRef = useRef<TextInput>(null);
  const cityRef = useRef<TextInput>(null);
  const stateRef = useRef<TextInput>(null);
  const countryRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const nasaRef = useRef<TextInput>(null);
  const instagramRef = useRef<TextInput>(null);
  const discordRef = useRef<TextInput>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await getRegistration();
        if (!mounted) return;
        if (!saved) {
          setStatus({
            type: 'error',
            message: 'No saved registration found on this device. Please register first.',
          });
          return;
        }
        setOriginal(saved);
        setValues({
          firstName: saved.firstName || '',
          lastName: saved.lastName || '',
          callSign: saved.callSign || '',
          city: saved.city || '',
          state: saved.state || '',
          country: saved.country || '',
          email: saved.email || '',
          nasaId: saved.nasaId || '',
          instagramHandle: saved.instagramHandle || '',
          discordUsername: saved.discordUsername || '',
        });
      } catch (err) {
        console.log('Account details load error:', err);
        if (mounted) setStatus({ type: 'error', message: 'Unable to load your saved account details.' });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const setField = (field: Field, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    if (status?.type === 'error') setStatus(null);
  };

  const handleSubmit = async () => {
    if (submitting || !original) return;

    const payload: RegistrationPayload = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      callSign: values.callSign.trim(),
      city: values.city.trim(),
      state: values.state.trim(),
      country: values.country.trim(),
      email: values.email.trim().toLowerCase(),
      nasaId: values.nasaId.trim().toUpperCase(),
      instagramHandle: values.instagramHandle.trim().replace(/^@/, ''),
      discordUsername: values.discordUsername.trim(),
    };

    const validationErrors = validate(payload);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) {
      setStatus({ type: 'error', message: 'Please fix the highlighted fields.' });
      return;
    }

    setSubmitting(true);
    setStatus(null);
    try {
      await updateRegistration(
        {
          currentEmail: original.email,
          currentCallSign: original.callSign,
          currentNasaId: original.nasaId || '',
        },
        payload
      );

      const updated: Registration = {
        ...payload,
        registeredAt: original.registeredAt,
      };
      await saveRegistration(updated);
      setOriginal(updated);
      setStatus({ type: 'success', message: 'Your account details have been updated successfully.' });
    } catch (err: any) {
      setStatus({
        type: 'error',
        message: err?.message || 'Account update failed. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F6D78B" />
        <Text style={styles.loadingText}>Loading account details...</Text>
      </View>
    );
  }

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
        <View style={styles.formContainer}>
          <Text style={styles.title}>Account Update</Text>
          <Text style={styles.subtitle}>Review and update your registration information</Text>

          <FormField label="First Name" required value={values.firstName}
            error={errors.firstName} onChangeText={v => setField('firstName', v)}
            placeholder="Enter your first name" autoCapitalize="words"
            returnKeyType="next" onSubmitEditing={() => lastNameRef.current?.focus()}
            editable={!submitting} />
          <FormField ref={lastNameRef} label="Last Name" required value={values.lastName}
            error={errors.lastName} onChangeText={v => setField('lastName', v)}
            placeholder="Enter your last name" autoCapitalize="words"
            returnKeyType="next" onSubmitEditing={() => callSignRef.current?.focus()}
            editable={!submitting} />
          <FormField ref={callSignRef} label="Call Sign" required value={values.callSign}
            error={errors.callSign} onChangeText={v => setField('callSign', v)}
            placeholder="Enter your call sign" autoCapitalize="characters"
            returnKeyType="next" onSubmitEditing={() => cityRef.current?.focus()}
            editable={!submitting} />
          <FormField ref={cityRef} label="City" required value={values.city}
            error={errors.city} onChangeText={v => setField('city', v)}
            placeholder="Enter your city" autoCapitalize="words"
            returnKeyType="next" onSubmitEditing={() => stateRef.current?.focus()}
            editable={!submitting} />
          <FormField ref={stateRef} label="State" required value={values.state}
            error={errors.state} onChangeText={v => setField('state', v)}
            placeholder="Enter your state" autoCapitalize="words"
            returnKeyType="next" onSubmitEditing={() => countryRef.current?.focus()}
            editable={!submitting} />
          <FormField ref={countryRef} label="Country" required value={values.country}
            error={errors.country} onChangeText={v => setField('country', v)}
            placeholder="Enter your country" autoCapitalize="words"
            returnKeyType="next" onSubmitEditing={() => emailRef.current?.focus()}
            editable={!submitting} />
          <FormField ref={emailRef} label="Email Address" required value={values.email}
            error={errors.email} onChangeText={v => setField('email', v)}
            placeholder="jane@example.com" keyboardType="email-address"
            autoCapitalize="none" autoCorrect={false} returnKeyType="next"
            onSubmitEditing={() => nasaRef.current?.focus()} editable={!submitting} />
          <FormField ref={nasaRef} label="NASA ID" value={values.nasaId}
            error={errors.nasaId} onChangeText={v => setField('nasaId', v)}
            placeholder="Located on your ticket" autoCapitalize="characters"
            autoCorrect={false} returnKeyType="next"
            onSubmitEditing={() => instagramRef.current?.focus()} editable={!submitting} />
          <Text style={styles.hint}>Have a ticket already?{"\n"}Your NASA ID is printed on it!</Text>
          <FormField ref={instagramRef} label="Instagram Handle" value={values.instagramHandle}
            error={errors.instagramHandle} onChangeText={v => setField('instagramHandle', v)}
            placeholder="yourusername" autoCapitalize="none" autoCorrect={false}
            returnKeyType="next" onSubmitEditing={() => discordRef.current?.focus()}
            editable={!submitting} />
          <FormField ref={discordRef} label="Discord Username" value={values.discordUsername}
            error={errors.discordUsername} onChangeText={v => setField('discordUsername', v)}
            placeholder="Enter your Discord username" autoCapitalize="none"
            autoCorrect={false} returnKeyType="done" onSubmitEditing={handleSubmit}
            editable={!submitting} />

          {status && (
            <View style={[styles.statusBox, status.type === 'success' ? styles.statusSuccess : styles.statusError]}>
              <Text style={[styles.statusText, { color: status.type === 'success' ? '#7CFFB2' : '#FF8A80' }]}>
                {status.message}
              </Text>
            </View>
          )}

          <TouchableOpacity activeOpacity={0.8} onPress={handleSubmit}
            disabled={submitting || !original} style={{ width: '100%', marginTop: 8, opacity: submitting || !original ? 0.6 : 1 }}>
            <LinearGradient colors={['#0C2046', '#004F99']} locations={[0.1624, 0.816]}
              start={{ x: 0.85, y: 0.15 }} end={{ x: 0.15, y: 0.85 }} style={styles.submitButton}>
              {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitText}>Update Account</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type FormFieldProps = TextInputProps & {
  label: string;
  required?: boolean;
  error?: string;
  ref?: React.Ref<TextInput>;
};

function FormField({ label, required, error, ref, style, ...inputProps }: FormFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}{required ? <Text style={styles.required}> *</Text> : null}</Text>
      <TextInput
        ref={ref}
        {...inputProps}
        placeholderTextColor="rgba(204, 246, 255, 0.35)"
        onFocus={e => { setFocused(true); inputProps.onFocus?.(e); }}
        onBlur={e => { setFocused(false); inputProps.onBlur?.(e); }}
        style={[styles.input, focused && styles.inputFocused, !!error && styles.inputError, style]}
        accessibilityLabel={label}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  formContainer: { width: '100%', maxWidth: 500 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { color: '#CCF6FF', marginTop: 12, fontFamily: 'Audiowide_400Regular', fontSize: 12 },
  title: { color: '#fff', fontFamily: 'Audiowide_400Regular', fontSize: 25, lineHeight: 32, textAlign: 'center', textTransform: 'uppercase', marginBottom: 12 },
  subtitle: { color: '#CCF6FF', fontFamily: 'Audiowide_400Regular', fontSize: 10, lineHeight: 18, textAlign: 'center', marginBottom: 28 },
  field: { marginBottom: 16 },
  label: { color: '#CCF6FF', fontFamily: 'Audiowide_400Regular', fontSize: 11, textTransform: 'uppercase', marginBottom: 8 },
  required: { color: '#F6D78B' },
  input: { minHeight: 48, borderRadius: 6, borderWidth: 1, borderColor: '#658187', backgroundColor: 'rgba(24, 58, 86, 0.25)', color: '#fff', paddingHorizontal: 14, paddingVertical: 12, fontSize: 12, fontFamily: 'Audiowide_400Regular' },
  inputFocused: { borderColor: '#658187' },
  inputError: { borderColor: '#FF6B6B' },
  errorText: { color: '#FF8A80', fontSize: 12, marginTop: 6, fontFamily: 'Audiowide_400Regular' },
  hint: { fontSize: 12, lineHeight: 19, color: '#fff', marginBottom: 28, fontFamily: 'Audiowide_400Regular' },
  statusBox: { borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 14 },
  statusSuccess: { borderColor: 'rgba(124, 255, 178, 0.5)', backgroundColor: 'rgba(124, 255, 178, 0.08)' },
  statusError: { borderColor: 'rgba(255, 107, 107, 0.5)', backgroundColor: 'rgba(255, 107, 107, 0.08)' },
  statusText: { fontSize: 13, lineHeight: 19, textAlign: 'center', fontFamily: 'Audiowide_400Regular' },
  submitButton: { height: 55, borderRadius: 6, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 15, width: '100%' },
  submitText: { fontFamily: 'Audiowide_400Regular', fontSize: 15, textTransform: 'uppercase', color: '#fff' },
});
