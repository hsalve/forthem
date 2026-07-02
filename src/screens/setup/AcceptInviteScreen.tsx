import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Link2, ChevronLeft, CheckCircle2 } from 'lucide-react-native';
import { useAuth }              from '../../context/AuthContext';
import { useFamily }            from '../../context/FamilyContext';
import { getInvitationByToken, acceptInvitation } from '../../services/familyService';
import { Colors, Radius, Spacing, Typography, Shadows } from '../../theme';
import type { SetupStackParamList } from '../../navigation/RootNavigator';

type Nav   = NativeStackNavigationProp<SetupStackParamList, 'AcceptInvite'>;
type Route = RouteProp<SetupStackParamList, 'AcceptInvite'>;

export default function AcceptInviteScreen() {
  const nav        = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { user }   = useAuth();
  const { refresh } = useFamily();

  const [token,      setToken]      = useState(params.token ?? '');
  const [inviteInfo, setInviteInfo] = useState<{ familyName: string | null; email: string } | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [checking,   setChecking]   = useState(false);
  const [done,       setDone]       = useState(false);
  const [error,      setError]      = useState('');

  // If a token was passed via deep link, validate it immediately
  useEffect(() => {
    if (params.token) { handleCheck(params.token); }
  }, []);

  async function handleCheck(t = token) {
    const clean = t.trim();
    if (!clean) return;
    setChecking(true);
    setError('');
    try {
      const invite = await getInvitationByToken(clean);
      if (!invite) {
        setError('This invite link is invalid or has already expired.');
        setInviteInfo(null);
      } else {
        setInviteInfo({ familyName: invite.familyName, email: invite.email });
        setToken(clean);
      }
    } catch {
      setError('Could not check the invite. Please check your connection.');
    } finally {
      setChecking(false);
    }
  }

  async function handleAccept() {
    if (!token.trim() || !user) return;
    setLoading(true);
    try {
      await acceptInvitation(token.trim(), user.id);
      setDone(true);
      await refresh();   // FamilyContext updates → root nav switches to MainTabs
    } catch (e: any) {
      Alert.alert('Could not join', e?.message ?? 'Please try again.');
      setLoading(false);
    }
  }

  // ── Success ───────────────────────────────────────────────────────────────

  if (done) {
    return (
      <View style={styles.centreWrap}>
        <CheckCircle2 size={64} color={Colors.success} strokeWidth={1.5} />
        <Text style={styles.doneTitle}>You've joined!</Text>
        <Text style={styles.doneBody}>
          Welcome to <Text style={styles.bold}>{inviteInfo?.familyName ?? 'the family'}</Text>.
          Taking you to the app…
        </Text>
      </View>
    );
  }

  // ── Confirmed invite info ─────────────────────────────────────────────────

  if (inviteInfo) {
    return (
      <View style={styles.centreWrap}>
        <View style={styles.iconWrap}>
          <Link2 size={36} color={Colors.primary} strokeWidth={1.5} />
        </View>
        <Text style={styles.title}>You're invited!</Text>
        <Text style={styles.subtitle}>
          Join <Text style={styles.bold}>{inviteInfo.familyName ?? 'a family'}</Text> on ForThem.
        </Text>
        <View style={styles.emailChip}>
          <Text style={styles.emailChipText}>Invited via {inviteInfo.email}</Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, loading && styles.btnDisabled]}
          onPress={handleAccept}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.textInverse} size="small" />
          ) : (
            <Text style={styles.primaryBtnText}>Join family</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelRow} onPress={() => nav.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Token entry form ──────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        {/* Back */}
        <TouchableOpacity style={styles.back} onPress={() => nav.goBack()}>
          <ChevronLeft size={22} color={Colors.primary} strokeWidth={2} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.iconWrap}>
          <Link2 size={36} color={Colors.primary} strokeWidth={1.5} />
        </View>
        <Text style={styles.title}>Join a family</Text>
        <Text style={styles.subtitle}>
          Paste the invite link or token your co-parent shared with you.
        </Text>

        {/* Token input */}
        <Text style={styles.label}>INVITE LINK OR TOKEN</Text>
        <TextInput
          style={[styles.tokenInput, error ? styles.inputError : null]}
          placeholder="forthemapp://accept-invite?token=..."
          placeholderTextColor={Colors.textDisabled}
          value={token}
          onChangeText={t => { setToken(t); setError(''); setInviteInfo(null); }}
          autoCapitalize="none"
          autoCorrect={false}
          multiline
          editable={!checking}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.primaryBtn, { marginTop: Spacing.lg }, (!token.trim() || checking) && styles.btnDisabled]}
          onPress={() => handleCheck()}
          activeOpacity={0.85}
          disabled={!token.trim() || checking}
        >
          {checking ? (
            <ActivityIndicator color={Colors.textInverse} size="small" />
          ) : (
            <Text style={styles.primaryBtnText}>Check invite</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:        { flex: 1, backgroundColor: Colors.background },
  container:   { flex: 1, paddingHorizontal: 28, paddingTop: 60 },
  centreWrap:  { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },

  back:        { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 40 },
  backText:    { fontSize: 15, fontWeight: '600', color: Colors.primary },

  iconWrap:    { width: 72, height: 72, borderRadius: 20, backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title:       { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5, marginBottom: 10, textAlign: 'center' },
  subtitle:    { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, marginBottom: 24, textAlign: 'center' },
  bold:        { fontWeight: '700', color: Colors.textPrimary },

  emailChip:   { backgroundColor: Colors.neutralBg, borderRadius: Radius.sm, paddingVertical: 8, paddingHorizontal: 14, marginBottom: 28 },
  emailChipText:{ fontSize: 13, fontWeight: '500', color: Colors.textSecondary },

  label:       { ...Typography.label, marginBottom: 8 },
  tokenInput:  { minHeight: 80, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, padding: Spacing.md, fontSize: 14, color: Colors.textPrimary, textAlignVertical: 'top' },
  inputError:  { borderColor: Colors.error },
  errorText:   { fontSize: 13, color: Colors.errorText, marginTop: 6 },

  primaryBtn:     { height: 52, borderRadius: Radius.md, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', width: '100%' },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: Colors.textInverse },
  btnDisabled:    { opacity: 0.45 },

  cancelRow:   { marginTop: 16 },
  cancelText:  { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },

  // Done state
  doneTitle:   { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, marginTop: 24, letterSpacing: -0.4 },
  doneBody:    { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 22 },
});
