import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Baby, FileText, LogOut, Mail, Pencil, Plus, User } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { useFamily } from '../context/FamilyContext';
import { addChild, updateChild, updateParentProfile } from '../services/familyService';
import { Child } from '../lib/database.types';
import { Card, Icon, SectionHeader } from '../components';
import { Colors, Layout, Radius, Shadows, Spacing, Typography } from '../theme';
import type { MainStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'Profile'>;
type ChildForm = { full_name: string; date_of_birth: string; school_name: string; notes: string };

const emptyChild: ChildForm = { full_name: '', date_of_birth: '', school_name: '', notes: '' };

function initial(value?: string | null) { return value?.trim()?.[0]?.toUpperCase() ?? 'P'; }

function ageText(dob?: string | null) {
  if (!dob) return 'Date of birth not set';
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return dob;
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) years--;
  if (years <= 0) return 'Under 1 year old';
  return `${years} year${years === 1 ? '' : 's'} old`;
}

export default function ProfileScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();
  const { familyName, familyId, children, refresh } = useFamily();

  const email = user?.email ?? 'No email available';
  const displayName = (user?.user_metadata?.full_name as string | undefined) || email.split('@')[0] || 'Parent';

  const [profileOpen, setProfileOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState(displayName);
  const [childOpen, setChildOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [childForm, setChildForm] = useState<ChildForm>(emptyChild);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setNameDraft(displayName); }, [displayName]);

  function openAddChild() {
    setEditingChild(null);
    setChildForm(emptyChild);
    setChildOpen(true);
  }

  function openEditChild(child: Child) {
    setEditingChild(child);
    setChildForm({
      full_name: child.full_name ?? '',
      date_of_birth: child.date_of_birth ?? '',
      school_name: child.school_name ?? '',
      notes: child.notes ?? '',
    });
    setChildOpen(true);
  }

  async function saveParent() {
    if (!user) return;
    const clean = nameDraft.trim();
    if (!clean) return Alert.alert('Name required', 'Please enter your name.');
    setSaving(true);
    try {
      await updateParentProfile(user.id, clean);
      setProfileOpen(false);
      Alert.alert('Saved', 'Your profile was updated.');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not update profile.');
    } finally { setSaving(false); }
  }

  async function saveChild() {
    if (!familyId) return;
    const cleanName = childForm.full_name.trim();
    if (!cleanName) return Alert.alert('Child name required', 'Please enter your child’s name.');
    setSaving(true);
    try {
      const payload = {
        full_name: cleanName,
        date_of_birth: childForm.date_of_birth.trim() || undefined,
        school_name: childForm.school_name.trim() || undefined,
        notes: childForm.notes.trim() || undefined,
      };
      if (editingChild) await updateChild(editingChild.id, payload);
      else await addChild(familyId, payload);
      await refresh();
      setChildOpen(false);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not save child profile.');
    } finally { setSaving(false); }
  }

  function handleSignOut() {
    Alert.alert('Sign out?', 'You can sign back in anytime.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topbar}>
          <TouchableOpacity style={styles.circleBtn} onPress={() => navigation.goBack()} activeOpacity={0.75}>
            <Icon icon={ArrowLeft} size="sm" color={Colors.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.title}>Profile</Text>
          <View style={styles.circleBtnGhost} />
        </View>

        <Card style={styles.profileCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{initial(displayName)}</Text></View>
          <View style={styles.flex1}>
            <Text style={styles.name}>{displayName}</Text>
            <View style={styles.rowSmall}><Icon icon={Mail} size="xs" color={Colors.textSecondary} strokeWidth={1.8} /><Text style={styles.muted}>{email}</Text></View>
          </View>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setProfileOpen(true)} activeOpacity={0.75}>
            <Icon icon={Pencil} size="sm" color={Colors.primary} strokeWidth={1.9} />
          </TouchableOpacity>
        </Card>

        <SectionHeader title="Co-parenting space" style={styles.section} />
        <Card style={styles.rowCard}>
          <View style={styles.softIcon}><Icon icon={User} size="md" color={Colors.primary} strokeWidth={1.8} /></View>
          <View style={styles.flex1}>
            <Text style={styles.cardTitle}>{familyName || 'Your space'}</Text>
            <Text style={styles.muted}>{children.length} child{children.length === 1 ? '' : 'ren'} connected</Text>
          </View>
        </Card>

        <SectionHeader title="Children" action="Add child" onAction={openAddChild} style={styles.section} />
        {children.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.cardTitle}>Add your child when you’re ready</Text>
            <Text style={styles.bodyText}>Start with only a name. Details like school, notes, and documents can be added later.</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={openAddChild} activeOpacity={0.8}>
              <Icon icon={Plus} size="sm" color="#FFFFFF" strokeWidth={2} /><Text style={styles.primaryButtonText}>Add child</Text>
            </TouchableOpacity>
          </Card>
        ) : children.map((child) => (
          <TouchableOpacity key={child.id} activeOpacity={0.78} onPress={() => openEditChild(child)}>
            <Card style={styles.childCard}>
              <View style={styles.childAvatar}><Icon icon={Baby} size="md" color={Colors.primary} strokeWidth={1.8} /></View>
              <View style={styles.flex1}>
                <Text style={styles.cardTitle}>{child.full_name}</Text>
                <Text style={styles.muted}>{ageText(child.date_of_birth)}</Text>
                {!!child.school_name && <Text style={styles.muted}>{child.school_name}</Text>}
              </View>
              <Icon icon={Pencil} size="sm" color={Colors.textSecondary} strokeWidth={1.8} />
            </Card>
          </TouchableOpacity>
        ))}

        <SectionHeader title="Linked documents" style={styles.section} />
        <Card style={styles.rowCard}>
          <View style={styles.softIcon}><Icon icon={FileText} size="md" color={Colors.primary} strokeWidth={1.8} /></View>
          <View style={styles.flex1}>
            <Text style={styles.cardTitle}>Documents stay organized separately</Text>
            <Text style={styles.muted}>Use the Documents tab for insurance cards, school forms, medical records, and passports.</Text>
          </View>
        </Card>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} activeOpacity={0.8}>
          <Icon icon={LogOut} size="sm" color={Colors.error} strokeWidth={1.9} /><Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
        <View style={{ height: Layout.screenPaddingB }} />
      </ScrollView>

      <Modal visible={profileOpen} transparent animationType="slide" onRequestClose={() => setProfileOpen(false)}>
        <View style={styles.modalShade}><View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Edit parent profile</Text>
          <Text style={styles.label}>NAME</Text>
          <TextInput style={styles.input} value={nameDraft} onChangeText={setNameDraft} placeholder="Your name" />
          <View style={styles.sheetActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setProfileOpen(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={saveParent} disabled={saving}><Text style={styles.saveText}>{saving ? 'Saving...' : 'Save'}</Text></TouchableOpacity>
          </View>
        </View></View>
      </Modal>

      <Modal visible={childOpen} transparent animationType="slide" onRequestClose={() => setChildOpen(false)}>
        <View style={styles.modalShade}><View style={styles.sheet}>
          <Text style={styles.sheetTitle}>{editingChild ? 'Edit child profile' : 'Add child'}</Text>
          <Text style={styles.label}>CHILD NAME</Text>
          <TextInput style={styles.input} value={childForm.full_name} onChangeText={(v) => setChildForm({ ...childForm, full_name: v })} placeholder="e.g. Noah" />
          <Text style={styles.label}>DATE OF BIRTH OPTIONAL</Text>
          <TextInput style={styles.input} value={childForm.date_of_birth} onChangeText={(v) => setChildForm({ ...childForm, date_of_birth: v })} placeholder="YYYY-MM-DD" />
          <Text style={styles.label}>SCHOOL OR DAYCARE OPTIONAL</Text>
          <TextInput style={styles.input} value={childForm.school_name} onChangeText={(v) => setChildForm({ ...childForm, school_name: v })} placeholder="School or daycare name" />
          <Text style={styles.label}>NOTES OPTIONAL</Text>
          <TextInput style={[styles.input, styles.notesInput]} value={childForm.notes} onChangeText={(v) => setChildForm({ ...childForm, notes: v })} placeholder="Medical notes, routines, preferences" multiline />
          <View style={styles.sheetActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setChildOpen(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={saveChild} disabled={saving}><Text style={styles.saveText}>{saving ? 'Saving...' : 'Save'}</Text></TouchableOpacity>
          </View>
        </View></View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background }, scroll: { paddingHorizontal: Layout.screenPaddingH, paddingTop: Spacing.md },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg }, title: { ...Typography.h2, color: Colors.textPrimary },
  circleBtn: { width: 42, height: 42, borderRadius: Radius.full, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', ...Shadows.sm }, circleBtnGhost: { width: 42, height: 42 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md }, avatar: { width: 58, height: 58, borderRadius: Radius.full, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  flex1: { flex: 1 }, name: { ...Typography.h3, color: Colors.textPrimary }, rowSmall: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: 5 }, muted: { ...Typography.caption, color: Colors.textSecondary, marginTop: 3 },
  iconBtn: { width: 38, height: 38, borderRadius: Radius.full, backgroundColor: Colors.primary + '12', alignItems: 'center', justifyContent: 'center' }, section: { marginTop: Layout.sectionSpacing, marginBottom: Layout.sectionLabelMb },
  rowCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md }, softIcon: { width: 48, height: 48, borderRadius: Radius.lg, backgroundColor: Colors.primary + '12', alignItems: 'center', justifyContent: 'center' }, cardTitle: { ...Typography.body, fontWeight: '800', color: Colors.textPrimary }, bodyText: { ...Typography.caption, color: Colors.textSecondary, lineHeight: 20, marginTop: 4 },
  childCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm }, childAvatar: { width: 48, height: 48, borderRadius: Radius.lg, backgroundColor: Colors.secondary + '18', alignItems: 'center', justifyContent: 'center' }, emptyCard: { gap: Spacing.sm },
  primaryButton: { marginTop: Spacing.sm, height: 46, borderRadius: Radius.lg, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: Spacing.xs }, primaryButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  signOutButton: { marginTop: Layout.sectionSpacing, height: 52, borderRadius: Radius.xl, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: Spacing.sm, borderWidth: 1, borderColor: Colors.error + '20' }, signOutText: { color: Colors.error, fontWeight: '800', fontSize: 15 },
  modalShade: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' }, sheet: { backgroundColor: Colors.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 10 }, sheetTitle: { ...Typography.h2, color: Colors.textPrimary, marginBottom: 8 }, label: { ...Typography.label, marginTop: 8 },
  input: { height: 50, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: Spacing.md, color: Colors.textPrimary, backgroundColor: Colors.background }, notesInput: { height: 88, textAlignVertical: 'top', paddingTop: 12 }, sheetActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: 16 }, cancelBtn: { flex: 1, height: 48, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' }, cancelText: { color: Colors.textPrimary, fontWeight: '800' }, saveBtn: { flex: 1, height: 48, borderRadius: Radius.lg, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }, saveText: { color: '#FFFFFF', fontWeight: '800' },
});
