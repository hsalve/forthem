import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Share, Platform,
  KeyboardAvoidingView, ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UserPlus, Copy, Share2, ChevronRight } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useAuth }           from '../../context/AuthContext';
import { createInvitation }  from '../../services/familyService';
import { Colors, Radius, Spacing, Typography, Shadows } from '../../theme';
import { StepProgress }      from './SetupFamilyScreen';
import type { SetupStackParamList } from '../../navigation/RootNavigator';

type Nav   = NativeStackNavigationProp<SetupStackParamList, 'InvitePartner'>;
type Route = RouteProp<SetupStackParamList, 'InvitePartner'>;

export default function InvitePartnerScreen() {
  const nav              = useNavigation<Nav>();
  const { params }       = useRoute<Route>();
  const { familyId, familyName } = params;
  const { user }         = useAuth();

  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied,  setCopied]  = useState(false);

  function goNext() {
    nav.navigate('AddChild', { familyId });
  }

  async function handleCreateInvite() {
    if (!email.trim() || !email.includes('@')) {
      return Alert.alert('Invalid email', 'Please enter your co-parent\'s email address.');
    }
    if (!user) return;

    setLoading(true);
    try {
      const invitation = await createInvitation(familyId, email.trim(), user.id);
      // Build the deep link they can tap to join
      const link = `forthemapp://accept-invite?token=${invitation.token}`;
      setInviteLink(link);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not create invite. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleShare() {
    if (!inviteLink) return;
    try {
      await Share.share({
        message: `Join me on ForThem to co-parent together 👨‍👩‍👧‍👦\n\nTap this link to join "${familyName}":\n${inviteLink}`,
        title:   'Join ForThem',
      });
    } catch {
      // User dismissed share sheet — not an error
    }
  }

  async function handleCopy() {
    if (!inviteLink) return;
    await Clipboard.setStringAsync(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  // ── After invite is created ───────────────────────────────────────────────

  if (inviteLink) {
    return (
      <View style={styles.container}>
        <StepProgress current={2} total={3} />
        <View style={styles.iconWrap}>
          <UserPlus size={36} color={Colors.success} strokeWidth={1.5} />
        </View>
        <Text style={styles.title}>Invite sent ✓</Text>
        <Text style={styles.subtitle}>
          Share this link with <Text style={styles.bold}>{email.trim()}</Text>.
          They'll tap it to join <Text style={styles.bold}>{familyName}</Text>.
        </Text>

        {/* Link display */}
        <View style={styles.linkCard}>
          <Text style={styles.linkText} numberOfLines={2}>{inviteLink}</Text>
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.85}>
          <Share2 size={18} color={Colors.textInverse} strokeWidth={2} />
          <Text style={styles.shareBtnText}>Share link</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.copyBtn} onPress={handleCopy} activeOpacity={0.85}>
          <Copy size={16} color={Colors.primary} strokeWidth={2} />
          <Text style={styles.copyBtnText}>{copied ? 'Copied!' : 'Copy link'}</Text>
        </TouchableOpacity>

        <Text style={styles.expiryNote}>Link expires in 7 days</Text>

        {/* Continue */}
        <TouchableOpacity style={styles.continueBtn} onPress={goNext} activeOpacity={0.85}>
          <Text style={styles.continueBtnText}>Continue</Text>
          <ChevronRight size={18} color={Colors.textInverse} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────

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
        <StepProgress current={2} total={3} />

        <View style={styles.iconWrap}>
          <UserPlus size={36} color={Colors.primary} strokeWidth={1.5} />
        </View>
        <Text style={styles.title}>Invite co-parent</Text>
        <Text style={styles.subtitle}>
          Enter your co-parent's email. We'll generate a secure invite link for them.
        </Text>

        <Text style={styles.label}>CO-PARENT'S EMAIL</Text>
        <TextInput
          style={styles.input}
          placeholder="their@email.com"
          placeholderTextColor={Colors.textDisabled}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="done"
          onSubmitEditing={handleCreateInvite}
          editable={!loading}
          autoFocus
        />

        <TouchableOpacity
          style={[styles.primaryBtn, (!email.trim() || loading) && styles.btnDisabled]}
          onPress={handleCreateInvite}
          activeOpacity={0.85}
          disabled={!email.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.textInverse} size="small" />
          ) : (
            <>
              <Text style={styles.primaryBtnText}>Create invite link</Text>
              <ChevronRight size={18} color={Colors.textInverse} strokeWidth={2.5} />
            </>
          )}
        </TouchableOpacity>

        {/* Skip */}
        <TouchableOpacity style={styles.skipRow} onPress={goNext} disabled={loading}>
          <Text style={styles.skipText}>Skip for now →</Text>
        </TouchableOpacity>

        <Text style={styles.skipHint}>
          You can always invite your co-parent later from the app.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:       { flex: 1, backgroundColor: Colors.background },
  container:  { flexGrow: 1, paddingHorizontal: 28, paddingTop: 64, paddingBottom: 40 },

  iconWrap:   { width: 72, height: 72, borderRadius: 20, backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title:      { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5, marginBottom: 10 },
  subtitle:   { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, marginBottom: 28 },
  bold:       { fontWeight: '700', color: Colors.textPrimary },

  label:      { ...Typography.label, marginBottom: 8 },
  input:      { height: 52, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: Spacing.md, fontSize: 15, color: Colors.textPrimary, marginBottom: 16 },

  primaryBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: Radius.md, backgroundColor: Colors.primary },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: Colors.textInverse },
  btnDisabled:    { opacity: 0.45 },

  skipRow:    { alignItems: 'center', marginTop: 20 },
  skipText:   { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  skipHint:   { fontSize: 12, color: Colors.textDisabled, textAlign: 'center', marginTop: 8 },

  // Link card
  linkCard:   { backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1.5, borderColor: Colors.border, marginBottom: Spacing.md, ...Shadows.card },
  linkText:   { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },

  shareBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: Radius.md, backgroundColor: Colors.primary, marginBottom: Spacing.sm },
  shareBtnText:{ fontSize: 15, fontWeight: '700', color: Colors.textInverse },

  copyBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.primary, marginBottom: Spacing.sm },
  copyBtnText:{ fontSize: 15, fontWeight: '600', color: Colors.primary },

  expiryNote: { fontSize: 12, color: Colors.textDisabled, textAlign: 'center', marginBottom: 28 },
  continueBtn:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: Radius.md, backgroundColor: Colors.primary },
  continueBtnText:{ fontSize: 15, fontWeight: '700', color: Colors.textInverse },
});
