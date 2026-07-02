import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Mail, ChevronLeft, Send } from 'lucide-react-native';
import { sendPasswordReset } from '../lib/auth';
import { Colors, Radius, Spacing } from '../theme';
import type { AuthStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen() {
  const nav = useNavigation<Nav>();

  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  async function handleReset() {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      return Alert.alert('Invalid email', 'Please enter a valid email address.');
    }

    setLoading(true);
    try {
      await sendPasswordReset(trimmed);
      setSent(true);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── Sent confirmation ──────────────────────────────────────────────────────

  if (sent) {
    return (
      <View style={styles.sentWrap}>
        <View style={styles.sentIconCircle}>
          <Send size={32} color={Colors.primary} strokeWidth={1.5} />
        </View>
        <Text style={styles.sentTitle}>Email sent</Text>
        <Text style={styles.sentBody}>
          We emailed a reset link to{'\n'}
          <Text style={styles.sentEmail}>{email.trim().toLowerCase()}</Text>
        </Text>
        <Text style={styles.sentHint}>
          Click the link in the email to set a new password. The link expires in 1 hour.
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => nav.navigate('Login')}>
          <Text style={styles.backBtnText}>Back to Sign in</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.resendBtn}
          onPress={() => { setSent(false); }}
        >
          <Text style={styles.resendText}>Didn't get it? Try again</Text>
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
      <View style={styles.container}>
        {/* Back */}
        <TouchableOpacity style={styles.back} onPress={() => nav.goBack()} disabled={loading}>
          <ChevronLeft size={22} color={Colors.primary} strokeWidth={2} />
          <Text style={styles.backText}>Sign in</Text>
        </TouchableOpacity>

        {/* Header */}
        <Text style={styles.title}>Forgot password?</Text>
        <Text style={styles.subtitle}>
          Enter the email address for your account and we'll send you a reset link.
        </Text>

        {/* Email input */}
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
            returnKeyType="done"
            onSubmitEditing={handleReset}
            editable={!loading}
            autoFocus
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.primaryBtn, (!email.trim() || loading) && styles.btnDisabled]}
          onPress={handleReset}
          activeOpacity={0.85}
          disabled={!email.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.textInverse} size="small" />
          ) : (
            <Text style={styles.primaryBtnText}>Send reset link</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:      { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 60 },

  back:     { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 40 },
  backText: { fontSize: 15, fontWeight: '600', color: Colors.primary },

  title:    { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5, marginBottom: 10 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, marginBottom: 28 },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    height: 52, backgroundColor: Colors.card,
    borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, marginBottom: 16,
  },
  inputIcon: { marginRight: 10 },
  input:     { flex: 1, fontSize: 15, color: Colors.textPrimary },

  primaryBtn:     { height: 52, borderRadius: Radius.md, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: Colors.textInverse },
  btnDisabled:    { opacity: 0.45 },

  // Sent state
  sentWrap:       { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 },
  sentIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  sentTitle:      { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.4 },
  sentBody:       { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 22 },
  sentEmail:      { fontWeight: '700', color: Colors.textPrimary },
  sentHint:       { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginTop: 16, lineHeight: 20 },
  backBtn:        { marginTop: 36, height: 52, paddingHorizontal: 32, borderRadius: Radius.md, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  backBtnText:    { fontSize: 15, fontWeight: '700', color: Colors.textInverse },
  resendBtn:      { marginTop: 16, padding: 8 },
  resendText:     { fontSize: 13, fontWeight: '600', color: Colors.primary },
});
