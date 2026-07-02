import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Home, User, ChevronRight } from 'lucide-react-native';
import { useAuth }        from '../../context/AuthContext';
import { createFamily }   from '../../services/familyService';
import { Colors, Radius, Spacing, Typography, Shadows } from '../../theme';
import type { SetupStackParamList } from '../../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<SetupStackParamList, 'SetupFamily'>;

export default function SetupFamilyScreen() {
  const nav           = useNavigation<Nav>();
  const { user }      = useAuth();

  // Pre-fill display name from auth metadata
  const authName      = (user?.user_metadata?.full_name as string | undefined) ?? '';
  const firstName     = authName.split(' ')[0] ?? '';

  const [familyName,   setFamilyName]   = useState('');
  const [displayName,  setDisplayName]  = useState(firstName);
  const [loading,      setLoading]      = useState(false);

  async function handleCreate() {
    if (!familyName.trim()) {
      return Alert.alert('Family name required', 'Please enter a name for your family.');
    }
    if (!user) return;

    setLoading(true);
    try {
      const familyId = await createFamily(familyName.trim(), user.id, displayName.trim() || firstName);
      nav.navigate('InvitePartner', { familyId, familyName: familyName.trim() });
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not create family. Please try again.');
    } finally {
      setLoading(false);
    }
  }

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
        {/* Progress */}
        <StepProgress current={1} total={3} />

        {/* Header */}
        <View style={styles.iconWrap}>
          <Home size={36} color={Colors.primary} strokeWidth={1.5} />
        </View>
        <Text style={styles.title}>Create your family</Text>
        <Text style={styles.subtitle}>
          Give your co-parenting family a name. Both parents will see this.
        </Text>

        {/* Fields */}
        <View style={styles.form}>
          <Text style={styles.label}>FAMILY NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. The Smith Family"
            placeholderTextColor={Colors.textDisabled}
            value={familyName}
            onChangeText={setFamilyName}
            autoCapitalize="words"
            returnKeyType="next"
            editable={!loading}
            autoFocus
          />

          <Text style={[styles.label, { marginTop: Spacing.md }]}>YOUR NAME IN THE APP</Text>
          <TextInput
            style={styles.input}
            placeholder="How you appear to your co-parent"
            placeholderTextColor={Colors.textDisabled}
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleCreate}
            editable={!loading}
          />
          <Text style={styles.hint}>e.g. "Dad", "Mum", or just your first name</Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.primaryBtn, (!familyName.trim() || loading) && styles.btnDisabled]}
          onPress={handleCreate}
          activeOpacity={0.85}
          disabled={!familyName.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.textInverse} size="small" />
          ) : (
            <>
              <Text style={styles.primaryBtnText}>Continue</Text>
              <ChevronRight size={18} color={Colors.textInverse} strokeWidth={2.5} />
            </>
          )}
        </TouchableOpacity>

        {/* Join existing */}
        <TouchableOpacity
          style={styles.joinRow}
          onPress={() => nav.navigate('AcceptInvite', { token: '' })}
          disabled={loading}
        >
          <Text style={styles.joinText}>Have an invite code? </Text>
          <Text style={styles.joinLink}>Join a family →</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Step progress indicator (shared across setup screens) ─────────────────────

export function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <View style={stepStyles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            stepStyles.dot,
            i < current ? stepStyles.dotDone : i === current - 1 ? stepStyles.dotActive : stepStyles.dotFuture,
          ]}
        />
      ))}
      <Text style={stepStyles.label}>Step {current} of {total}</Text>
    </View>
  );
}

const stepStyles = StyleSheet.create({
  row:        { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 36 },
  dot:        { height: 6, borderRadius: 3 },
  dotActive:  { width: 20, backgroundColor: Colors.primary },
  dotDone:    { width: 20, backgroundColor: Colors.primary + '60' },
  dotFuture:  { width: 6,  backgroundColor: Colors.border },
  label:      { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginLeft: 6 },
});

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex:        { flex: 1, backgroundColor: Colors.background },
  container:   { flexGrow: 1, paddingHorizontal: 28, paddingTop: 64, paddingBottom: 40 },

  iconWrap:    { width: 72, height: 72, borderRadius: 20, backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title:       { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5, marginBottom: 10 },
  subtitle:    { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, marginBottom: 32 },

  form:        { gap: 6 },
  label:       { ...Typography.label, marginBottom: 6 },
  input: {
    height: 52, backgroundColor: Colors.card,
    borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, fontSize: 15, color: Colors.textPrimary,
  },
  hint:        { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },

  primaryBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: Radius.md, backgroundColor: Colors.primary, marginTop: 28 },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: Colors.textInverse },
  btnDisabled:    { opacity: 0.45 },

  joinRow:     { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  joinText:    { fontSize: 14, color: Colors.textSecondary },
  joinLink:    { fontSize: 14, fontWeight: '700', color: Colors.primary },
});
