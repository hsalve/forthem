import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CalendarPlus, DollarSign, FileText, RefreshCw } from 'lucide-react-native';

import { useAuth } from '../context/AuthContext';
import { useFamily } from '../context/FamilyContext';
import { Card, Icon, SectionHeader } from '../components';
import { Colors, Spacing, Typography, Radius, Shadows, Layout } from '../theme';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function ageText(dob?: string | null) {
  if (!dob) return 'Age not set yet';
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return 'Age not set yet';
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) years--;
  return years <= 0 ? 'Under 1 year old' : `${years} year${years === 1 ? '' : 's'} old`;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { children } = useFamily();
  const navigation = useNavigation<any>();
  const emailPrefix = user?.email?.split('@')[0] ?? 'Parent';
  const fullName = (user?.user_metadata?.full_name as string | undefined) ?? emailPrefix;
  const firstName = fullName.split(' ')[0];
  const initial = fullName[0]?.toUpperCase() ?? 'P';
  const child = children[0];
  const childName = child?.full_name ?? 'your child';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topbar}>
          <View>
            <Text style={styles.greeting}>{greeting()}, {firstName}</Text>
            <Text style={styles.greetingSub}>Here is your week with {childName}</Text>
          </View>
          <TouchableOpacity style={styles.avatarBtn} onPress={() => navigation.navigate('Profile')} activeOpacity={0.8}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </TouchableOpacity>
        </View>

        <SectionHeader title="Today" style={styles.section} />
        <Card style={styles.heroCard}>
          <Text style={styles.heroTitle}>{child ? `Today with ${child.full_name}` : 'Add your child to personalize ForThem'}</Text>
          <Text style={styles.heroBody}>{child ? `${ageText(child.date_of_birth)}${child.school_name ? ` · ${child.school_name}` : ''}` : 'Tap your profile photo, then add your child. You can start with just a name.'}</Text>
          <Text style={styles.heroBody}>Next handoff is Friday at 6:00 PM.</Text>
          <View style={styles.progressTrack}><View style={styles.progressFill} /></View>
        </Card>

        <SectionHeader title="Quick Actions" style={styles.section} />
        <View style={styles.actionGrid}>
          <Action icon={RefreshCw} label="Request Swap" />
          <Action icon={DollarSign} label="Log Expense" />
          <Action icon={CalendarPlus} label="Add Event" />
          <Action icon={FileText} label="Share Document" />
        </View>

        <SectionHeader title="Upcoming" style={styles.section} />
        <Card style={styles.listCard}>
          <Text style={styles.listTitle}>Football Practice</Text>
          <Text style={styles.listMeta}>Today · 4:00 PM</Text>
        </Card>
        <Card style={styles.listCard}>
          <Text style={styles.listTitle}>Doctor Appointment</Text>
          <Text style={styles.listMeta}>Thursday · 10:30 AM</Text>
        </Card>

        <View style={{ height: Layout.screenPaddingB }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Action({ icon, label }: { icon: any; label: string }) {
  return (
    <TouchableOpacity style={styles.actionTile} activeOpacity={0.75}>
      <View style={styles.actionIcon}><Icon icon={icon} size="md" color={Colors.primary} strokeWidth={1.8} /></View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Layout.screenPaddingH, paddingTop: Spacing.md },
  section: { marginTop: Layout.sectionSpacing, marginBottom: Layout.sectionLabelMb },
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  greeting: { ...Typography.h1, color: Colors.textPrimary, letterSpacing: -0.8 },
  greetingSub: { ...Typography.body, color: Colors.textSecondary, marginTop: 4 },
  avatarBtn: { width: 48, height: 48, borderRadius: Radius.full, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },
  avatarInitial: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  heroCard: { padding: Spacing.lg },
  heroTitle: { ...Typography.h3, color: Colors.textPrimary },
  heroBody: { ...Typography.body, color: Colors.textSecondary, marginTop: 8 },
  progressTrack: { height: 7, backgroundColor: Colors.border, borderRadius: Radius.full, marginTop: Spacing.lg, overflow: 'hidden' },
  progressFill: { height: '100%', width: '42%', backgroundColor: Colors.primary, borderRadius: Radius.full },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  actionTile: { width: '48%', minHeight: 104, backgroundColor: Colors.card, borderRadius: Radius.xl, padding: Spacing.md, justifyContent: 'space-between', ...Shadows.sm },
  actionIcon: { width: 42, height: 42, borderRadius: Radius.lg, backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center' },
  actionLabel: { ...Typography.body, fontWeight: '800', color: Colors.textPrimary, marginTop: Spacing.sm },
  listCard: { marginBottom: Spacing.sm },
  listTitle: { ...Typography.body, fontWeight: '800', color: Colors.textPrimary },
  listMeta: { ...Typography.caption, color: Colors.textSecondary, marginTop: 4 },
});
