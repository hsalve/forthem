import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HeartHandshake, ChevronRight } from 'lucide-react-native';
import { useAuth }        from '../../context/AuthContext';
import { createFamily }   from '../../services/familyService';
import { Colors, Radius, Spacing, Typography, Shadows } from '../../theme';
import type { SetupStackParamList } from '../../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<SetupStackParamList, 'SetupFamily'>;

const DEFAULT_SPACE_NAME = 'Co-parenting space';

export default function SetupFamilyScreen() {
  const nav      = useNavigation<Nav>();
  const { user } = useAuth();

  const authName  = (user?.user_metadata?.full_name as string | undefined) ?? '';
  const firstName = authName.split(' ')[0] ?? '';

  const [displayName, setDisplayName] = useState(firstName);
  const [loading, setLoading]         = useState(false);

  async function handleCreate() {
    if (!user) return;

    setLoading(true);
    try {
      const familyId = await createFamily(DEFAULT_SPACE_NAME, user.id, displayName.trim() || firstName || null);
      nav.navigate('InvitePartner', { familyId, familyName: DEFAULT_SPACE_NAME });
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not set up your co-parenting space. Please try again.');
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
        <StepProgress current={1} total={3} />

        <View style={styles.iconWrap}>
          <HeartHandshake size={36} color={Colors.primary} strokeWidth={1.5} />
        </View>

        <Text style={styles.title}>Set up your co-parenting space</Text>
        <Text style={styles.subtitle}>
          We’ll create a private space for schedules, expenses, documents, and updates related to your child.
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>No family name needed</Text>
          <Text style={styles.infoText}>
            Co-parenting can already be sensitive. ForThem keeps the setup neutral and child-focused.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>YOUR NAME IN THE APP</Text>
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
          <Text style={styles.hint}>Use your first name or whatever feels comfortable.</Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, loading && styles.btnDisabled]}
          onPress={handleCreate}
          activeOpacity={0.85}
          disabled={loading}
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

        <TouchableOpacity
          style={styles.joinRow}
          onPress={() => nav.navigate('AcceptInvite', { token: '' })}
          disabled={loading}
        >
          <Text style={styles.joinText}>Have an invite code? </Text>
          <Text style={styles.joinLink}>Join a space →</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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

const styles = StyleSheet.create({
  flex:      { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 64, paddingBottom: 40 },

  iconWrap: { width: 72, height: 72, borderRadius: 20, backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title:    { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5, marginBottom: 10 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, marginBottom: 24 },

  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: 28,
    ...Shadows.sm,
  },
  infoTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  infoText:  { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },

  form:  { gap: 6 },
  label: { ...Typography.label, marginBottom: 6 },
  input: {
    height: 52, backgroundColor: Colors.card,
    borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, fontSize: 15, color: Colors.textPrimary,
  },
  hint: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },

  primaryBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: Radius.md, backgroundColor: Colors.primary, marginTop: 28 },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: Colors.textInverse },
  btnDisabled:    { opacity: 0.45 },

  joinRow:  { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  joinText: { fontSize: 14, color: Colors.textSecondary },
  joinLink: { fontSize: 14, fontWeight: '700', color: Colors.primary },
});
