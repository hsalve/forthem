import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, Pressable, Dimensions, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadows, Layout, Typography } from '../theme';
import { Card, Chip, SectionHeader } from '../components';

// ─── Types ────────────────────────────────────────────────────────────────────

type ExpenseStatus = 'pending' | 'approved' | 'settled';
type Payer         = 'you' | 'sarah';
type SplitType     = '50/50' | 'percentage' | 'exact' | 'plan';
type Recurring     = 'none' | 'weekly' | 'monthly';

type Expense = {
  id: string; title: string; category: string;
  emoji: string; categoryColor: string;
  amount: number; paidBy: Payer;
  splitType: SplitType; yourPercent: number;
  recurring: Recurring;
  status: ExpenseStatus; date: string; note?: string;
};

// ─── Categories ───────────────────────────────────────────────────────────────

const CATEGORIES: Record<string, { emoji: string; color: string; bg: string }> = {
  Daycare:   { emoji: '🧸', color: '#F472B6', bg: '#FDE8F0' },
  School:    { emoji: '🎒', color: '#6C63FF', bg: '#EDE9FE' },
  Medical:   { emoji: '🏥', color: '#F2C94C', bg: '#FEF9E7' },
  Sport:     { emoji: '⚽', color: '#6FCF97', bg: '#E8F8F0' },
  Food:      { emoji: '🍎', color: '#F472B6', bg: '#FDE8F0' },
  Clothing:  { emoji: '👕', color: '#A78BFA', bg: '#F3F0FF' },
  Transport: { emoji: '🚌', color: '#FB923C', bg: '#FFF1E6' },
  Activity:  { emoji: '🎨', color: '#38BDF8', bg: '#E0F2FE' },
  Other:     { emoji: '📦', color: '#9CA3AF', bg: '#F3F4F6' },
};

// Parenting plan split percentages (your %)
const PLAN_RULES: Record<string, number> = {
  Daycare: 65, Medical: 50, School: 50, Activity: 50,
  Sport: 50, Food: 50, Clothing: 50, Transport: 50, Other: 50,
};

const SPLIT_OPTIONS: { key: SplitType; label: string; sub: string }[] = [
  { key: '50/50',      label: '50/50',         sub: 'Equal split'        },
  { key: 'percentage', label: '%',              sub: 'Custom %'           },
  { key: 'exact',      label: 'Exact',          sub: 'Dollar amount'      },
  { key: 'plan',       label: 'Plan',           sub: 'Parenting rule'     },
];

const RECURRING_OPTIONS: { key: Recurring; label: string; emoji: string }[] = [
  { key: 'none',    label: 'One-time', emoji: '1️⃣' },
  { key: 'weekly',  label: 'Weekly',   emoji: '📅' },
  { key: 'monthly', label: 'Monthly',  emoji: '📆' },
];

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_EXPENSES: Expense[] = [
  { id:'ex0', title:'Bright Stars Daycare', category:'Daycare', emoji:'🧸', categoryColor:'#F472B6', amount:320.00, paidBy:'you', splitType:'plan', yourPercent:65, recurring:'weekly', status:'pending', date:'Today', note:'Week of 23 Jun — plan rule 65/35' },
  { id:'ex1', title:'School shoes',          category:'School',   emoji:'👟', categoryColor:'#6C63FF', amount:64.00,  paidBy:'sarah', splitType:'50/50', yourPercent:50, recurring:'none', status:'pending', date:'Today',     note:'New trainers for PE class' },
  { id:'ex2', title:'Flu medication',        category:'Medical',  emoji:'💊', categoryColor:'#F2C94C', amount:18.50,  paidBy:'you',   splitType:'plan',  yourPercent:50, recurring:'none', status:'pending', date:'Yesterday'  },
  { id:'ex3', title:'Football club reg.',    category:'Sport',    emoji:'⚽', categoryColor:'#6FCF97', amount:120.00, paidBy:'you',   splitType:'50/50', yourPercent:50, recurring:'monthly', status:'approved', date:'10 Jun', note:'Summer season' },
  { id:'ex4', title:'School trip deposit',   category:'School',   emoji:'🎒', categoryColor:'#6C63FF', amount:45.00,  paidBy:'sarah', splitType:'50/50', yourPercent:50, recurring:'none', status:'settled', date:'5 Jun'   },
  { id:'ex5', title:'Art supplies',          category:'Activity', emoji:'🎨', categoryColor:'#38BDF8', amount:32.00,  paidBy:'you',   splitType:'50/50', yourPercent:50, recurring:'none', status:'settled', date:'2 Jun'   },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function yourShare(e: Expense): number {
  return parseFloat((e.amount * (e.yourPercent / 100)).toFixed(2));
}
function netBalance(expenses: Expense[]): number {
  return expenses.filter(e => e.status !== 'settled').reduce((acc, e) => {
    const share = yourShare(e);
    return e.paidBy === 'you' ? acc + share : acc - share;
  }, 0);
}
function fmt(n: number): string { return `$${Math.abs(n).toFixed(2)}`; }

// ─── Balance Hero ─────────────────────────────────────────────────────────────

function BalanceHero({ expenses }: { expenses: Expense[] }) {
  const balance = netBalance(expenses);
  const isOwed  = balance >= 0;
  const paid    = expenses.filter(e => e.paidBy === 'you').reduce((a, e) => a + e.amount, 0);
  const pending = expenses.filter(e => e.status === 'pending').length;

  return (
    <View style={styles.hero}>
      <View style={styles.heroMain}>
        <Text style={styles.heroLabel}>{isOwed ? 'Sarah owes you' : 'You owe Sarah'}</Text>
        <Text style={[styles.heroAmount, { color: isOwed ? '#A7F3D0' : '#FCA5A5' }]}>{fmt(balance)}</Text>
        {pending > 0 && <Text style={styles.heroPending}>{pending} expense{pending>1?'s':''} pending approval</Text>}
      </View>
      <View style={styles.heroDivider} />
      <View style={styles.heroStats}>
        <View style={styles.heroStat}>
          <Text style={styles.heroStatValue}>{fmt(paid)}</Text>
          <Text style={styles.heroStatLabel}>You paid{'\n'}this month</Text>
        </View>
        <View style={styles.heroStatDivider} />
        <View style={styles.heroStat}>
          <Text style={styles.heroStatValue}>{fmt(expenses.filter(e=>e.status==='settled').reduce((a,e)=>a+e.amount,0))}</Text>
          <Text style={styles.heroStatLabel}>Settled{'\n'}this month</Text>
        </View>
        <View style={styles.heroStatDivider} />
        <View style={styles.heroStat}>
          <Text style={styles.heroStatValue}>{expenses.length}</Text>
          <Text style={styles.heroStatLabel}>Total{'\n'}expenses</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Expense Card ─────────────────────────────────────────────────────────────

type ExpenseCardProps = { expense: Expense; onSettle:(id:string)=>void; onApprove:(id:string)=>void };

function ExpenseCard({ expense: e, onSettle, onApprove }: ExpenseCardProps) {
  const cat     = CATEGORIES[e.category] ?? CATEGORIES.Other;
  const share   = yourShare(e);
  const youPaid = e.paidBy === 'you';
  const settled = e.status === 'settled';

  const splitLabel = e.splitType === 'plan'
    ? `Plan: ${e.yourPercent}/${100 - e.yourPercent}`
    : e.splitType === '50/50' ? '50/50'
    : e.splitType === 'percentage' ? `${e.yourPercent}/${100 - e.yourPercent}`
    : 'Exact';

  return (
    <Card style={[styles.expenseCard, settled && { opacity: 0.7 }]}>
      <View style={styles.expCardTop}>
        <View style={[styles.catIcon, { backgroundColor: cat.bg }]}>
          <Text style={styles.catEmoji}>{cat.emoji}</Text>
        </View>
        <View style={styles.expCardInfo}>
          <View style={styles.expTitleRow}>
            <Text style={styles.expTitle} numberOfLines={1}>{e.title}</Text>
            {e.recurring !== 'none' && (
              <View style={styles.recurringPill}>
                <Text style={styles.recurringPillText}>{e.recurring === 'weekly' ? '↻ Weekly' : '↻ Monthly'}</Text>
              </View>
            )}
          </View>
          <Text style={styles.expMeta}>{e.category}  ·  {e.date}</Text>
        </View>
        <View style={styles.expAmountCol}>
          <Text style={styles.expAmount}>{fmt(e.amount)}</Text>
          <Text style={styles.expAmountSub}>total</Text>
        </View>
      </View>

      <View style={styles.splitRow}>
        <View style={[styles.paidByPill, { backgroundColor: youPaid ? '#EDE9FE' : '#FDE8F0' }]}>
          <Text style={styles.paidByIcon}>{youPaid ? '👨' : '👩'}</Text>
          <Text style={[styles.paidByText, { color: youPaid ? Colors.primary : '#9D174D' }]}>
            {youPaid ? 'You paid' : 'Sarah paid'}
          </Text>
        </View>
        <View style={styles.splitRight}>
          <Text style={styles.shareLabel}>{splitLabel}  ·  Your share</Text>
          <Text style={[styles.shareAmount, { color: youPaid ? Colors.successText : Colors.errorText }]}>
            {youPaid ? '+' : '-'}{fmt(share)}
          </Text>
        </View>
      </View>

      {e.note && <Text style={styles.expNote}>"{e.note}"</Text>}

      <View style={styles.expFooter}>
        <Chip
          label={e.status === 'settled' ? 'Settled' : e.status === 'approved' ? 'Approved' : 'Pending'}
          variant={e.status === 'settled' ? 'approved' : e.status === 'approved' ? 'approved' : 'pending'}
        />
        {!settled && (
          <View style={styles.expActions}>
            {e.status === 'pending' && (
              <TouchableOpacity style={styles.actionBtnOutline} onPress={() => onApprove(e.id)} activeOpacity={0.75}>
                <Text style={styles.actionBtnOutlineText}>Approve</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.actionBtnFill} onPress={() => onSettle(e.id)} activeOpacity={0.75}>
              <Text style={styles.actionBtnFillText}>Settle</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Card>
  );
}

// ─── Add Expense Modal ────────────────────────────────────────────────────────

type AddExpenseModalProps = {
  visible: boolean; onClose: () => void;
  onSubmit: (e: Omit<Expense, 'id' | 'status' | 'date'>) => void;
};

function AddExpenseModal({ visible, onClose, onSubmit }: AddExpenseModalProps) {
  const [selectedCategory, setCategory]  = useState<string | null>(null);
  const [paidBy,    setPaidBy]           = useState<Payer>('you');
  const [splitType, setSplitType]        = useState<SplitType>('50/50');
  const [yourPct,   setYourPct]          = useState('50');
  const [yourExact, setYourExact]        = useState('');
  const [recurring, setRecurring]        = useState<Recurring>('none');
  const [amountStr, setAmountStr]        = useState('000');
  const amountDisplay = (parseInt(amountStr, 10) / 100).toFixed(2);
  const total = parseFloat(amountDisplay);

  function pickCategory(cat: string) {
    setCategory(cat);
    // Auto-select plan for Daycare / Medical
    if (cat === 'Daycare' || cat === 'Medical') setSplitType('plan');
    else if (splitType === 'plan') setSplitType('50/50');
    // Auto-set recurring for Daycare
    if (cat === 'Daycare') setRecurring('weekly');
    else if (recurring === 'weekly') setRecurring('none');
  }

  function getYourPercent(): number {
    if (splitType === '50/50') return 50;
    if (splitType === 'plan')  return selectedCategory ? (PLAN_RULES[selectedCategory] ?? 50) : 50;
    if (splitType === 'percentage') return Math.min(100, Math.max(0, parseFloat(yourPct) || 0));
    if (splitType === 'exact') {
      const exact = parseFloat(yourExact) || 0;
      return total > 0 ? Math.min(100, (exact / total) * 100) : 50;
    }
    return 50;
  }

  const yourPercent = getYourPercent();
  const sarahPercent = 100 - yourPercent;
  const yourShareAmt = (total * yourPercent / 100).toFixed(2);
  const sarahShareAmt = (total * sarahPercent / 100).toFixed(2);

  function pressDigit(d: string) {
    setAmountStr(prev => {
      const next = (prev + d).replace(/^0+/, '') || '0';
      return next.length > 6 ? prev : next.padStart(3, '0');
    });
  }
  function pressBackspace() {
    setAmountStr(prev => (prev.slice(0, -1) || '0').padStart(3, '0'));
  }

  function handleSubmit() {
    if (!selectedCategory) return;
    const cat = CATEGORIES[selectedCategory] ?? CATEGORIES.Other;
    onSubmit({
      title: `${selectedCategory} expense`,
      category: selectedCategory,
      emoji: cat.emoji, categoryColor: cat.color,
      amount: total, paidBy,
      splitType, yourPercent,
      recurring,
    });
    setCategory(null); setPaidBy('you'); setSplitType('50/50');
    setYourPct('50'); setYourExact(''); setRecurring('none'); setAmountStr('000');
  }

  const DIGITS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];
  const { width: SW } = Dimensions.get('window');
  const keyW = (SW - Layout.screenPaddingH * 2 - Spacing.sm * 2) / 3;

  const canSave = selectedCategory && total > 0;

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={e => e.stopPropagation()}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Add Expense</Text>

            {/* Amount */}
            <View style={styles.amountDisplay}>
              <Text style={styles.amountCurrency}>$</Text>
              <Text style={styles.amountValue}>{amountDisplay}</Text>
            </View>
            <View style={styles.numpad}>
              {DIGITS.map((d, i) => (
                <TouchableOpacity
                  key={i} style={[styles.numKey, { width: keyW }, d==='' && styles.numKeyEmpty]}
                  onPress={() => d==='⌫' ? pressBackspace() : d!=='' ? pressDigit(d) : null}
                  activeOpacity={d==='' ? 1 : 0.6}
                >
                  <Text style={[styles.numKeyText, d==='⌫' && { fontSize:20 }]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Paid by */}
            <Text style={styles.modalSectionLabel}>PAID BY</Text>
            <View style={styles.toggleRow}>
              {(['you','sarah'] as Payer[]).map(p => (
                <TouchableOpacity key={p} style={[styles.toggleBtn, paidBy===p && styles.toggleBtnActive]} onPress={() => setPaidBy(p)} activeOpacity={0.75}>
                  <Text style={styles.toggleBtnIcon}>{p==='you' ? '👨' : '👩'}</Text>
                  <Text style={[styles.toggleBtnText, paidBy===p && styles.toggleBtnTextActive]}>{p==='you' ? 'You' : 'Sarah'}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Category */}
            <Text style={styles.modalSectionLabel}>CATEGORY</Text>
            <View style={styles.catGrid}>
              {Object.entries(CATEGORIES).map(([key, cat]) => {
                const active = selectedCategory === key;
                return (
                  <TouchableOpacity key={key} style={[styles.catChip, active && { backgroundColor: cat.bg, borderColor: cat.color }]} onPress={() => pickCategory(key)} activeOpacity={0.75}>
                    <Text style={styles.catChipEmoji}>{cat.emoji}</Text>
                    <Text style={[styles.catChipLabel, active && { color: cat.color }]}>{key}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Split type */}
            <Text style={styles.modalSectionLabel}>SPLIT</Text>
            <View style={styles.splitOptionRow}>
              {SPLIT_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.splitOptionBtn, splitType === opt.key && styles.splitOptionBtnActive]}
                  onPress={() => setSplitType(opt.key)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.splitOptionLabel, splitType === opt.key && styles.splitOptionLabelActive]}>{opt.label}</Text>
                  <Text style={[styles.splitOptionSub, splitType === opt.key && { color: Colors.primary }]}>{opt.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Split detail inputs */}
            {splitType === 'percentage' && (
              <View style={styles.splitInputRow}>
                <View style={styles.splitInputBox}>
                  <Text style={styles.splitInputLabel}>Your %</Text>
                  <TextInput
                    style={styles.splitInput}
                    value={yourPct}
                    onChangeText={setYourPct}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                </View>
                <Text style={styles.splitInputDivider}>/</Text>
                <View style={styles.splitInputBox}>
                  <Text style={styles.splitInputLabel}>Sarah's %</Text>
                  <Text style={styles.splitInputReadonly}>{Math.max(0, 100 - (parseFloat(yourPct)||0))}%</Text>
                </View>
              </View>
            )}

            {splitType === 'exact' && (
              <View style={styles.splitInputRow}>
                <View style={styles.splitInputBox}>
                  <Text style={styles.splitInputLabel}>Your amount</Text>
                  <TextInput
                    style={styles.splitInput}
                    placeholder="0.00"
                    value={yourExact}
                    onChangeText={setYourExact}
                    keyboardType="decimal-pad"
                  />
                </View>
                <Text style={styles.splitInputDivider}>/</Text>
                <View style={styles.splitInputBox}>
                  <Text style={styles.splitInputLabel}>Sarah's amount</Text>
                  <Text style={styles.splitInputReadonly}>
                    ${Math.max(0, total - (parseFloat(yourExact)||0)).toFixed(2)}
                  </Text>
                </View>
              </View>
            )}

            {splitType === 'plan' && selectedCategory && (
              <View style={styles.planRuleBox}>
                <Text style={styles.planRuleIcon}>⚖️</Text>
                <Text style={styles.planRuleText}>
                  Parenting plan: {selectedCategory} → {yourPercent}/{sarahPercent} split
                </Text>
              </View>
            )}

            {/* Split preview */}
            {total > 0 && (
              <View style={styles.splitPreview}>
                <View style={styles.splitPreviewItem}>
                  <Text style={styles.splitPreviewLabel}>👨 You pay</Text>
                  <Text style={[styles.splitPreviewAmt, { color: Colors.primary }]}>${yourShareAmt}</Text>
                </View>
                <View style={styles.splitPreviewDivider} />
                <View style={styles.splitPreviewItem}>
                  <Text style={styles.splitPreviewLabel}>👩 Sarah pays</Text>
                  <Text style={[styles.splitPreviewAmt, { color: '#9D174D' }]}>${sarahShareAmt}</Text>
                </View>
              </View>
            )}

            {/* Recurring */}
            <Text style={styles.modalSectionLabel}>FREQUENCY</Text>
            <View style={styles.toggleRow}>
              {RECURRING_OPTIONS.map(r => (
                <TouchableOpacity key={r.key} style={[styles.toggleBtn, recurring===r.key && styles.toggleBtnActive]} onPress={() => setRecurring(r.key)} activeOpacity={0.75}>
                  <Text style={styles.toggleBtnIcon}>{r.emoji}</Text>
                  <Text style={[styles.toggleBtnText, recurring===r.key && styles.toggleBtnTextActive]}>{r.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
              onPress={handleSubmit}
              disabled={!canSave}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>Add Expense</Text>
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

const FILTERS: { key: 'all' | ExpenseStatus; label: string }[] = [
  { key:'all', label:'All' }, { key:'pending', label:'Pending' },
  { key:'approved', label:'Approved' }, { key:'settled', label:'Settled' },
];

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [filter,   setFilter]   = useState<'all' | ExpenseStatus>('all');
  const [modal,    setModal]    = useState(false);
  const [toast,    setToast]    = useState<string | null>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2500); }

  function handleSettle(id: string)  { setExpenses(p => p.map(e => e.id===id ? {...e, status:'settled'} : e)); showToast('✓  Marked as settled'); }
  function handleApprove(id: string) { setExpenses(p => p.map(e => e.id===id ? {...e, status:'approved'} : e)); showToast('✓  Expense approved'); }

  function handleAdd(data: Omit<Expense,'id'|'status'|'date'>) {
    setExpenses(prev => [{ ...data, id:`ex${Date.now()}`, status:'pending', date:'Just now' }, ...prev]);
    setModal(false);
    showToast('💰  Expense added');
  }

  const filtered = filter === 'all' ? expenses : expenses.filter(e => e.status === filter);
  const sorted   = [...filtered].sort((a, b) => {
    const ord: Record<ExpenseStatus, number> = { pending:0, approved:1, settled:2 };
    return ord[a.status] - ord[b.status];
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {toast && <View style={styles.toast} pointerEvents="none"><Text style={styles.toastText}>{toast}</Text></View>}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Expenses</Text>
          <Text style={styles.screenSub}>Shared costs for Noah</Text>
        </View>

        <BalanceHero expenses={expenses} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity key={f.key} style={[styles.filterTab, filter===f.key && styles.filterTabActive]} onPress={() => setFilter(f.key)} activeOpacity={0.75}>
              <Text style={[styles.filterTabText, filter===f.key && styles.filterTabTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <SectionHeader title={filter==='all' ? 'All expenses' : `${filter.charAt(0).toUpperCase()+filter.slice(1)} expenses`} style={{ marginBottom: Spacing.sm }} />

        {sorted.length === 0 ? (
          <View style={styles.emptyState}><Text style={styles.emptyEmoji}>✨</Text><Text style={styles.emptyText}>No {filter} expenses</Text></View>
        ) : (
          sorted.map(e => <ExpenseCard key={e.id} expense={e} onSettle={handleSettle} onApprove={handleApprove} />)
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setModal(true)} activeOpacity={0.85}>
        <Text style={styles.fabIcon}>+</Text>
        <Text style={styles.fabLabel}>Add Expense</Text>
      </TouchableOpacity>

      <AddExpenseModal visible={modal} onClose={() => setModal(false)} onSubmit={handleAdd} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Layout.screenPaddingH, paddingTop: Spacing.md },

  header:      { marginBottom: Spacing.lg },
  screenTitle: { ...Typography.h1 },
  screenSub:   { ...Typography.small, marginTop: 2 },

  hero:        { borderRadius: Radius.xl, backgroundColor: Colors.textPrimary, padding: Spacing.lg, marginBottom: Spacing.lg, ...Shadows.modal },
  heroMain:    { alignItems: 'center', paddingBottom: Spacing.lg },
  heroLabel:   { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: 0.5 },
  heroAmount:  { fontSize: 52, fontWeight: '800', letterSpacing: -1, marginTop: 4 },
  heroPending: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 6 },
  heroDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: Spacing.lg },
  heroStats:   { flexDirection: 'row' },
  heroStat:    { flex: 1, alignItems: 'center' },
  heroStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  heroStatValue:   { fontSize: 17, fontWeight: '700', color: Colors.textInverse },
  heroStatLabel:   { fontSize: 11, color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginTop: 3, lineHeight: 15 },

  filterRow:           { gap: Spacing.sm, marginBottom: Spacing.md, paddingRight: Spacing.md },
  filterTab:           { paddingVertical: 8, paddingHorizontal: 16, borderRadius: Radius.full, backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.border },
  filterTabActive:     { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterTabText:       { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  filterTabTextActive: { color: Colors.textInverse },

  expenseCard:  { marginBottom: Layout.cardGap },
  expCardTop:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  catIcon:      { width: 46, height: 46, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  catEmoji:     { fontSize: 22 },
  expCardInfo:  { flex: 1 },
  expTitleRow:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flexWrap: 'wrap' },
  expTitle:     { ...Typography.bodyBold, flex: 1 },
  recurringPill:{ backgroundColor: '#EDE9FE', paddingVertical: 2, paddingHorizontal: 6, borderRadius: Radius.full },
  recurringPillText: { fontSize: 10, fontWeight: '700', color: Colors.primary },
  expMeta:      { ...Typography.small, marginTop: 2 },
  expAmountCol: { alignItems: 'flex-end' },
  expAmount:    { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  expAmountSub: { ...Typography.tiny, marginTop: 1 },

  splitRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.background, borderRadius: Radius.md, paddingVertical: 10, paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  paidByPill:{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4, paddingHorizontal: 10, borderRadius: Radius.full },
  paidByIcon:{ fontSize: 14 },
  paidByText:{ fontSize: 12, fontWeight: '700' },
  splitRight:{ alignItems: 'flex-end' },
  shareLabel:{ ...Typography.tiny, textTransform: 'uppercase', letterSpacing: 0.3 },
  shareAmount:{ fontSize: 15, fontWeight: '800', marginTop: 1 },

  expNote:    { ...Typography.small, fontStyle: 'italic', marginBottom: Spacing.sm, paddingHorizontal: Spacing.sm },
  expFooter:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.xs },
  expActions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtnOutline:     { paddingVertical: 7, paddingHorizontal: 14, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border },
  actionBtnOutlineText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  actionBtnFill:        { paddingVertical: 7, paddingHorizontal: 14, borderRadius: Radius.md, backgroundColor: Colors.primary },
  actionBtnFillText:    { fontSize: 13, fontWeight: '600', color: Colors.textInverse },

  emptyState: { paddingVertical: Spacing.xxl, alignItems: 'center', gap: Spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyText:  { ...Typography.body, color: Colors.textSecondary },

  fab:      { position:'absolute', bottom:24, right:Layout.screenPaddingH, flexDirection:'row', alignItems:'center', gap:Spacing.sm, backgroundColor:Colors.primary, borderRadius:Radius.full, paddingVertical:14, paddingHorizontal:22, ...Shadows.modal },
  fabIcon:  { fontSize: 22, color: Colors.textInverse, lineHeight: 24, fontWeight: '300' },
  fabLabel: { fontSize: 15, fontWeight: '700', color: Colors.textInverse },

  toast:     { position:'absolute', top:60, left:Layout.screenPaddingH, right:Layout.screenPaddingH, zIndex:999, backgroundColor:Colors.textPrimary, borderRadius:Radius.md, paddingVertical:12, paddingHorizontal:Spacing.md, alignItems:'center', ...Shadows.modal },
  toastText: { color: Colors.textInverse, fontSize: 14, fontWeight: '600' },

  overlay:    { flex:1, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'flex-end' },
  modalSheet: { backgroundColor:Colors.card, borderTopLeftRadius:Radius.xl, borderTopRightRadius:Radius.xl, padding:Layout.screenPaddingH, paddingBottom:Spacing.xxl, maxHeight:'92%', ...Shadows.modal },
  sheetHandle:{ width:40, height:4, borderRadius:2, backgroundColor:Colors.border, alignSelf:'center', marginBottom:Spacing.lg },
  sheetTitle: { ...Typography.h2, marginBottom: Spacing.lg, textAlign: 'center' },

  amountDisplay:   { flexDirection:'row', alignItems:'flex-end', justifyContent:'center', marginBottom:Spacing.lg, gap:6 },
  amountCurrency:  { fontSize:28, fontWeight:'300', color:Colors.textSecondary, paddingBottom:4 },
  amountValue:     { fontSize:56, fontWeight:'800', color:Colors.textPrimary, letterSpacing:-2, lineHeight:62 },

  numpad:      { flexDirection:'row', flexWrap:'wrap', marginBottom:Spacing.lg, gap:Spacing.sm },
  numKey:      { height:52, borderRadius:Radius.md, backgroundColor:Colors.background, alignItems:'center', justifyContent:'center' },
  numKeyEmpty: { backgroundColor:'transparent' },
  numKeyText:  { fontSize:22, fontWeight:'500', color:Colors.textPrimary },

  modalSectionLabel: { ...Typography.label, marginBottom: Spacing.sm, marginTop: Spacing.md },
  toggleRow:  { flexDirection:'row', gap:Spacing.sm, marginBottom:Spacing.md },
  toggleBtn:  { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:6, height:48, borderRadius:Radius.md, backgroundColor:Colors.background, borderWidth:1.5, borderColor:Colors.border },
  toggleBtnActive:     { backgroundColor:'#EDE9FE', borderColor:Colors.primary },
  toggleBtnIcon:       { fontSize:18 },
  toggleBtnText:       { fontSize:14, fontWeight:'600', color:Colors.textSecondary },
  toggleBtnTextActive: { color:Colors.primary },

  catGrid:      { flexDirection:'row', flexWrap:'wrap', gap:Spacing.sm, marginBottom:Spacing.md },
  catChip:      { flexDirection:'row', alignItems:'center', gap:5, paddingVertical:8, paddingHorizontal:12, borderRadius:Radius.full, backgroundColor:Colors.background, borderWidth:1.5, borderColor:Colors.border },
  catChipEmoji: { fontSize:14 },
  catChipLabel: { fontSize:12, fontWeight:'600', color:Colors.textSecondary },

  splitOptionRow:      { flexDirection:'row', gap:Spacing.sm, marginBottom:Spacing.md },
  splitOptionBtn:      { flex:1, alignItems:'center', paddingVertical:10, borderRadius:Radius.md, backgroundColor:Colors.background, borderWidth:1.5, borderColor:Colors.border },
  splitOptionBtnActive:{ backgroundColor:'#EDE9FE', borderColor:Colors.primary },
  splitOptionLabel:    { fontSize:14, fontWeight:'700', color:Colors.textSecondary },
  splitOptionLabelActive:{ color:Colors.primary },
  splitOptionSub:      { fontSize:9, color:Colors.textDisabled, marginTop:2, fontWeight:'500' },

  splitInputRow:     { flexDirection:'row', alignItems:'center', gap:Spacing.md, marginBottom:Spacing.md, backgroundColor:Colors.background, borderRadius:Radius.md, padding:Spacing.md },
  splitInputBox:     { flex:1, alignItems:'center' },
  splitInputLabel:   { ...Typography.tiny, textTransform:'uppercase', letterSpacing:0.4, marginBottom:4 },
  splitInput:        { fontSize:18, fontWeight:'700', color:Colors.primary, borderBottomWidth:2, borderBottomColor:Colors.primary, paddingBottom:2, textAlign:'center', minWidth:60 },
  splitInputReadonly:{ fontSize:18, fontWeight:'700', color:Colors.textSecondary },
  splitInputDivider: { fontSize:20, color:Colors.textDisabled },

  planRuleBox:  { flexDirection:'row', alignItems:'center', gap:Spacing.sm, backgroundColor:Colors.warningBg, borderRadius:Radius.md, padding:Spacing.md, marginBottom:Spacing.md },
  planRuleIcon: { fontSize:16 },
  planRuleText: { fontSize:13, fontWeight:'600', color:Colors.warningText, flex:1 },

  splitPreview:      { flexDirection:'row', backgroundColor:Colors.background, borderRadius:Radius.md, marginBottom:Spacing.md, overflow:'hidden' },
  splitPreviewItem:  { flex:1, alignItems:'center', paddingVertical:Spacing.md },
  splitPreviewDivider:{ width:1, backgroundColor:Colors.border },
  splitPreviewLabel: { ...Typography.small, marginBottom:4 },
  splitPreviewAmt:   { fontSize:18, fontWeight:'800' },

  saveBtn:        { height:Layout.buttonHeight, borderRadius:Radius.md, backgroundColor:Colors.primary, alignItems:'center', justifyContent:'center', marginTop:Spacing.md },
  saveBtnDisabled:{ opacity:0.4 },
  saveBtnText:    { fontSize:15, fontWeight:'700', color:Colors.textInverse },
});
