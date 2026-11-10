
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
  submitRegistration,
  validateNasaId,
} from '@/services/registration';

import { saveRegistration } from '@/utils/storage';

type Field = keyof RegistrationPayload;

type Errors = Partial<Record<Field, string>>;

type Status = {
  type: 'success' | 'error';
  message: string;
} | null;


// Form validation
function validate(values: RegistrationPayload): Errors {
  const errors: Errors = {};

  if (!values.firstName) {
    errors.firstName = 'First name is required.';
  }

  if (!values.lastName) {
    errors.lastName = 'Last name is required.';
  }

  if (!values.callSign) {
    errors.callSign = 'Call sign is required.';
  }

  if (!values.city) {
    errors.city = 'City is required.';
  }

  if (!values.state) {
    errors.state = 'State is required.';
  }

  if (!values.country) {
    errors.country = 'Country is required.';
  }

  if (!values.email) {
    errors.email = 'Email address is required.';
  } else if (!EMAIL_REGEX.test(values.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  return errors;
}


export default function RegisterScreen() {
  const router = useRouter();

  const [values, setValues] = useState<RegistrationPayload>({
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
  });

  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const submittingRef = useRef(false);

  const redirectTimer =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  // Input refs
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
    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
      }
    };
  }, []);


  // Update form field
  const setField = (field: Field, value: string) => {

    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }

    if (status?.type === 'error') {
      setStatus(null);
    }
  };


  // Submit registration
  const handleSubmit = async () => {

    if (
      submittingRef.current ||
      status?.type === 'success'
    ) {
      return;
    }

    const payload: RegistrationPayload = {

      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      callSign: values.callSign.trim(),

      city: values.city.trim(),
      state: values.state.trim(),
      country: values.country.trim(),

      email: values.email.trim().toLowerCase(),

      nasaId: values.nasaId.trim().toUpperCase(),

      instagramHandle: values.instagramHandle
        .trim()
        .replace(/^@/, ''),

      discordUsername: values.discordUsername.trim(),

    };


    // Validate required fields
    const validationErrors = validate(payload);

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setStatus({
        type: 'error',
        message: 'Please fix the highlighted fields.',
      });

      return;
    }


    submittingRef.current = true;
    setSubmitting(true);
    setStatus(null);

    try {

      // Verify NASA ID only when provided
      if (payload.nasaId) {

        let valid = false;

        try {
          valid = await validateNasaId(payload.nasaId);

        } catch (err: any) {

          setStatus({
            type: 'error',
            message:
              err?.message ||
              'Unable to verify NASA ID. Please try again.',
          });

          return;
        }

        if (!valid) {

          setErrors((prev) => ({
            ...prev,
            nasaId: 'This NASA ID was not found in our records.',
          }));

          setStatus({
            type: 'error',
            message: 'NASA ID could not be verified.',
          });

          return;
        }
      }


      // Submit ONLY to WordPress
      await submitRegistration(payload);


      // Save registration locally
      await saveRegistration({
        ...payload,
        registeredAt: new Date().toISOString(),
      });


      // Success message
      setStatus({
        type: 'success',
        message:
          'Registration successful! Preparing your mission...',
      });


      // Navigate to Ticket page
      redirectTimer.current = setTimeout(() => {
        router.replace('/ticket');
      }, 1500);


    } catch (err: any) {

      setStatus({
        type: 'error',
        message:
          err?.message ||
          'Registration failed. Please try again.',
      });

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

        <View style={styles.formContainer}>

          <Text style={styles.title}>
            Mars Entry and Clearance Office
          </Text>


          {/* FIRST NAME */}
          <FormField
            label="First Name"
            required
            value={values.firstName}
            error={errors.firstName}
            onChangeText={(v) => setField('firstName', v)}
            placeholder="Enter your first name"
            autoComplete="given-name"
            textContentType="givenName"
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => lastNameRef.current?.focus()}
            editable={!submitting && !done}
            testID="input-firstName"
          />


          {/* LAST NAME */}
          <FormField
            ref={lastNameRef}
            label="Last Name"
            required
            value={values.lastName}
            error={errors.lastName}
            onChangeText={(v) => setField('lastName', v)}
            placeholder="Enter your last name"
            autoComplete="family-name"
            textContentType="familyName"
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => callSignRef.current?.focus()}
            editable={!submitting && !done}
            testID="input-lastName"
          />


          {/* CALL SIGN */}
          <FormField
            ref={callSignRef}
            label="Call Sign"
            required
            value={values.callSign}
            error={errors.callSign}
            onChangeText={(v) => setField('callSign', v)}
            placeholder="Enter your call sign"
            autoCapitalize="characters"
            returnKeyType="next"
            onSubmitEditing={() => cityRef.current?.focus()}
            editable={!submitting && !done}
            testID="input-callSign"
          />


          {/* CITY */}
          <FormField
            ref={cityRef}
            label="City"
            required
            value={values.city}
            error={errors.city}
            onChangeText={(v) => setField('city', v)}
            placeholder="Enter your city"
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => stateRef.current?.focus()}
            editable={!submitting && !done}
            testID="input-city"
          />


          {/* STATE */}
          <FormField
            ref={stateRef}
            label="State"
            required
            value={values.state}
            error={errors.state}
            onChangeText={(v) => setField('state', v)}
            placeholder="Enter your state"
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => countryRef.current?.focus()}
            editable={!submitting && !done}
            testID="input-state"
          />


          {/* COUNTRY */}
          <FormField
            ref={countryRef}
            label="Country"
            required
            value={values.country}
            error={errors.country}
            onChangeText={(v) => setField('country', v)}
            placeholder="Enter your country"
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
            editable={!submitting && !done}
            testID="input-country"
          />


          {/* EMAIL */}
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
            onSubmitEditing={() => nasaRef.current?.focus()}
            editable={!submitting && !done}
            testID="input-email"
          />


          {/* NASA ID */}
          <FormField
            ref={nasaRef}
            label="NASA ID"
            value={values.nasaId}
            error={errors.nasaId}
            onChangeText={(v) => setField('nasaId', v)}
            placeholder="Located on your ticket"
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => instagramRef.current?.focus()}
            editable={!submitting && !done}
            testID="input-nasaId"
          />

          <Text style={styles.hint}>
            Have a ticket already?{"\n"}
            Your NASA ID is printed on it!
          </Text>

          {/* INSTAGRAM */}
          <FormField
            ref={instagramRef}
            label="Instagram Handle"
            hint="Optional — without @"
            value={values.instagramHandle}
            error={errors.instagramHandle}
            onChangeText={(v) => setField('instagramHandle', v)}
            placeholder="yourusername"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => discordRef.current?.focus()}
            editable={!submitting && !done}
            testID="input-instagram"
          />


          {/* DISCORD */}
          <FormField
            ref={discordRef}
            label="Discord Username"
            hint="Optional"
            value={values.discordUsername}
            error={errors.discordUsername}
            onChangeText={(v) => setField('discordUsername', v)}
            placeholder="Enter your Discord username"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            editable={!submitting && !done}
            testID="input-discord"
          />


          {/* STATUS MESSAGE */}
          {status && (
            <View
              style={[
                styles.statusBox,
                status.type === 'success'
                  ? styles.statusSuccess
                  : styles.statusError,
              ]}
              accessibilityLiveRegion="polite"
            >
              <Text
                testID="register-status"
                style={[
                  styles.statusText,
                  {
                    color:
                      status.type === 'success'
                        ? '#7CFFB2'
                        : '#FF8A80',
                  },
                ]}
              >
                {status.message}
              </Text>
            </View>
          )}


         <TouchableOpacity
          testID="register-submit"
          activeOpacity={0.8}
          onPress={handleSubmit}
          disabled={submitting || done}
          style={{
            width: '100%',
            marginTop: 8,
            opacity: submitting || done ? 0.6 : 1,
          }}
        >
          <LinearGradient
            colors={['#0C2046', '#004F99']}
            locations={[0.1624, 0.816]}
            start={{ x: 0.85, y: 0.15 }}
            end={{ x: 0.15, y: 0.85 }}
            style={styles.optionGradient}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.optionText}>
                {done ? 'Registered' : 'Register'}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        </View>

      </ScrollView>

    </KeyboardAvoidingView>
  );
}


// Reusable Form Field
type FormFieldProps = TextInputProps & {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  ref?: React.Ref<TextInput>;
};


function FormField({
  label,
  required,
  error,
  hint,
  ref,
  multiline,
  style,
  ...inputProps
}: FormFieldProps) {

  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>

      <Text style={styles.label}>
        {label}

        {required ? (
          <Text style={styles.required}> *</Text>
        ) : null}
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
        <Text style={styles.errorText}>
          {error}
        </Text>
      ) : hint ? (
        <Text style={styles.hintText}>
          {hint}
        </Text>
      ) : null}

    </View>
  );
}


// Styles
const styles = StyleSheet.create({

  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  formContainer: {
    width: '100%',
    maxWidth: 500,
  },

  title: {
    color: '#fff',
    fontFamily: 'Audiowide_400Regular',
    fontSize: 25,
    lineHeight: 30,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 40,
    fontWeight: '400',
  },

  field: {
    marginBottom: 16,
  },

  label: {
    color: '#CCF6FF',
    fontFamily: 'Audiowide_400Regular',
    fontSize: 11,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  required: {
    color: '#F6D78B',
  },

  input: {
    minHeight: 48,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#658187',
    backgroundColor: 'rgba(24, 58, 86, 0.25)',
    color: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 12,
    fontFamily: 'Audiowide_400Regular',
  },

  inputMultiline: {
    minHeight: 84,
    textAlignVertical: 'top',
  },

  inputFocused: {
    borderColor: '#658187',
  },

  inputError: {
    borderColor: '#FF6B6B',
  },

  errorText: {
    color: '#FF8A80',
    fontSize: 12,
    marginTop: 6,
    fontFamily: 'Audiowide_400Regular',
  },

  hintText: {
    color: 'rgba(204, 246, 255, 0.55)',
    fontSize: 11,
    marginTop: 6,
    fontFamily: 'Audiowide_400Regular',
  },

  statusBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
  },

  statusSuccess: {
    borderColor: 'rgba(124, 255, 178, 0.5)',
    backgroundColor: 'rgba(124, 255, 178, 0.08)',
  },

  statusError: {
    borderColor: 'rgba(255, 107, 107, 0.5)',
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
  },

  statusText: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    fontFamily: 'Audiowide_400Regular',
  },
  hint:{
    fontSize:12, lineHeight:19, color:'#fff', marginBottom:28,  fontFamily: 'Audiowide_400Regular',
  },
  optionGradient: { height: 55,  borderRadius: 6, justifyContent: 'center', alignItems: 'center', paddingHorizontal:15, width:'100%', },
  optionText: {  fontFamily: 'Audiowide_400Regular',  fontSize: 16,  textTransform: 'uppercase',  color: '#fff',},


});
