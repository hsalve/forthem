import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  RefreshCw, DollarSign, CalendarPlus, FileText,
  ArrowRight, Clock, AlertCircle, CheckCircle2,
  Repeat2, Receipt, Bell, ChevronRight,
} from 'lucide-react-native';
import { Card, Chip, SectionHeader, Icon } from '../components';
import { Colors, Spacing, Typography, Radius, Shadows, Layout } from '../theme';

// ─── Mock Data ────────────────────────────────────────────────────────────────

// CHILD is now sourced from FamilyContext (real DB data).
// currentDay / totalDays / weekStart stay mock until Phase 3 (custody calendar).
const CUSTODY_MOCK = { currentDay: 3, totalDays: 7, weekStart: 'Mon 16 Jun' };

const HANDOFF = {
  toParent:   'Sarah',
  day:        'Friday',
  date:       '20 Jun',
  time:       '6:00 PM',
  daysUntil:  2,
  hoursUntil: 14,
  location:   'School gates',
};

const REMINDERS = [
  { id: 'r1', text: 'Pack PE kit — football practice today' },
  { id: 'r2', text: 'Doctor appointment Thursday — bring insurance card' },
];

const QUICK_ACTIONS = [
  {
    id:    'swap',
    icon:  RefreshCw,
    label: 'Request Swap',
    sub:   'Propose a day switch',
    accent:'#EDE9FE',
    color: Colors.primary,
  },
  {
    id:    'expense',
    icon:  DollarSign,
    label: 'Log Expense',
    sub:   'Split with Sarah',
    accent:'#E6FAF2',
    color: '#1E9A5E',
  },
  {
    id:    'event',
    icon:  CalendarPlus,
    label: 'Add Event',
    sub:   "Add to Noah's calendar",
    accent:'#FEF8E7',
    color: '#A07716',
  },
  {
    id:    'doc',
    icon:  FileText,
    label: 'Share Document',
    sub:   'Files & agreements',
    accent:'#FEF0F0',
    color: '#C0392B',
  },
] as const;

const EVENTS = [
  { id:'e1', title:'Football Practice',  when:'Today',    time:'4:00 PM',  color:'#6FCF97', accentBg:'#E6FAF2' },
  { id:'e2', title:'Doctor Appointment', when:'Thursday', time:'10:30 AM', color:'#F2C94C', accentBg:'#FEF8E7' },
  { id:'e3', title:'School Play',        when:'Friday',   time:'2:00 PM',  color:'#6C63FF', accentBg:'#EDE9FE' },
];

const NEEDS_ATTENTION = [
  {
    id:      'n1',
    type:    'swap'    as const,
    title:   'Swap request from Sarah',
    detail:  'Sat 14 Jun → Sun 22 Jun  ·  Work conference',
    urgency: 'pending' as const,
  },
  {
    id:      'n2',
    type:    'expense' as const,
    title:   'School shoes — $64.00',
    detail:  'Sarah paid  ·  Your share $32.00  ·  Awaiting approval',
    urgency: 'pending' as const,
  },
];

const RECENT_ACTIVITY = [
  { id:'a1', icon: CheckCircle2, color:'#1E9A5E', text:'Football club registration approved',   when:'2h ago'  },
  { id:'a2', icon: Receipt,      color:'#A07716', text:'Art supplies $32.00 logged by Sarah',   when:'Yesterday'},
  { id:'a3', icon: Repeat2,      color:Colors.primary, text:'Swap request for Jun 7 confirmed', when:'2 days ago'},
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── ① TODAY — Child Card ─────────────────────────────────────────────────────



// ─── ② QUICK ACTIONS ─────────────────────────────────────────────────────────

function ActionGrid() {
  return (
    <View style={styles.actionGrid}>
      {QUICK_ACTIONS.map(a => (
        <TouchableOpacity key={a.id} style={styles.actionTile} activeOpacity={0.70}>
          <View style={[styles.actionIconCircle, { backgroundColor: a.accent }]}>
            <Icon icon={a.icon} size="md" color={a.color} strokeWidth={1.75} />
          </View>
          <Text style={styles.actionLabel}>{a.label}</Text>
          <Text style={styles.actionSub}>{a.sub}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── ③ UPCOMING events ───────────────────────────────────────────────────────

function UpcomingCard() {
  return (
    <Card noPadding style={styles.listCard}>
      {EVENTS.map((e, i) => (
        <View key={e.id}>
          <TouchableOpacity style={styles.eventRow} activeOpacity={0.70}>
            {/* Coloured left accent bar */}
            <View style={[styles.eventAccentBar, { backgroundColor: e.color }]} />

            {/* Icon circle */}
            <View style={[styles.eventIconCircle, { backgroundColor: e.accentBg }]}>
              <Icon icon={Clock} size="sm" color={e.color} strokeWidth={1.75} />
            </View>

            {/* Text */}
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>{e.title}</Text>
              <Text style={styles.eventMeta}>{e.when} · {e.time}</Text>
            </View>

            <Icon icon={ChevronRight} size="sm" color={Colors.textDisabled} strokeWidth={1.5} />
          </TouchableOpacity>

          {i < EVENTS.length - 1 && (
            <View style={[styles.rowDivider, { marginLeft: 20 + 4 + 36 + 12 }]} />
          )}
        </View>
      ))}
    </Card>
  );
}

// ─── ④ NEEDS ATTENTION ───────────────────────────────────────────────────────

function AttentionCard({ item }: { item: typeof NEEDS_ATTENTION[0] }) {
  const isSwap    = item.type === 'swap';
  const iconColor = isSwap ? Colors.primary : '#A07716';
  const iconBg    = isSwap ? '#EDE9FE'      : '#FEF8E7';
  const LIcon     = isSwap ? Repeat2        : Receipt;

  return (
    <Card style={styles.attentionCard}>
      {/* Top */}
      <View style={styles.attentionTop}>
        <View style={[styles.attentionIconCircle, { backgroundColor: iconBg }]}>
          <Icon icon={LIcon} size="md" color={iconColor} strokeWidth={1.75} />
        </View>
        <View style={styles.attentionInfo}>
          <Text style={styles.attentionTitle}>{item.title}</Text>
          <Text style={styles.attentionDetail}>{item.detail}</Text>
        </View>
        <Chip label="Pending" variant="pending" />
      </View>

      {/* Action buttons */}
      <View style={styles.attentionActions}>
        <TouchableOpacity style={styles.btnDecline} activeOpacity={0.72}>
          <Text style={styles.btnDeclineText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnApprove} activeOpacity={0.72}>
          <Text style={styles.btnApproveText}>✓  Approve</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

// ─── ⑤ RECENT ACTIVITY ───────────────────────────────────────────────────────

function RecentActivityCard() {
  return (
    <Card noPadding style={styles.listCard}>
      {RECENT_ACTIVITY.map((a, i) => (
        <View key={a.id}>
          <View style={styles.activityRow}>
            <View style={[styles.activityIconCircle, { backgroundColor: a.color + '18' }]}>
              <Icon icon={a.icon} size="sm" color={a.color} strokeWidth={1.75} />
            </View>
            <Text style={styles.activityText} numberOfLines={2}>{a.text}</Text>
            <Text style={styles.activityWhen}>{a.when}</Text>
          </View>
          {i < RECENT_ACTIVITY.length - 1 && (
            <View style={[styles.rowDivider, { marginLeft: 20 + 36 + 12 }]} />
          )}
        </View>
      ))}
    </Card>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { user, signOut } = useAuth();

  const fullName    = user?.user_metadata?.full_name as string | undefined;
  const emailPrefix = user?.email?.split('@')[0] ?? 'Parent';
  const displayName = fullName ?? emailPrefix;
  const initial     = displayName[0]?.toUpperCase() ?? 'P';

  function handleAvatarPress() {
    Alert.alert(
      displayName,
      user?.email ?? '',
      [
        { text: 'Sign out', style: 'destructive', onPress: signOut },
        { text: 'Cancel',   style: 'cancel' },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Topbar ── */}
        <View style={styles.topbar}>
          <View>
            <Text style={styles.greeting}>{greeting()}, {displayName.split(' ')[0]}</Text>
            <Text style={styles.greetingSub}>Here's what's on today</Text>
          </View>
          <TouchableOpacity style={styles.avatarBtn} onPress={handleAvatarPress} activeOpacity={0.80}>
            <Text style={styles.avatarInitial}>{initial}</Text>
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* ── ① TODAY ── */}
        <SectionHeader title="Today" style={styles.section} />
        <ChildBanner
          name={childName}
          age={childAge}
          school={childSchool}
          initials={childInit}
          currentDay={CUSTODY_MOCK.currentDay}
          totalDays={CUSTODY_MOCK.totalDays}
          weekStart={CUSTODY_MOCK.weekStart}
        />

        {/* ── ② QUICK ACTIONS ── */}
        <SectionHeader title="Quick Actions" style={styles.section} />
        <ActionGrid />

        {/* ── ③ UPCOMING ── */}
        <SectionHeader
          title="Upcoming"
          action="See all"
          onAction={() => {}}
          style={styles.section}
        />
        <UpcomingCard />

        {/* ── ④ NEEDS ATTENTION ── */}
        <SectionHeader
          title="Needs Attention"
          style={styles.section}
        />
        <View style={styles.attentionWrap}>
          {/* Attention count badge */}
          <View style={styles.attentionBadge}>
            <Icon icon={AlertCircle} size="xs" color={Colors.warning} strokeWidth={2.5} />
            <Text style={styles.attentionBadgeText}>
              {NEEDS_ATTENTION.length} item{NEEDS_ATTENTION.length > 1 ? 's' : ''} need your response
            </Text>
          </View>
          {NEEDS_ATTENTION.map(item => (
            <AttentionCard key={item.id} item={item} />
          ))}
        </View>

        {/* ── ⑤ RECENT ACTIVITY ── */}
        <SectionHeader
          title="Recent Activity"
          style={styles.section}
        />
        <RecentActivityCard />

        <View style={{ height: Layout.screenPaddingB }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  // ── Layout ─────────────────────────────────────────────────────────────────
  safe:   { flex: 1, backgroundColor: Colors.background },
  scroll: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop:        Spacing.sm,
  },
  section: {
    marginTop:    Layout.sectionSpacing,   // 32 — identical across all screens
    marginBottom: Layout.sectionLabelMb,   // 10
  },

  // ── Topbar ─────────────────────────────────────────────────────────────────
  topbar: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    paddingTop:     Spacing.sm,
    marginBottom:   Spacing.xs,
  },
  greeting:    { ...Typography.h1 },
  greetingSub: { ...Typography.small, marginTop: 3 },

  avatarBtn: {
    width:          44,
    height:         44,
    borderRadius:   22,
    backgroundColor:Colors.primary,
    alignItems:     'center',
    justifyContent: 'center',
    ...Shadows.float,
  },
  avatarInitial: {
    color:      Colors.textInverse,
    fontWeight: '700',
    fontSize:   16,
    letterSpacing: 0.5,
  },
  notifDot: {
    position:        'absolute',
    top:             2,
    right:           2,
    width:           10,
    height:          10,
    borderRadius:    5,
    backgroundColor: Colors.error,
    borderWidth:     2,
    borderColor:     Colors.background,
  },

  // ── ① Child Card ───────────────────────────────────────────────────────────
  childCard: {
    backgroundColor: Colors.card,
    borderRadius:    Radius.lg,
    overflow:        'hidden',
    ...Shadows.float,         // slightly elevated — this is the hero card
  },
  childCardTop: {
    flexDirection: 'row',
    alignItems:    'center',
    padding:       Layout.cardPadding,
    paddingBottom: Spacing.md,
    gap:           Spacing.md,
  },

  // Photo
  photoWrap: {
    position: 'relative',
    width:    56,
    height:   56,
  },
  photoPlaceholder: {
    width:           56,
    height:          56,
    borderRadius:    28,
    backgroundColor: '#D8D4FF',    // light purple tint
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     2,
    borderColor:     Colors.primary + '30',
  },
  photoInitials: {
    fontSize:      22,
    fontWeight:    '800',
    color:         Colors.primary,
    letterSpacing: -0.5,
  },
  withYouDot: {
    position:        'absolute',
    bottom:          1,
    right:           1,
    width:           14,
    height:          14,
    borderRadius:    7,
    backgroundColor: Colors.success,
    borderWidth:     2.5,
    borderColor:     Colors.card,
  },

  // Identity
  childIdentity: { flex: 1 },
  childNameRow:  { flexDirection: 'row', alignItems: 'baseline' },
  childName: {
    fontSize:      22,
    fontWeight:    '800',
    color:         Colors.textPrimary,
    letterSpacing: -0.4,
  },
  childAge:    { fontSize: 16, fontWeight: '400', color: Colors.textSecondary, marginLeft: 2 },
  childSchool: { ...Typography.small, marginTop: 3 },

  // Badge
  withYouBadge: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:              5,
    backgroundColor:  '#E6FAF2',
    paddingVertical:  6,
    paddingHorizontal:10,
    borderRadius:     Radius.full,
    alignSelf:        'flex-start',
  },
  withYouBadgeDot: {
    width:           6,
    height:          6,
    borderRadius:    3,
    backgroundColor: Colors.success,
  },
  withYouBadgeText: {
    fontSize:   11,
    fontWeight: '700',
    color:      '#1E9A5E',
  },

  // Card divider
  cardDivider: {
    height:          1,
    backgroundColor: Colors.border,
    marginHorizontal:Layout.cardPadding,
  },

  // Week progress
  weekRow: {
    padding:       Layout.cardPadding,
    paddingVertical:Spacing.md,
  },
  weekLabelRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   Spacing.sm,
  },
  weekLabel: { ...Typography.label },
  weekCount: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },
  weekCountBold: { fontWeight: '800', color: Colors.primary },

  // Segmented bar — 7 blocks
  progressSegments: {
    flexDirection: 'row',
    gap:           4,
    marginBottom:  Spacing.sm,
  },
  segment: {
    flex:         1,
    height:       8,
    borderRadius: 4,
  },
  segmentEmpty:   { backgroundColor: Colors.border },
  segmentFilled:  { backgroundColor: Colors.primary + '50' },
  segmentCurrent: { backgroundColor: Colors.primary },   // today's segment is full-colour

  weekDates: {
    flexDirection:  'row',
    justifyContent: 'space-between',
  },
  weekDate: { fontSize: 10, fontWeight: '500', color: Colors.textSecondary },

  // Handoff block
  handoffBlock: {
    flexDirection:  'row',
    alignItems:     'center',
    padding:        Layout.cardPadding,
    paddingVertical:Spacing.md,
  },
  handoffLeft: { flex: 1, gap: 2 },
  handoffLabel:{ ...Typography.label },
  handoffTo: {
    fontSize:   18,
    fontWeight: '700',
    color:      Colors.textPrimary,
    marginTop:  4,
  },
  handoffWhen:     { ...Typography.small, marginTop: 1 },
  handoffLocation: { ...Typography.small },

  handoffCountdown: { alignItems: 'center' },
  handoffDaysNum: {
    fontSize:      40,
    fontWeight:    '800',
    color:         Colors.primary,
    letterSpacing: -1,
    lineHeight:    44,
  },
  handoffDaysLabel: {
    fontSize:      11,
    fontWeight:    '700',
    color:         Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop:     -2,
  },
  handoffHours: {
    fontSize:   10,
    color:      Colors.textSecondary,
    marginTop:  3,
  },

  // Reminders
  remindersBlock: {
    padding:        Layout.cardPadding,
    paddingTop:     Spacing.md,
    paddingBottom:  Spacing.md,
  },
  remindersLabelRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.xs,
    marginBottom:  Spacing.sm,
  },
  remindersLabel:  { ...Typography.label, color: Colors.warningText },
  reminderRow: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:           Spacing.sm,
    marginBottom:  Spacing.xs,
  },
  reminderDot: {
    width:           5,
    height:          5,
    borderRadius:    3,
    backgroundColor: Colors.warning,
    marginTop:       6,
  },
  reminderText: { fontSize: 13, color: Colors.textSecondary, flex: 1, lineHeight: 18 },

  // ── ② Quick actions ────────────────────────────────────────────────────────
  actionGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           Layout.cardGap,
  },
  actionTile: {
    width:           '48%',
    backgroundColor: Colors.card,
    borderRadius:    Radius.lg,
    padding:         Spacing.md,
    minHeight:       118,
    ...Shadows.card,
  },
  actionIconCircle: {
    width:          44,
    height:         44,
    borderRadius:   Radius.sm,
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   Spacing.sm,
  },
  actionLabel: {
    fontSize:      13,
    fontWeight:    '700',
    color:         Colors.textPrimary,
    letterSpacing: 0.1,
    marginBottom:  3,
  },
  actionSub: {
    fontSize:   11,
    fontWeight: '500',
    color:      Colors.textSecondary,
    lineHeight: 15,
  },

  // ── ③ Upcoming ─────────────────────────────────────────────────────────────
  listCard: {
    overflow:     'hidden',
    marginBottom: 0,
  },
  eventRow: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingVertical:14,
    paddingRight:   Layout.cardPadding,
    gap:            Spacing.md,
  },
  eventAccentBar: {
    width:               4,
    height:              '70%' as any,
    borderRadius:        2,
    minHeight:           32,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  eventIconCircle: {
    width:          36,
    height:         36,
    borderRadius:   Radius.sm,
    alignItems:     'center',
    justifyContent: 'center',
  },
  eventInfo:  { flex: 1 },
  eventTitle: { ...Typography.bodyBold },
  eventMeta:  { ...Typography.small, marginTop: 2 },
  rowDivider: { height: 1, backgroundColor: Colors.border },

  // ── ④ Needs Attention ──────────────────────────────────────────────────────
  attentionWrap: { gap: Layout.cardGap },
  attentionBadge: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:              Spacing.xs,
    backgroundColor:  Colors.warningBg,
    borderRadius:     Radius.sm,
    paddingVertical:  8,
    paddingHorizontal:Spacing.md,
    marginBottom:     Spacing.xs,
  },
  attentionBadgeText: {
    fontSize:   13,
    fontWeight: '600',
    color:      Colors.warningText,
  },
  attentionCard:  { gap: Spacing.md },
  attentionTop: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:           Spacing.md,
  },
  attentionIconCircle: {
    width:          44,
    height:         44,
    borderRadius:   Radius.sm,
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },
  attentionInfo:   { flex: 1 },
  attentionTitle:  { ...Typography.bodyBold, marginBottom: 3 },
  attentionDetail: { ...Typography.small, lineHeight: 18 },

  attentionActions: {
    flexDirection: 'row',
    gap:           Spacing.sm,
    paddingTop:    Spacing.xs,
  },
  btnDecline: {
    flex:            1,
    height:          42,
    borderRadius:    Radius.md,
    borderWidth:     1.5,
    borderColor:     Colors.border,
    alignItems:      'center',
    justifyContent:  'center',
  },
  btnDeclineText: {
    fontSize:   13,
    fontWeight: '600',
    color:      Colors.textSecondary,
  },
  btnApprove: {
    flex:           2,
    height:         42,
    borderRadius:   Radius.md,
    backgroundColor:Colors.primary,
    alignItems:     'center',
    justifyContent: 'center',
  },
  btnApproveText: {
    fontSize:   13,
    fontWeight: '700',
    color:      Colors.textInverse,
  },

  // ── ⑤ Recent Activity ──────────────────────────────────────────────────────
  activityRow: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingVertical:14,
    paddingHorizontal:Layout.cardPadding,
    gap:            Spacing.md,
  },
  activityIconCircle: {
    width:          36,
    height:         36,
    borderRadius:   Radius.sm,
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },
  activityText: {
    flex:       1,
    fontSize:   13,
    fontWeight: '500',
    color:      Colors.textPrimary,
    lineHeight: 18,
  },
  activityWhen: { ...Typography.tiny, flexShrink: 0 },
});
