import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { User, Mail, Lock, ChevronLeft, CheckCircle2 } from 'lucide-react-native';
import { signUpWithEmail } from '../lib/auth';
import { Colors, Radius, Spacing } from '../theme';
import type { AuthStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

export default function SignUpScreen() {
  const nav = useNavigation<Nav>();

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);

  function validate(): string | null {
    if (!name.trim())               return 'Please enter your full name.';
    if (!email.trim())              return 'Please enter your email address.';
    if (!email.includes('@'))       return 'Please enter a valid email address.';
    if (password.length < 8)        return 'Password must be at least 8 characters.';
    if (password !== confirm)       return 'Passwords don\'t match.';
    return null;
  }

  async function handleSignUp() {
    const error = validate();
    if (error) return Alert.alert('Check your details', error);

    setLoading(true);
    try {
      await signUpWithEmail(name.trim(), email.trim().toLowerCase(), password);
      setDone(true);
      // Supabase sends a confirmation email. User signs in after confirming.
      // If email confirmation is disabled in Dashboard, AuthContext fires
      // SIGNED_IN immediately and NavigationRoot shows MainTabs automatically.
    } catch (e: any) {
      Alert.alert('Sign up failed', e?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────

  if (done) {
    return (
      <View style={styles.successWrap}>
        <CheckCircle2 size={64} color={Colors.success} strokeWidth={1.5} />
        <Text style={styles.successTitle}>Check your email</Text>
        <Text style={styles.successBody}>
          We sent a confirmation link to{'\n'}
          <Text style={styles.successEmail}>{email.trim().toLowerCase()}</Text>
        </Text>
        <Text style={styles.successHint}>
          Click the link to activate your account, then come back to sign in.
        </Text>
        <TouchableOpacity style={styles.backToLoginBtn} onPress={() => nav.navigate('Login')}>
          <Text style={styles.backToLoginText}>Back to Sign in</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <TouchableOpacity style={styles.back} onPress={() => nav.goBack()} disabled={loading}>
          <ChevronLeft size={22} color={Colors.primary} strokeWidth={2} />
          <Text style={styles.backText}>Sign in</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join ForThem to start co-parenting smarter.</Text>
        </View>

        {/* Fields */}
        <View style={styles.form}>
          <Field
            icon={<User  size={16} color={Colors.textSecondary} strokeWidth={1.75} />}
            placeholder="Full name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            returnKeyType="next"
            editable={!loading}
          />
          <Field
            icon={<Mail size={16} color={Colors.textSecondary} strokeWidth={1.75} />}
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="next"
            editable={!loading}
          />
          <Field
            icon={<Lock size={16} color={Colors.textSecondary} strokeWidth={1.75} />}
            placeholder="Password (8+ characters)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="next"
            editable={!loading}
          />
          <Field
            icon={<Lock size={16} color={Colors.textSecondary} strokeWidth={1.75} />}
            placeholder="Confirm password"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleSignUp}
            editable={!loading}
          />

          {/* Password match indicator */}
          {confirm.length > 0 && (
            <Text style={[styles.matchHint, password === confirm ? styles.matchOk : styles.matchErr]}>
              {password === confirm ? '✓ Passwords match' : '✗ Passwords don\'t match'}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={handleSignUp}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.textInverse} size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>Create account</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Sign in link */}
        <View style={styles.signInRow}>
          <Text style={styles.signInLabel}>Already have an account? </Text>
          <TouchableOpacity onPress={() => nav.navigate('Login')} disabled={loading}>
            <Text style={styles.signInLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Field sub-component ───────────────────────────────────────────────────────

function Field({ icon, ...props }: { icon: React.ReactNode } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.inputWrap}>
      <View style={styles.inputIcon}>{icon}</View>
      <TextInput style={styles.input} placeholderTextColor={Colors.textDisabled} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex:      { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 60, paddingBottom: 40 },

  back:     { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 32 },
  backText: { fontSize: 15, fontWeight: '600', color: Colors.primary },

  header:   { marginBottom: 28 },
  title:    { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, marginTop: 6 },

  form: { gap: 12 },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    height: 52, backgroundColor: Colors.card,
    borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: { marginRight: 10 },
  input:     { flex: 1, fontSize: 15, color: Colors.textPrimary },

  matchHint: { fontSize: 12, fontWeight: '600', marginTop: -4 },
  matchOk:   { color: Colors.successText },
  matchErr:  { color: Colors.errorText },

  primaryBtn:     { height: 52, borderRadius: Radius.md, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: Colors.textInverse },
  btnDisabled:    { opacity: 0.55 },

  signInRow:   { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  signInLabel: { fontSize: 14, color: Colors.textSecondary },
  signInLink:  { fontSize: 14, fontWeight: '700', color: Colors.primary },

  // Success state
  successWrap:   { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 },
  successTitle:  { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, marginTop: 24, letterSpacing: -0.4 },
  successBody:   { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 22 },
  successEmail:  { fontWeight: '700', color: Colors.textPrimary },
  successHint:   { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginTop: 16, lineHeight: 20 },
  backToLoginBtn:{ marginTop: 36, height: 52, paddingHorizontal: 32, borderRadius: Radius.md, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  backToLoginText:{ fontSize: 15, fontWeight: '700', color: Colors.textInverse },
});
