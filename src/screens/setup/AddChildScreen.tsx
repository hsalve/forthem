import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Baby, GraduationCap, CalendarDays } from 'lucide-react-native';
import { useFamily }  from '../../context/FamilyContext';
import { addChild }   from '../../services/familyService';
import { Colors, Radius, Spacing, Typography } from '../../theme';
import { StepProgress } from './SetupFamilyScreen';
import type { SetupStackParamList } from '../../navigation/RootNavigator';

type Nav   = NativeStackNavigationProp<SetupStackParamList, 'AddChild'>;
type Route = RouteProp<SetupStackParamList, 'AddChild'>;

export default function AddChildScreen() {
  const nav          = useNavigation<Nav>();
  const { params }   = useRoute<Route>();
  const { familyId } = params;
  const { refresh }  = useFamily();

  const [name,    setName]    = useState('');
  const [dob,     setDob]     = useState('');       // YYYY-MM-DD
  const [school,  setSchool]  = useState('');
  const [loading, setLoading] = useState(false);

  // Validate and reformat DOB input
  // Accepts YYYY-MM-DD or DD/MM/YYYY
  function parseDob(raw: string): string | null {
    const clean = raw.trim();
    // Already ISO format
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
    // DD/MM/YYYY → YYYY-MM-DD
    const parts = clean.split('/');
    if (parts.length === 3 && parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
    }
    return null;
  }

  async function handleAddChild() {
    if (!name.trim()) {
      return Alert.alert('Name required', "Please enter your child's name.");
    }

    let parsedDob: string | undefined;
    if (dob.trim()) {
      const result = parseDob(dob);
      if (!result) {
        return Alert.alert('Invalid date', 'Please use DD/MM/YYYY or YYYY-MM-DD format.');
      }
      // Basic sanity: must be in the past and not too far (200 years)
      const d = new Date(result);
      if (isNaN(d.getTime()) || d > new Date()) {
        return Alert.alert('Invalid date', 'Date of birth must be in the past.');
      }
      parsedDob = result;
    }

    setLoading(true);
    try {
      await addChild(familyId, {
        full_name:      name.trim(),
        date_of_birth:  parsedDob,
        school_name:    school.trim() || undefined,
      });

      // Refresh FamilyContext → familyId already set, kids now populated
      // RootNavigator will show MainTabs automatically
      await refresh();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not add child. Please try again.');
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
        <StepProgress current={3} total={3} />

        <View style={styles.iconWrap}>
          <Baby size={36} color={Colors.primary} strokeWidth={1.5} />
        </View>
        <Text style={styles.title}>Add your child</Text>
        <Text style={styles.subtitle}>
          This creates a shared profile both parents can see.
          You can add more children later.
        </Text>

        {/* Name */}
        <Text style={styles.label}>CHILD'S FULL NAME</Text>
        <View style={styles.inputWrap}>
          <Baby size={16} color={Colors.textSecondary} strokeWidth={1.75} />
          <TextInput
            style={styles.input}
            placeholder="e.g. Noah Smith"
            placeholderTextColor={Colors.textDisabled}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            returnKeyType="next"
            editable={!loading}
            autoFocus
          />
        </View>

        {/* Date of birth */}
        <Text style={[styles.label, { marginTop: Spacing.md }]}>DATE OF BIRTH</Text>
        <View style={styles.inputWrap}>
          <CalendarDays size={16} color={Colors.textSecondary} strokeWidth={1.75} />
          <TextInput
            style={styles.input}
            placeholder="DD/MM/YYYY or YYYY-MM-DD"
            placeholderTextColor={Colors.textDisabled}
            value={dob}
            onChangeText={setDob}
            keyboardType="numbers-and-punctuation"
            returnKeyType="next"
            editable={!loading}
          />
        </View>
        <Text style={styles.hint}>Optional — used to show age in the app</Text>

        {/* School */}
        <Text style={[styles.label, { marginTop: Spacing.md }]}>SCHOOL OR DAYCARE</Text>
        <View style={styles.inputWrap}>
          <GraduationCap size={16} color={Colors.textSecondary} strokeWidth={1.75} />
          <TextInput
            style={styles.input}
            placeholder="e.g. Riverside Primary School"
            placeholderTextColor={Colors.textDisabled}
            value={school}
            onChangeText={setSchool}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleAddChild}
            editable={!loading}
          />
        </View>
        <Text style={styles.hint}>Optional</Text>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.primaryBtn, (!name.trim() || loading) && styles.btnDisabled]}
          onPress={handleAddChild}
          activeOpacity={0.85}
          disabled={!name.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.textInverse} size="small" />
          ) : (
            <Text style={styles.primaryBtnText}>Add child &amp; get started →</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          You'll be taken to your home screen once the child is added.
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

  label:      { ...Typography.label, marginBottom: 8 },
  inputWrap:  { flexDirection: 'row', alignItems: 'center', height: 52, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: Spacing.md, gap: 10 },
  input:      { flex: 1, fontSize: 15, color: Colors.textPrimary },
  hint:       { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },

  primaryBtn:     { height: 52, borderRadius: Radius.md, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 32 },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: Colors.textInverse },
  btnDisabled:    { opacity: 0.45 },

  note:       { fontSize: 12, color: Colors.textDisabled, textAlign: 'center', marginTop: 14 },
});
