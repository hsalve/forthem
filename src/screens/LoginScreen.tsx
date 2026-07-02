import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Mail, Lock } from 'lucide-react-native';
import { signInWithEmail, signInWithGoogle } from '../lib/auth';
import { Colors, Radius, Spacing, Typography } from '../theme';
import type { AuthStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const nav = useNavigation<Nav>();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [gLoading, setGLoading] = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────

  function showError(msg: string) {
    Alert.alert('Sign in failed', msg, [{ text: 'OK' }]);
  }

  // ── Email sign-in ──────────────────────────────────────────────────────────

  async function handleEmailSignIn() {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) return showError('Please enter your email address.');
    if (!password)     return showError('Please enter your password.');

    setLoading(true);
    try {
      await signInWithEmail(trimmedEmail, password);
      // AuthContext picks up SIGNED_IN → NavigationRoot renders MainTabs
    } catch (e: any) {
      showError(e?.message ?? 'Sign in failed. Check your email and password.');
    } finally {
      setLoading(false);
    }
  }

  // ── Google sign-in ─────────────────────────────────────────────────────────

  async function handleGoogleSignIn() {
    setGLoading(true);
    try {
      await signInWithGoogle();
    } catch (e: any) {
      showError(e?.message ?? 'Google sign in failed. Please try again.');
    } finally {
      setGLoading(false);
    }
  }

  const isLoading = loading || gLoading;

  // ── Render ─────────────────────────────────────────────────────────────────

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
        {/* Identity */}
        <View style={styles.header}>
          <Text style={styles.logo}>👨‍👩‍👧‍👦</Text>
          <Text style={styles.appName}>ForThem</Text>
          <Text style={styles.tagline}>Co-parenting, simplified.</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Email */}
          <View style={styles.inputWrap}>
            <Mail size={16} color={Colors.textSecondary} strokeWidth={1.75} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={Colors.textDisabled}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              returnKeyType="next"
              editable={!isLoading}
            />
          </View>

          {/* Password */}
          <View style={styles.inputWrap}>
            <Lock size={16} color={Colors.textSecondary} strokeWidth={1.75} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.textDisabled}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleEmailSignIn}
              editable={!isLoading}
            />
          </View>

          {/* Forgot password */}
          <TouchableOpacity
            onPress={() => nav.navigate('ForgotPassword')}
            style={styles.forgotWrap}
            disabled={isLoading}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Sign in button */}
          <TouchableOpacity
            style={[styles.primaryBtn, isLoading && styles.btnDisabled]}
            onPress={handleEmailSignIn}
            activeOpacity={0.85}
            disabled={isLoading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.textInverse} size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>Sign in</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerLabel}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google */}
        <TouchableOpacity
          style={[styles.googleBtn, isLoading && styles.btnDisabled]}
          onPress={handleGoogleSignIn}
          activeOpacity={0.85}
          disabled={isLoading}
        >
          {gLoading ? (
            <ActivityIndicator color={Colors.primary} size="small" />
          ) : (
            <>
              <Text style={styles.googleG}>G</Text>
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Sign up link */}
        <View style={styles.signUpRow}>
          <Text style={styles.signUpLabel}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => nav.navigate('SignUp')} disabled={isLoading}>
            <Text style={styles.signUpLink}>Create one</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:      { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 40 },

  header:  { alignItems: 'center', marginBottom: 36 },
  logo:    { fontSize: 56, marginBottom: 12 },
  appName: { fontSize: 32, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.8 },
  tagline: { fontSize: 15, color: Colors.textSecondary, marginTop: 6 },

  form: { gap: 12 },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    height: 52, backgroundColor: Colors.card,
    borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: { marginRight: 10 },
  input:     { flex: 1, fontSize: 15, color: Colors.textPrimary },

  forgotWrap: { alignSelf: 'flex-end', paddingVertical: 2 },
  forgotText: { fontSize: 13, fontWeight: '600', color: Colors.primary },

  primaryBtn: {
    height: 52, borderRadius: Radius.md, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: Colors.textInverse },
  btnDisabled:    { opacity: 0.55 },

  dividerRow:  { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerLabel:{ fontSize: 12, fontWeight: '600', color: Colors.textSecondary },

  googleBtn: {
    height: 52, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.card,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  googleG:       { fontSize: 17, fontWeight: '800', color: '#4285F4' },
  googleBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },

  signUpRow:   { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  signUpLabel: { fontSize: 14, color: Colors.textSecondary },
  signUpLink:  { fontSize: 14, fontWeight: '700', color: Colors.primary },
});
