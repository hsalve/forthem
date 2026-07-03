import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Baby, LogOut, Mail, Pencil, Plus, Trash2, User, Users } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { useFamily } from '../context/FamilyContext';
import { addChild, deleteChild, updateChild, updateFamilyName, updateParentProfile } from '../services/familyService';
import { Child } from '../lib/database.types';
import { Card, Icon, SectionHeader } from '../components';
import { Colors, Layout, Radius, Shadows, Spacing, Typography } from '../theme';
import type { MainStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'Profile'>;
type ChildForm = { full_name: string; date_of_birth: string; school_name: string; notes: string };
const emptyChild: ChildForm = { full_name: '', date_of_birth: '', school_name: '', notes: '' };
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function firstLetter(value?: string | null) { return value?.trim()?.[0]?.toUpperCase() ?? 'P'; }
function ageText(dob?: string | null) {
  if (!dob) return 'DOB not set';
  const birth = new Date(`${dob}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return dob;
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) years--;
  return years <= 0 ? 'Under 1 year old' : `${years} year${years === 1 ? '' : 's'} old`;
}
function daysInMonth(year: number, monthIndex: number) { return new Date(year, monthIndex + 1, 0).getDate(); }
function parseDate(value: string) {
  const parts = value?.split('-').map(Number);
  const now = new Date();
  return {
    year: parts?.[0] || now.getFullYear(),
    month: (parts?.[1] || now.getMonth() + 1) - 1,
    day: parts?.[2] || now.getDate(),
  };
}
function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function ProfileScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();
  const { familyName, familyId, children, refresh } = useFamily();
  const email = user?.email ?? 'No email available';
  const displayName = (user?.user_metadata?.full_name as string | undefined) || email.split('@')[0] || 'Parent';
  const phone = (user?.user_metadata?.phone as string | undefined) || '';

  const [profileOpen, setProfileOpen] = useState(false);
  const [spaceOpen, setSpaceOpen] = useState(false);
  const [childOpen, setChildOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState(displayName);
  const [phoneDraft, setPhoneDraft] = useState(phone);
  const [spaceDraft, setSpaceDraft] = useState(familyName || 'Co-parenting space');
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [childForm, setChildForm] = useState<ChildForm>(emptyChild);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setNameDraft(displayName); setPhoneDraft(phone); }, [displayName, phone]);
  useEffect(() => { setSpaceDraft(familyName || 'Co-parenting space'); }, [familyName]);

  const childCountLabel = useMemo(() => `${children.length} child${children.length === 1 ? '' : 'ren'} connected`, [children.length]);

  function openAddChild() { setEditingChild(null); setChildForm(emptyChild); setChildOpen(true); }
  function openEditChild(child: Child) {
    setEditingChild(child);
    setChildForm({ full_name: child.full_name ?? '', date_of_birth: child.date_of_birth ?? '', school_name: child.school_name ?? '', notes: child.notes ?? '' });
    setChildOpen(true);
  }

  async function saveParent() {
    if (!user) return;
    if (!nameDraft.trim()) return Alert.alert('Name required', 'Please enter your name.');
    setSaving(true);
    try { await updateParentProfile(user.id, nameDraft, phoneDraft); setProfileOpen(false); }
    catch (e: any) { Alert.alert('Error', e?.message ?? 'Could not update profile.'); }
    finally { setSaving(false); }
  }

  async function saveSpace() {
    if (!familyId) return;
    setSaving(true);
    try { await updateFamilyName(familyId, spaceDraft); await refresh(); setSpaceOpen(false); }
    catch (e: any) { Alert.alert('Error', e?.message ?? 'Could not update co-parenting space.'); }
    finally { setSaving(false); }
  }

  async function saveChild() {
    if (!familyId) return;
    const cleanName = childForm.full_name.trim();
    if (!cleanName) return Alert.alert('Child name required', 'Please enter your child’s name.');
    setSaving(true);
    try {
      const payload = { full_name: cleanName, date_of_birth: childForm.date_of_birth || undefined, school_name: childForm.school_name.trim() || undefined, notes: childForm.notes.trim() || undefined };
      if (editingChild) await updateChild(editingChild.id, payload);
      else await addChild(familyId, payload);
      await refresh();
      setChildOpen(false);
    } catch (e: any) { Alert.alert('Error', e?.message ?? 'Could not save child profile.'); }
    finally { setSaving(false); }
  }

  function confirmDeleteChild() {
    if (!editingChild) return;
    Alert.alert('Delete child profile?', `This removes ${editingChild.full_name} from ForThem. Documents stay in the Documents tab.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        setSaving(true);
        try { await deleteChild(editingChild.id); await refresh(); setChildOpen(false); }
        catch (e: any) { Alert.alert('Error', e?.message ?? 'Could not delete child.'); }
        finally { setSaving(false); }
      }},
    ]);
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
          <TouchableOpacity style={styles.circleBtn} onPress={() => navigation.goBack()} activeOpacity={0.75}><Icon icon={ArrowLeft} size="sm" color={Colors.textPrimary} strokeWidth={2} /></TouchableOpacity>
          <Text style={styles.title}>Profile</Text><View style={styles.circleGhost} />
        </View>

        <Card style={styles.profileCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{firstLetter(displayName)}</Text></View>
          <View style={styles.flex1}><Text style={styles.name}>{displayName}</Text><View style={styles.rowSmall}><Icon icon={Mail} size="xs" color={Colors.textSecondary} strokeWidth={1.8} /><Text style={styles.muted}>{email}</Text></View>{!!phone && <Text style={styles.muted}>{phone}</Text>}</View>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setProfileOpen(true)} activeOpacity={0.75}><Icon icon={Pencil} size="sm" color={Colors.primary} strokeWidth={1.9} /></TouchableOpacity>
        </Card>

        <SectionHeader title="Co-parenting space" style={styles.section} />
        <TouchableOpacity activeOpacity={0.8} onPress={() => setSpaceOpen(true)}>
          <Card style={styles.rowCard}><View style={styles.softIcon}><Icon icon={Users} size="md" color={Colors.primary} strokeWidth={1.8} /></View><View style={styles.flex1}><Text style={styles.cardTitle}>{familyName || 'Co-parenting space'}</Text><Text style={styles.muted}>{childCountLabel}</Text></View><Icon icon={Pencil} size="sm" color={Colors.textSecondary} strokeWidth={1.8} /></Card>
        </TouchableOpacity>

        <SectionHeader title="Children" action="Add child" onAction={openAddChild} style={styles.section} />
        {children.length === 0 ? <Card style={styles.emptyCard}><Text style={styles.cardTitle}>Add your child when you’re ready</Text><Text style={styles.bodyText}>Start with just a name. Details can be added later.</Text><TouchableOpacity style={styles.primaryButton} onPress={openAddChild}><Icon icon={Plus} size="sm" color="#FFFFFF" strokeWidth={2} /><Text style={styles.primaryButtonText}>Add child</Text></TouchableOpacity></Card> : children.map((child) => (
          <TouchableOpacity key={child.id} activeOpacity={0.78} onPress={() => openEditChild(child)}><Card style={styles.childCard}><View style={styles.childAvatar}><Icon icon={Baby} size="md" color={Colors.primary} strokeWidth={1.8} /></View><View style={styles.flex1}><Text style={styles.cardTitle}>{child.full_name}</Text><Text style={styles.muted}>{ageText(child.date_of_birth)}</Text>{!!child.school_name && <Text style={styles.muted}>{child.school_name}</Text>}</View><Icon icon={Pencil} size="sm" color={Colors.textSecondary} strokeWidth={1.8} /></Card></TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} activeOpacity={0.8}><Icon icon={LogOut} size="sm" color={Colors.error} strokeWidth={1.9} /><Text style={styles.signOutText}>Sign out</Text></TouchableOpacity>
        <View style={{ height: Layout.screenPaddingB }} />
      </ScrollView>

      <EditSheet visible={profileOpen} title="Edit parent profile" onCancel={() => setProfileOpen(false)} onSave={saveParent} saving={saving}>
        <Field label="NAME" value={nameDraft} onChangeText={setNameDraft} placeholder="Your name" />
        <Field label="PHONE OPTIONAL" value={phoneDraft} onChangeText={setPhoneDraft} placeholder="Phone number" keyboardType="phone-pad" />
      </EditSheet>

      <EditSheet visible={spaceOpen} title="Edit co-parenting space" onCancel={() => setSpaceOpen(false)} onSave={saveSpace} saving={saving}>
        <Text style={styles.bodyText}>Use a neutral label that feels comfortable, like “Noah’s space”.</Text>
        <Field label="SPACE NAME" value={spaceDraft} onChangeText={setSpaceDraft} placeholder="Co-parenting space" />
      </EditSheet>

      <EditSheet visible={childOpen} title={editingChild ? 'Edit child profile' : 'Add child'} onCancel={() => setChildOpen(false)} onSave={saveChild} saving={saving}>
        <Field label="CHILD NAME" value={childForm.full_name} onChangeText={(v) => setChildForm({ ...childForm, full_name: v })} placeholder="e.g. Noah" />
        <Text style={styles.label}>DATE OF BIRTH OPTIONAL</Text>
        <TouchableOpacity style={styles.input} onPress={() => setDateOpen(true)} activeOpacity={0.8}><Text style={childForm.date_of_birth ? styles.inputText : styles.placeholder}>{childForm.date_of_birth || 'Select date'}</Text></TouchableOpacity>
        <Field label="SCHOOL OR DAYCARE OPTIONAL" value={childForm.school_name} onChangeText={(v) => setChildForm({ ...childForm, school_name: v })} placeholder="School or daycare name" />
        <Field label="NOTES OPTIONAL" value={childForm.notes} onChangeText={(v) => setChildForm({ ...childForm, notes: v })} placeholder="Medical notes, routines, preferences" multiline />
        {editingChild && <TouchableOpacity style={styles.deleteButton} onPress={confirmDeleteChild}><Icon icon={Trash2} size="sm" color={Colors.error} strokeWidth={2} /><Text style={styles.deleteText}>Delete child profile</Text></TouchableOpacity>}
      </EditSheet>

      <DatePickerModal visible={dateOpen} value={childForm.date_of_birth} onCancel={() => setDateOpen(false)} onDone={(date) => { setChildForm({ ...childForm, date_of_birth: date }); setDateOpen(false); }} />
    </SafeAreaView>
  );
}

function Field(props: any) { return <><Text style={styles.label}>{props.label}</Text><TextInput style={[styles.input, props.multiline && styles.notesInput]} placeholderTextColor={Colors.textDisabled} {...props} /></>; }
function EditSheet({ visible, title, children, onCancel, onSave, saving }: any) { return <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}><View style={styles.modalShade}><View style={styles.sheet}><Text style={styles.sheetTitle}>{title}</Text>{children}<View style={styles.sheetActions}><TouchableOpacity style={styles.cancelBtn} onPress={onCancel}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity><TouchableOpacity style={styles.saveBtn} onPress={onSave} disabled={saving}><Text style={styles.saveText}>{saving ? 'Saving...' : 'Save'}</Text></TouchableOpacity></View></View></View></Modal>; }
function DatePickerModal({ visible, value, onCancel, onDone }: any) {
  const parsed = parseDate(value || '');
  const [year, setYear] = useState(parsed.year); const [month, setMonth] = useState(parsed.month); const [day, setDay] = useState(parsed.day);
  const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);
  const days = Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1);
  useEffect(() => { if (day > days.length) setDay(days.length); }, [month, year]);
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}><View style={styles.modalShade}><View style={styles.sheet}><Text style={styles.sheetTitle}>Select date of birth</Text><View style={styles.pickerRow}><PickerColumn items={months} selected={months[month]} onSelect={(v: string) => setMonth(months.indexOf(v))} /><PickerColumn items={days.map(String)} selected={String(day)} onSelect={(v: string) => setDay(Number(v))} /><PickerColumn items={years.map(String)} selected={String(year)} onSelect={(v: string) => setYear(Number(v))} /></View><View style={styles.sheetActions}><TouchableOpacity style={styles.cancelBtn} onPress={onCancel}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity><TouchableOpacity style={styles.saveBtn} onPress={() => onDone(formatDate(year, month, day))}><Text style={styles.saveText}>Done</Text></TouchableOpacity></View></View></View></Modal>;
}
function PickerColumn({ items, selected, onSelect }: any) { return <ScrollView style={styles.pickerCol} showsVerticalScrollIndicator={false}>{items.map((item: string) => <TouchableOpacity key={item} style={[styles.pickerItem, item === selected && styles.pickerSelected]} onPress={() => onSelect(item)}><Text style={[styles.pickerText, item === selected && styles.pickerTextSelected]}>{item}</Text></TouchableOpacity>)}</ScrollView>; }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background }, scroll: { paddingHorizontal: Layout.screenPaddingH, paddingTop: Spacing.md }, topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg }, title: { ...Typography.h2, color: Colors.textPrimary }, circleBtn: { width: 42, height: 42, borderRadius: Radius.full, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', ...Shadows.sm }, circleGhost: { width: 42, height: 42 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md }, avatar: { width: 58, height: 58, borderRadius: Radius.full, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' }, flex1: { flex: 1 }, name: { ...Typography.h3, color: Colors.textPrimary }, rowSmall: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: 5 }, muted: { ...Typography.caption, color: Colors.textSecondary, marginTop: 3 }, iconBtn: { width: 38, height: 38, borderRadius: Radius.full, backgroundColor: Colors.primary + '12', alignItems: 'center', justifyContent: 'center' }, section: { marginTop: Layout.sectionSpacing, marginBottom: Layout.sectionLabelMb },
  rowCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md }, softIcon: { width: 48, height: 48, borderRadius: Radius.lg, backgroundColor: Colors.primary + '12', alignItems: 'center', justifyContent: 'center' }, cardTitle: { ...Typography.body, fontWeight: '800', color: Colors.textPrimary }, bodyText: { ...Typography.caption, color: Colors.textSecondary, lineHeight: 20, marginTop: 4 }, childCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm }, childAvatar: { width: 48, height: 48, borderRadius: Radius.lg, backgroundColor: Colors.secondary + '18', alignItems: 'center', justifyContent: 'center' }, emptyCard: { gap: Spacing.sm },
  primaryButton: { marginTop: Spacing.sm, height: 46, borderRadius: Radius.lg, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: Spacing.xs }, primaryButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 }, signOutButton: { marginTop: Layout.sectionSpacing, height: 52, borderRadius: Radius.xl, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: Spacing.sm, borderWidth: 1, borderColor: Colors.error + '20' }, signOutText: { color: Colors.error, fontWeight: '800', fontSize: 15 },
  modalShade: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' }, sheet: { backgroundColor: Colors.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 10, maxHeight: '92%' }, sheetTitle: { ...Typography.h2, color: Colors.textPrimary, marginBottom: 8 }, label: { ...Typography.label, marginTop: 8 }, input: { minHeight: 50, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: Spacing.md, justifyContent: 'center', color: Colors.textPrimary, backgroundColor: Colors.background }, inputText: { color: Colors.textPrimary, fontSize: 15 }, placeholder: { color: Colors.textDisabled, fontSize: 15 }, notesInput: { height: 88, textAlignVertical: 'top', paddingTop: 12 }, sheetActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: 16 }, cancelBtn: { flex: 1, height: 48, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' }, cancelText: { color: Colors.textPrimary, fontWeight: '800' }, saveBtn: { flex: 1, height: 48, borderRadius: Radius.lg, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }, saveText: { color: '#FFFFFF', fontWeight: '800' }, deleteButton: { height: 44, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.error + '30', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: Spacing.xs, marginTop: 8 }, deleteText: { color: Colors.error, fontWeight: '800' },
  pickerRow: { flexDirection: 'row', gap: Spacing.sm, height: 220 }, pickerCol: { flex: 1, borderRadius: Radius.lg, backgroundColor: Colors.background }, pickerItem: { height: 42, alignItems: 'center', justifyContent: 'center' }, pickerSelected: { backgroundColor: Colors.primary + '14' }, pickerText: { color: Colors.textSecondary, fontWeight: '700' }, pickerTextSelected: { color: Colors.primary, fontWeight: '900' },
});
