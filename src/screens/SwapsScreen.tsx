import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, Pressable, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadows, Layout, Typography } from '../theme';
import { Card, Chip, SectionHeader } from '../components';

// ─── Types ────────────────────────────────────────────────────────────────────

type SwapStatus = 'pending' | 'approved' | 'rejected';
type Direction  = 'incoming' | 'outgoing';

type Swap = {
  id: string; direction: Direction; from: string; fromEmoji: string;
  givingDay: string; gettingDay: string; reason: string;
  note?: string; status: SwapStatus; date: string;
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_SWAPS: Swap[] = [
  { id:'s1', direction:'incoming', from:'Sarah', fromEmoji:'👩', givingDay:'Sat, 14 Jun', gettingDay:'Sun, 22 Jun', reason:'Work conference in Berlin', note:"I can do school pickup on Sunday instead.", status:'pending', date:'Today' },
  { id:'s2', direction:'incoming', from:'Sarah', fromEmoji:'👩', givingDay:'Fri, 20 Jun', gettingDay:'Mon, 23 Jun', reason:"Noah's cousin visiting", status:'pending', date:'Yesterday' },
  { id:'s3', direction:'outgoing', from:'You',   fromEmoji:'👨', givingDay:'Sat, 7 Jun',  gettingDay:'Sat, 14 Jun', reason:'Family wedding', status:'approved', date:'3 Jun' },
  { id:'s4', direction:'incoming', from:'Sarah', fromEmoji:'👩', givingDay:'Sun, 1 Jun',  gettingDay:'Sat, 7 Jun',  reason:'Weekend trip', status:'rejected', date:'28 May' },
  { id:'s5', direction:'outgoing', from:'You',   fromEmoji:'👨', givingDay:'Mon, 2 Jun',  gettingDay:'Tue, 10 Jun', reason:'School sports day clash', status:'rejected', date:'25 May' },
];

const FILTERS: { key: SwapStatus | 'all'; label: string }[] = [
  { key:'all', label:'All' }, { key:'pending', label:'Pending' },
  { key:'approved', label:'Approved' }, { key:'rejected', label:'Declined' },
];

const QUICK_REASONS = ['Work commitment', 'Family event', 'Medical appointment', 'School event', 'Travel', 'Other'];

// ─── Generate next 28 days for date picker ────────────────────────────────────

function getUpcomingDates() {
  const result: { label: string; short: string }[] = [];
  const base = new Date();
  for (let i = 1; i <= 28; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    result.push({
      label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      short: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  }
  return result;
}
const UPCOMING_DATES = getUpcomingDates();

// ─── Date Picker Sheet ────────────────────────────────────────────────────────

type DatePickerProps = {
  visible: boolean;
  title: string;
  selected: string;
  onSelect: (d: string) => void;
  onClose: () => void;
};

function DatePickerSheet({ visible, title, selected, onSelect, onClose }: DatePickerProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.dateSheet} onPress={e => e.stopPropagation()}>
          <View style={styles.sheetHandle} />
          <Text style={styles.dateSheetTitle}>{title}</Text>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.dateList}>
            {UPCOMING_DATES.map(d => (
              <TouchableOpacity
                key={d.label}
                style={[styles.dateRow, selected === d.label && styles.dateRowActive]}
                onPress={() => { onSelect(d.label); onClose(); }}
                activeOpacity={0.72}
              >
                <Text style={[styles.dateRowText, selected === d.label && styles.dateRowTextActive]}>
                  {d.label}
                </Text>
                {selected === d.label && <Text style={styles.dateRowCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Swap Card ────────────────────────────────────────────────────────────────

type SwapCardProps = { swap: Swap; onApprove:(id:string)=>void; onDecline:(id:string)=>void };

function SwapCard({ swap, onApprove, onDecline }: SwapCardProps) {
  const isIncoming = swap.direction === 'incoming';
  const isPending  = swap.status === 'pending';

  return (
    <Card style={styles.swapCard}>
      <View style={styles.cardTop}>
        <View style={styles.cardFromRow}>
          <Text style={styles.fromEmoji}>{swap.fromEmoji}</Text>
          <View>
            <Text style={styles.fromLabel}>{isIncoming ? `${swap.from} requested` : 'You requested'}</Text>
            <Text style={styles.cardDate}>{swap.date}</Text>
          </View>
        </View>
        <Chip
          label={swap.status === 'rejected' ? 'Declined' : swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
          variant={swap.status === 'rejected' ? 'rejected' : swap.status === 'approved' ? 'approved' : 'pending'}
        />
      </View>
      <View style={styles.daysRow}>
        <View style={styles.dayBox}>
          <Text style={styles.dayBoxLabel}>{isIncoming ? 'Her day' : 'Your day'}</Text>
          <Text style={styles.dayBoxValue}>{swap.givingDay}</Text>
        </View>
        <Text style={styles.arrowIcon}>⇄</Text>
        <View style={[styles.dayBox, { alignItems: 'flex-end' }]}>
          <Text style={[styles.dayBoxLabel, { textAlign: 'right' }]}>{isIncoming ? 'Your day' : 'Her day'}</Text>
          <Text style={[styles.dayBoxValue, { textAlign: 'right' }]}>{swap.gettingDay}</Text>
        </View>
      </View>
      <View style={styles.reasonRow}>
        <Text style={styles.reasonIcon}>💬</Text>
        <Text style={styles.reasonText}>{swap.reason}</Text>
      </View>
      {swap.note && <View style={styles.noteRow}><Text style={styles.noteText}>"{swap.note}"</Text></View>}
      {isPending && isIncoming && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.btnDecline} onPress={() => onDecline(swap.id)} activeOpacity={0.75}>
            <Text style={styles.btnDeclineText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnApprove} onPress={() => onApprove(swap.id)} activeOpacity={0.75}>
            <Text style={styles.btnApproveText}>✓  Approve</Text>
          </TouchableOpacity>
        </View>
      )}
      {isPending && !isIncoming && (
        <View style={styles.waitingRow}>
          <Text style={styles.waitingText}>⏳  Waiting for Sarah's response</Text>
        </View>
      )}
    </Card>
  );
}

// ─── New Swap Modal ───────────────────────────────────────────────────────────

type NewSwapModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (givingDay: string, gettingDay: string, reason: string) => void;
};

function NewSwapModal({ visible, onClose, onSubmit }: NewSwapModalProps) {
  const [givingDay,   setGivingDay]   = useState('');
  const [gettingDay,  setGettingDay]  = useState('');
  const [reason,      setReason]      = useState('');
  const [otherNote,   setOtherNote]   = useState('');
  const [pickerFor,   setPickerFor]   = useState<'giving' | 'getting' | null>(null);

  function handleSubmit() {
    const finalReason = reason === 'Other' && otherNote.trim() ? otherNote.trim() : reason;
    onSubmit(givingDay, gettingDay, finalReason);
    setGivingDay(''); setGettingDay(''); setReason(''); setOtherNote('');
  }

  const canSubmit = givingDay && gettingDay && reason && (reason !== 'Other' || otherNote.trim());

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable style={styles.modalSheet} onPress={e => e.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Request a Swap</Text>
            <Text style={styles.sheetSub}>Pick the days you'd like to exchange with Sarah.</Text>

            {/* Day selectors */}
            <View style={styles.sheetDaysRow}>
              <TouchableOpacity style={styles.sheetDayBtn} onPress={() => setPickerFor('giving')} activeOpacity={0.75}>
                <Text style={styles.sheetDayLabel}>Your day to give</Text>
                <Text style={[styles.sheetDayValue, !givingDay && styles.sheetDayPlaceholder]}>
                  {givingDay || 'Select date →'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.sheetArrow}>⇄</Text>
              <TouchableOpacity style={styles.sheetDayBtn} onPress={() => setPickerFor('getting')} activeOpacity={0.75}>
                <Text style={styles.sheetDayLabel}>Day you want</Text>
                <Text style={[styles.sheetDayValue, !gettingDay && styles.sheetDayPlaceholder]}>
                  {gettingDay || 'Select date →'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Reason chips */}
            <Text style={styles.modalSectionLabel}>REASON</Text>
            <View style={styles.chipGrid}>
              {QUICK_REASONS.map(r => (
                <TouchableOpacity
                  key={r}
                  style={[styles.reasonChip, reason === r && styles.reasonChipSelected]}
                  onPress={() => setReason(r)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.reasonChipText, reason === r && styles.reasonChipTextSelected]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* "Other" comment field */}
            {reason === 'Other' && (
              <TextInput
                style={styles.otherInput}
                placeholder="Describe your reason…"
                placeholderTextColor={Colors.textDisabled}
                value={otherNote}
                onChangeText={setOtherNote}
                multiline
                numberOfLines={2}
                autoFocus
              />
            )}

            <TouchableOpacity
              style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit}
              activeOpacity={0.8}
            >
              <Text style={styles.submitBtnText}>Send Request to Sarah</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Date picker sheets — rendered outside main modal */}
      <DatePickerSheet
        visible={pickerFor === 'giving'}
        title="Select: Your day to give"
        selected={givingDay}
        onSelect={setGivingDay}
        onClose={() => setPickerFor(null)}
      />
      <DatePickerSheet
        visible={pickerFor === 'getting'}
        title="Select: Day you want"
        selected={gettingDay}
        onSelect={setGettingDay}
        onClose={() => setPickerFor(null)}
      />
    </>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: string }) {
  const m: Record<string, { emoji: string; text: string }> = {
    pending:  { emoji: '🎉', text: "No pending requests\nYou're all caught up" },
    approved: { emoji: '✅', text: 'No approved swaps yet' },
    rejected: { emoji: '👌', text: 'No declined requests' },
    all:      { emoji: '🔄', text: 'No swap requests yet\nTap + to create one' },
  };
  const msg = m[filter] ?? m.all;
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>{msg.emoji}</Text>
      <Text style={styles.emptyText}>{msg.text}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SwapsScreen() {
  const [swaps,   setSwaps]   = useState<Swap[]>(INITIAL_SWAPS);
  const [filter,  setFilter]  = useState<SwapStatus | 'all'>('all');
  const [modal,   setModal]   = useState(false);
  const [toast,   setToast]   = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function handleApprove(id: string) {
    setSwaps(prev => prev.map(s => s.id === id ? { ...s, status: 'approved' } : s));
    showToast('✓  Swap approved');
  }
  function handleDecline(id: string) {
    setSwaps(prev => prev.map(s => s.id === id ? { ...s, status: 'rejected' } : s));
    showToast('Swap declined');
  }

  function handleNewSwap(givingDay: string, gettingDay: string, reason: string) {
    const newSwap: Swap = {
      id:         `sw${Date.now()}`,
      direction:  'outgoing',
      from:       'You',
      fromEmoji:  '👨',
      givingDay,
      gettingDay,
      reason,
      status:     'pending',
      date:       'Just now',
    };
    setSwaps(prev => [newSwap, ...prev]);
    setModal(false);
    showToast('📩  Swap request sent to Sarah');
  }

  const filtered = filter === 'all' ? swaps : swaps.filter(s => s.status === filter);
  const sorted   = [...filtered].sort((a, b) => {
    const ord: Record<SwapStatus, number> = { pending:0, approved:1, rejected:2 };
    return ord[a.status] - ord[b.status];
  });

  const pendingCount = swaps.filter(s => s.status === 'pending' && s.direction === 'incoming').length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {toast && (
        <View style={styles.toast} pointerEvents="none">
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.screenTitle}>Swaps</Text>
            <Text style={styles.screenSub}>
              {pendingCount > 0 ? `${pendingCount} request${pendingCount > 1 ? 's' : ''} need your attention` : 'Custody day exchanges'}
            </Text>
          </View>
          <TouchableOpacity style={styles.newBtn} onPress={() => setModal(true)} activeOpacity={0.8}>
            <Text style={styles.newBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Summary */}
        <View style={styles.summaryStrip}>
          {[
            { label:'Pending',  count: swaps.filter(s => s.status === 'pending').length,  color: Colors.warning     },
            { label:'Approved', count: swaps.filter(s => s.status === 'approved').length, color: Colors.success     },
            { label:'Declined', count: swaps.filter(s => s.status === 'rejected').length, color: Colors.textDisabled},
          ].map((item, i) => (
            <View key={item.label} style={[styles.summaryItem, i < 2 && styles.summaryDivider]}>
              <Text style={[styles.summaryCount, { color: item.color }]}>{item.count}</Text>
              <Text style={styles.summaryLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Filter tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.75}
            >
              <Text style={[styles.filterTabText, filter === f.key && styles.filterTabTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Cards */}
        {sorted.length === 0
          ? <EmptyState filter={filter} />
          : sorted.map(swap => (
              <SwapCard key={swap.id} swap={swap} onApprove={handleApprove} onDecline={handleDecline} />
            ))
        }
        <View style={{ height: Layout.screenPaddingB }} />
      </ScrollView>

      <NewSwapModal
        visible={modal}
        onClose={() => setModal(false)}
        onSubmit={handleNewSwap}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: Colors.background },
  scroll:    { paddingHorizontal: Layout.screenPaddingH, paddingTop: Spacing.md },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  screenTitle: { ...Typography.h1 },
  screenSub:   { ...Typography.small, marginTop: 2 },
  newBtn:      { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', ...Shadows.card },
  newBtnText:  { fontSize: 26, color: Colors.textInverse, lineHeight: 30, fontWeight: '300' },

  summaryStrip:  { flexDirection: 'row', backgroundColor: Colors.card, borderRadius: Radius.lg, marginBottom: Spacing.md, ...Shadows.card },
  summaryItem:   { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
  summaryDivider:{ borderRightWidth: 1, borderRightColor: Colors.border },
  summaryCount:  { fontSize: 24, fontWeight: '800' },
  summaryLabel:  { ...Typography.tiny, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.4 },

  filterRow:           { gap: Spacing.sm, marginBottom: Spacing.lg, paddingRight: Spacing.md },
  filterTab:           { paddingVertical: 8, paddingHorizontal: 16, borderRadius: Radius.full, backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.border },
  filterTabActive:     { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterTabText:       { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  filterTabTextActive: { color: Colors.textInverse },

  swapCard: { marginBottom: Layout.cardGap },
  cardTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  cardFromRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  fromEmoji:   { fontSize: 28 },
  fromLabel:   { ...Typography.bodyBold },
  cardDate:    { ...Typography.small, marginTop: 1 },

  daysRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md, gap: Spacing.sm },
  dayBox:      { flex: 1 },
  dayBoxLabel: { ...Typography.tiny, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3 },
  dayBoxValue: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  arrowIcon:   { fontSize: 20, color: Colors.primary },

  reasonRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.xs },
  reasonIcon:{ fontSize: 14, marginTop: 1 },
  reasonText:{ ...Typography.body, flex: 1 },

  noteRow:  { backgroundColor: Colors.background, borderRadius: Radius.sm, padding: Spacing.sm, marginBottom: Spacing.xs, marginTop: Spacing.xs },
  noteText: { ...Typography.small, fontStyle: 'italic' },

  actionRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  btnDecline:     { flex: 1, height: 46, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  btnDeclineText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  btnApprove:     { flex: 2, height: 46, borderRadius: Radius.md, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  btnApproveText: { fontSize: 14, fontWeight: '700', color: Colors.textInverse },

  waitingRow:  { marginTop: Spacing.md, backgroundColor: Colors.warningBg, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  waitingText: { fontSize: 13, fontWeight: '500', color: Colors.warningText },

  emptyState: { paddingVertical: Spacing.xxl, alignItems: 'center', gap: Spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyText:  { ...Typography.body, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24 },

  toast:     { position:'absolute', top:60, left:Layout.screenPaddingH, right:Layout.screenPaddingH, zIndex:999, backgroundColor:Colors.textPrimary, borderRadius:Radius.md, paddingVertical:12, paddingHorizontal:Spacing.md, alignItems:'center', ...Shadows.modal },
  toastText: { color: Colors.textInverse, fontSize: 14, fontWeight: '600' },

  // Modals
  overlay:    { flex:1, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'flex-end' },
  modalSheet: { backgroundColor:Colors.card, borderTopLeftRadius:Radius.xl, borderTopRightRadius:Radius.xl, padding:Layout.screenPaddingH, paddingBottom:Spacing.xxl, ...Shadows.modal },
  dateSheet:  { backgroundColor:Colors.card, borderTopLeftRadius:Radius.xl, borderTopRightRadius:Radius.xl, padding:Layout.screenPaddingH, paddingBottom:Spacing.xxl, maxHeight:'70%', ...Shadows.modal },
  sheetHandle:{ width:40, height:4, borderRadius:2, backgroundColor:Colors.border, alignSelf:'center', marginBottom:Spacing.lg },
  sheetTitle: { ...Typography.h2, marginBottom: Spacing.xs },
  sheetSub:   { ...Typography.small, marginBottom: Spacing.lg },

  dateSheetTitle:{ ...Typography.h3, marginBottom: Spacing.md },
  dateList:      { maxHeight: 320 },
  dateRow:       { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical:14, borderBottomWidth:1, borderBottomColor:Colors.border },
  dateRowActive: { backgroundColor: '#F5F3FF' },
  dateRowText:   { fontSize:15, color:Colors.textPrimary },
  dateRowTextActive: { color:Colors.primary, fontWeight:'700' },
  dateRowCheck:  { fontSize:16, color:Colors.primary, fontWeight:'700' },

  sheetDaysRow: { flexDirection:'row', alignItems:'center', gap:Spacing.sm, marginBottom:Spacing.lg },
  sheetDayBtn:  { flex:1, backgroundColor:Colors.background, borderRadius:Radius.md, padding:Spacing.md, borderWidth:1.5, borderColor:Colors.border },
  sheetDayLabel:{ ...Typography.tiny, textTransform:'uppercase', letterSpacing:0.4, marginBottom:4 },
  sheetDayValue:{ fontSize:13, fontWeight:'700', color:Colors.primary },
  sheetDayPlaceholder: { color: Colors.textDisabled, fontWeight: '500' },
  sheetArrow:   { fontSize:20, color:Colors.primary },

  modalSectionLabel: { ...Typography.label, marginBottom: Spacing.sm },
  chipGrid:          { flexDirection:'row', flexWrap:'wrap', gap:Spacing.sm, marginBottom:Spacing.md },
  reasonChip:        { paddingVertical:8, paddingHorizontal:14, borderRadius:Radius.full, backgroundColor:Colors.background, borderWidth:1.5, borderColor:Colors.border },
  reasonChipSelected:{ backgroundColor:'#EDE9FE', borderColor:Colors.primary },
  reasonChipText:    { fontSize:13, fontWeight:'600', color:Colors.textSecondary },
  reasonChipTextSelected:{ color:Colors.primary },

  otherInput: {
    borderWidth:1.5, borderColor:Colors.border, borderRadius:Radius.md,
    padding:Spacing.md, fontSize:15, color:Colors.textPrimary,
    height:72, textAlignVertical:'top', marginBottom:Spacing.md,
  },

  submitBtn:        { height:Layout.buttonHeight, borderRadius:Radius.md, backgroundColor:Colors.primary, alignItems:'center', justifyContent:'center', marginBottom:Spacing.sm },
  submitBtnDisabled:{ opacity:0.4 },
  submitBtnText:    { fontSize:15, fontWeight:'700', color:Colors.textInverse },
  cancelBtn:        { alignItems:'center', paddingVertical:Spacing.md },
  cancelBtnText:    { fontSize:14, fontWeight:'600', color:Colors.textSecondary },
});
