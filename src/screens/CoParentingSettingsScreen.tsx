import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CalendarDays, ChevronRight, Clock, FileText, Receipt, ShieldCheck, Users } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Card, Icon, SectionHeader } from '../components';
import { Colors, Layout, Radius, Shadows, Spacing, Typography } from '../theme';
import { useFamily } from '../context/FamilyContext';
import type { MainStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'CoParentingSettings'>;

type SettingsRowProps = {
  icon: any;
  title: string;
  subtitle: string;
  badge?: string;
  onPress?: () => void;
};

function SettingsRow({ icon, title, subtitle, badge, onPress }: SettingsRowProps) {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.75} onPress={onPress}>
      <View style={styles.rowIcon}><Icon icon={icon} size="sm" color={Colors.primary} strokeWidth={1.9} /></View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      {badge ? <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View> : <Icon icon={ChevronRight} size="sm" color={Colors.textDisabled} strokeWidth={1.8} />}
    </TouchableOpacity>
  );
}

export default function CoParentingSettingsScreen({ navigation }: Props) {
  const { familyName, children } = useFamily();
  const childName = children[0]?.full_name?.split(' ')[0] || 'your child';

  function comingSoon(feature: string) {
    Alert.alert(feature, 'This is the next foundation area. We are adding storage and automation one slice at a time.');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topbar}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.75}>
            <Icon icon={ArrowLeft} size="sm" color={Colors.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>Co-parenting Settings</Text>
            <Text style={styles.subtitle}>{familyName || `${childName}'s co-parenting space`}</Text>
          </View>
        </View>

        <Card style={styles.heroCard}>
          <View style={styles.heroIcon}><Icon icon={ShieldCheck} size="lg" color={Colors.primary} strokeWidth={1.8} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Set once. Automate later.</Text>
            <Text style={styles.heroText}>Parenting plan, custody schedule, handoff preferences, and expense rules will power ForThem’s automation.</Text>
          </View>
        </Card>

        <SectionHeader title="Source of truth" style={styles.section} />
        <Card noPadding style={styles.listCard}>
          <SettingsRow icon={FileText} title="Parenting Plan" subtitle="Upload the official agreement that will eventually power custody and expense rules." badge="Next" onPress={() => comingSoon('Parenting Plan upload')} />
          <View style={styles.divider} />
          <SettingsRow icon={CalendarDays} title="Custody Schedule" subtitle="Current placeholder: 2-2-3 schedule. Editable setup comes next." onPress={() => comingSoon('Custody Schedule')} />
          <View style={styles.divider} />
          <SettingsRow icon={Receipt} title="Expense Rules" subtitle="Default splits for daycare, medical, school, activities, and reimbursements." onPress={() => comingSoon('Expense Rules')} />
        </Card>

        <SectionHeader title="Automation defaults" style={styles.section} />
        <Card noPadding style={styles.listCard}>
          <SettingsRow icon={Clock} title="Handoff Preferences" subtitle="Default handoff time, reminders, and generated handoff behavior." onPress={() => comingSoon('Handoff Preferences')} />
          <View style={styles.divider} />
          <SettingsRow icon={Users} title="Parents & access" subtitle="Co-parent connection first. Trusted family/caregiver sharing comes later." onPress={() => comingSoon('Parents & access')} />
        </Card>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Why this matters</Text>
          <Text style={styles.noteText}>ForThem should reduce manual work. These settings will become the rules engine behind calendar days, handoffs, swaps, recurring expenses, and reminders.</Text>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Layout.screenPaddingH, paddingTop: Spacing.md, paddingBottom: 80 },
  topbar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  backButton: { width: 42, height: 42, borderRadius: Radius.full, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },
  headerText: { flex: 1 },
  title: { ...Typography.h2, color: Colors.textPrimary },
  subtitle: { ...Typography.small, marginTop: 2 },
  heroCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  heroIcon: { width: 52, height: 52, borderRadius: Radius.lg, backgroundColor: Colors.primary + '14', alignItems: 'center', justifyContent: 'center' },
  heroTitle: { ...Typography.bodyBold, color: Colors.textPrimary },
  heroText: { ...Typography.small, lineHeight: 19, marginTop: 4 },
  section: { marginTop: Layout.sectionSpacing, marginBottom: Spacing.sm },
  listCard: { overflow: 'hidden' },
  row: { minHeight: 78, flexDirection: 'row', alignItems: 'center', paddingHorizontal: Layout.cardPadding, paddingVertical: Spacing.md, gap: Spacing.md },
  rowIcon: { width: 42, height: 42, borderRadius: Radius.md, backgroundColor: Colors.primary + '10', alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1 },
  rowTitle: { ...Typography.bodyBold, color: Colors.textPrimary },
  rowSubtitle: { ...Typography.small, lineHeight: 18, marginTop: 3 },
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: Layout.cardPadding + 54 },
  badge: { backgroundColor: Colors.primary + '14', paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full },
  badgeText: { color: Colors.primary, fontSize: 11, fontWeight: '800' },
  noteCard: { marginTop: Layout.sectionSpacing, backgroundColor: Colors.warningBg, borderRadius: Radius.lg, padding: Layout.cardPadding },
  noteTitle: { ...Typography.bodyBold, color: '#A07716' },
  noteText: { ...Typography.small, color: '#A07716', lineHeight: 19, marginTop: 4 },
});
