import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback,
  ScrollView, Dimensions, Modal, Pressable, TextInput,
  Animated, PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft, ChevronRight, Plus, Clock, Calendar,
  Stethoscope, BookOpen, Activity, MoreHorizontal,
  Bell, ArrowLeftRight, X,
} from 'lucide-react-native';
import { Card, Icon } from '../components';
import { Colors, Spacing, Radius, Shadows, Layout, Typography } from '../theme';

// ─── Constants ────────────────────────────────────────────────────────────────

const { width: SW } = Dimensions.get('window');
const GRID_W        = SW - Layout.screenPaddingH * 2;
const CELL_SIZE     = Math.floor((GRID_W - Spacing.xs * 6) / 7);
const CELL_H        = CELL_SIZE + 14;

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS     = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

// ─── Custody palette ──────────────────────────────────────────────────────────

const CUSTODY = {
  dad: {
    bg:     '#ECEAFF',   // soft indigo wash
    solid:  '#6C63FF',   // brand purple
    ring:   '#6C63FF',
    text:   '#4338CA',
    label:  'You',
    emoji:  '👨',
  },
  mom: {
    bg:     '#FDE8F0',   // soft rose wash
    solid:  '#E879A0',   // deeper pink
    ring:   '#E879A0',
    text:   '#9D174D',
    label:  'Sarah',
    emoji:  '👩',
  },
} as const;
type Parent = keyof typeof CUSTODY;

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_YEAR  = 2026;
const MOCK_MONTH = 5; // June

const CUSTODY_SCHEDULE: Record<number, Parent> = {
   1:'dad',  2:'dad',  3:'dad',  4:'dad',  5:'dad',  6:'dad',  7:'dad',
   8:'mom',  9:'mom', 10:'mom', 11:'mom', 12:'mom', 13:'mom', 14:'mom',
  15:'dad', 16:'dad', 17:'dad', 18:'dad', 19:'dad', 20:'dad', 21:'dad',
  22:'mom', 23:'mom', 24:'mom', 25:'mom', 26:'mom', 27:'mom', 28:'mom',
  29:'dad', 30:'dad',
};

const EXCHANGE_DAYS = new Set([1, 8, 15, 22, 29]);

type CalEvent = {
  id: string; day: number; title: string;
  time: string; emoji: string; color: string; category: string;
};

const INITIAL_EVENTS: CalEvent[] = [
  { id:'e1', day:3,  title:'Football Practice',  time:'4:00 PM',  emoji:'⚽', color:'#22C55E', category:'Activity' },
  { id:'e2', day:10, title:'Doctor Appointment',  time:'10:30 AM', emoji:'🏥', color:'#F59E0B', category:'Medical'  },
  { id:'e3', day:15, title:'School Sports Day',   time:'9:00 AM',  emoji:'🏅', color:'#6C63FF', category:'School'   },
  { id:'e4', day:18, title:'Birthday Party',      time:'3:00 PM',  emoji:'🎂', color:'#EC4899', category:'Activity' },
  { id:'e5', day:22, title:'Dentist',             time:'2:00 PM',  emoji:'🦷', color:'#F59E0B', category:'Medical'  },
  { id:'e6', day:26, title:'School Play',         time:'6:30 PM',  emoji:'🎭', color:'#8B5CF6', category:'School'   },
  { id:'e7', day:29, title:'Football Match',      time:'11:00 AM', emoji:'⚽', color:'#22C55E', category:'Activity' },
];

const EVENT_CATEGORIES: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
  School:   { icon: BookOpen,      color: '#6C63FF', bg: '#ECEAFF' },
  Medical:  { icon: Stethoscope,   color: '#F59E0B', bg: '#FEF8E7' },
  Daycare:  { icon: Bell,          color: '#EC4899', bg: '#FDE8F0' },
  Activity: { icon: Activity,      color: '#22C55E', bg: '#DCFCE7' },
  Other:    { icon: MoreHorizontal,color: '#9CA3AF', bg: '#F0F1F5' },
};

const TIME_OPTIONS = [
  '8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM',
  '1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDaysInMonth(y: number, m: number)   { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfMonth(y: number, m: number){ return new Date(y, m, 1).getDay(); }
function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear()===d2.getFullYear()
    && d1.getMonth()===d2.getMonth()
    && d1.getDate()===d2.getDate();
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function Legend() {
  return (
    <View style={styles.legend}>
      {(['dad','mom'] as Parent[]).map(k => (
        <View key={k} style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: CUSTODY[k].solid }]} />
          <Text style={styles.legendText}>{CUSTODY[k].emoji} {CUSTODY[k].label}</Text>
        </View>
      ))}
      <View style={styles.legendItem}>
        <View style={styles.legendExchangePip} />
        <Text style={styles.legendText}>Exchange</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={styles.legendEventDot} />
        <Text style={styles.legendText}>Event</Text>
      </View>
    </View>
  );
}

// ─── Day Cell ─────────────────────────────────────────────────────────────────

type DayCellProps = {
  day:        number;
  parent:     Parent | null;
  isToday:    boolean;
  isSelected: boolean;
  isExchange: boolean;
  events:     CalEvent[];
  pulseAnim:  Animated.Value;
  onPress:    (d: number) => void;
  onLongPress:(d: number) => void;
};

function DayCell({
  day, parent, isToday, isSelected, isExchange, events, pulseAnim, onPress, onLongPress,
}: DayCellProps) {
  const custody = parent ? CUSTODY[parent] : null;

  // Background
  const bg = isSelected
    ? (custody?.solid ?? Colors.primary)
    : custody ? custody.bg : 'transparent';

  // Text color
  const textColor = isSelected
    ? Colors.textInverse
    : custody ? custody.text : Colors.textSecondary;

  // Today ring scale (pulse animation)
  const scale = isToday && !isSelected ? pulseAnim : 1;

  return (
    <TouchableOpacity
      onPress={() => onPress(day)}
      onLongPress={() => onLongPress(day)}
      delayLongPress={400}
      activeOpacity={0.75}
      style={styles.cellOuter}
    >
      <Animated.View
        style={[
          styles.cell,
          { backgroundColor: bg },
          // Today: animated ring
          isToday && !isSelected && {
            borderWidth:  2,
            borderColor:  custody?.solid ?? Colors.primary,
            transform:    [{ scale }],
          },
          // Selected today: stronger ring
          isToday && isSelected && {
            borderWidth: 2.5,
            borderColor: 'rgba(255,255,255,0.5)',
          },
        ]}
      >
        {/* Exchange pip — small amber badge top-right */}
        {isExchange && (
          <View style={[
            styles.exchangePip,
            { backgroundColor: isSelected ? 'rgba(255,255,255,0.7)' : '#F59E0B' },
          ]} />
        )}

        {/* Day number */}
        <Text style={[
          styles.dayNum,
          { color: textColor },
          isToday && { fontWeight: '800' },
        ]}>
          {day}
        </Text>

        {/* Event dots */}
        {events.length > 0 && (
          <View style={styles.dotRow}>
            {events.slice(0, 3).map(e => (
              <View
                key={e.id}
                style={[
                  styles.dot,
                  { backgroundColor: isSelected ? 'rgba(255,255,255,0.85)' : e.color },
                ]}
              />
            ))}
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Day Detail Card ──────────────────────────────────────────────────────────

type DayDetailProps = {
  day: number; month: number; year: number;
  parent: Parent | null; isExchange: boolean; events: CalEvent[];
  onAddEvent: () => void;
};

function DayDetail({ day, month, year, parent, isExchange, events, onAddEvent }: DayDetailProps) {
  const date    = new Date(year, month, day);
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const custody = parent ? CUSTODY[parent] : null;

  return (
    <Card noPadding style={styles.detailCard}>
      {/* Coloured header band */}
      <View style={[
        styles.detailHeader,
        { backgroundColor: custody ? custody.bg : Colors.neutralBg },
      ]}>
        <View>
          <Text style={styles.detailWeekday}>{weekday}</Text>
          <Text style={styles.detailDateStr}>{dateStr}</Text>
        </View>
        {custody && (
          <View style={[styles.custodyPill, { backgroundColor: custody.solid }]}>
            <Text style={styles.custodyPillEmoji}>{custody.emoji}</Text>
            <Text style={styles.custodyPillLabel}>{custody.label}</Text>
          </View>
        )}
      </View>

      <View style={styles.detailBody}>
        {/* Exchange banner */}
        {isExchange && (
          <View style={styles.exchangeBanner}>
            <View style={styles.exchangeBannerIcon}>
              <Icon icon={ArrowLeftRight} size="sm" color="#A07716" strokeWidth={2} />
            </View>
            <Text style={styles.exchangeBannerText}>
              Custody switches today
            </Text>
          </View>
        )}

        {/* Events */}
        {events.length > 0 ? (
          <>
            <Text style={styles.detailEventsLabel}>EVENTS</Text>
            {events.map((e, i) => {
              const catCfg = EVENT_CATEGORIES[e.category] ?? EVENT_CATEGORIES.Other;
              return (
                <View key={e.id}>
                  {i > 0 && <View style={styles.eventDivider} />}
                  <View style={styles.detailEventRow}>
                    <View style={[styles.detailEventIcon, { backgroundColor: catCfg.bg }]}>
                      <Icon icon={catCfg.icon} size="sm" color={catCfg.color} strokeWidth={1.75} />
                    </View>
                    <View style={styles.detailEventInfo}>
                      <Text style={styles.detailEventTitle}>{e.title}</Text>
                      <Text style={styles.detailEventTime}>{e.time}</Text>
                    </View>
                    <View style={[styles.detailEventDot, { backgroundColor: e.color }]} />
                  </View>
                </View>
              );
            })}
          </>
        ) : (
          <View style={styles.noEvents}>
            <Text style={styles.noEventsEmoji}>✦</Text>
            <Text style={styles.noEventsText}>Free day — nothing scheduled</Text>
          </View>
        )}

        {/* Add event inline link */}
        <TouchableOpacity style={styles.detailAddRow} onPress={onAddEvent} activeOpacity={0.7}>
          <Icon icon={Plus} size="xs" color={Colors.primary} strokeWidth={2.5} />
          <Text style={styles.detailAddText}>Add event to this day</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

// ─── Add Event Modal ──────────────────────────────────────────────────────────

type AddEventModalProps = {
  visible:    boolean;
  defaultDay: number;
  month:      number;
  year:       number;
  onClose:    () => void;
  onSave:     (e: Omit<CalEvent,'id'>) => void;
};

function AddEventModal({ visible, defaultDay, month, year, onClose, onSave }: AddEventModalProps) {
  const [title,    setTitle]    = useState('');
  const [time,     setTime]     = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [notes,    setNotes]    = useState('');

  const dateLabel = new Date(year, month, defaultDay)
    .toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const canSave = title.trim().length > 0 && !!category;

  function handleSave() {
    if (!canSave) return;
    const cat = EVENT_CATEGORIES[category!] ?? EVENT_CATEGORIES.Other;
    onSave({ day: defaultDay, title: title.trim(), time: time || '12:00 PM', emoji: '', color: cat.color, category: category! });
    setTitle(''); setTime(''); setCategory(null); setNotes('');
  }

  function handleClose() {
    setTitle(''); setTime(''); setCategory(null); setNotes('');
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.modalSheet} onPress={e => e.stopPropagation()}>
          <View style={styles.sheetHandle} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>New Event</Text>
              <Text style={styles.modalDateHint}>{dateLabel}</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.modalCloseBtn} activeOpacity={0.7}>
              <Icon icon={X} size="md" color={Colors.textSecondary} strokeWidth={1.75} />
            </TouchableOpacity>
          </View>

          {/* Category */}
          <Text style={styles.fieldLabel}>CATEGORY</Text>
          <View style={styles.catRow}>
            {Object.entries(EVENT_CATEGORIES).map(([key, cfg]) => {
              const active = category === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.catChip, active && { backgroundColor: cfg.bg, borderColor: cfg.color }]}
                  onPress={() => setCategory(key)}
                  activeOpacity={0.75}
                >
                  <Icon icon={cfg.icon} size="xs" color={active ? cfg.color : Colors.textSecondary} strokeWidth={2} />
                  <Text style={[styles.catChipLabel, active && { color: cfg.color }]}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Title */}
          <Text style={styles.fieldLabel}>TITLE</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Football Practice"
            placeholderTextColor={Colors.textDisabled}
            value={title}
            onChangeText={setTitle}
            autoFocus={false}
            maxLength={60}
          />

          {/* Time */}
          <Text style={styles.fieldLabel}>TIME</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.timeRow}
          >
            {TIME_OPTIONS.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.timeChip, time === t && styles.timeChipActive]}
                onPress={() => setTime(t)}
                activeOpacity={0.75}
              >
                <Text style={[styles.timeChipText, time === t && styles.timeChipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Notes */}
          <Text style={styles.fieldLabel}>NOTES</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Optional details…"
            placeholderTextColor={Colors.textDisabled}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
          />

          {/* Save */}
          <TouchableOpacity
            style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!canSave}
            activeOpacity={0.8}
          >
            <Icon icon={Plus} size="sm" color={Colors.textInverse} strokeWidth={2.5} />
            <Text style={styles.saveBtnText}>Save Event</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CalendarScreen() {
  const today = new Date();

  const [viewYear,  setViewYear]  = useState(MOCK_YEAR);
  const [viewMonth, setViewMonth] = useState(MOCK_MONTH);
  const [selectedDay, setSelectedDay] = useState<number>(
    today.getMonth() === MOCK_MONTH && today.getFullYear() === MOCK_YEAR
      ? today.getDate() : 1
  );
  const [events,   setEvents]   = useState<CalEvent[]>(INITIAL_EVENTS);
  const [addModal, setAddModal] = useState(false);

  // ── Today pulse animation ──────────────────────────────────────────────────
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.00, duration: 1100, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // ── Month swipe gesture ────────────────────────────────────────────────────
  const slideX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > Math.abs(gs.dy) && Math.abs(gs.dx) > 12,
      onPanResponderMove: (_, gs) => {
        slideX.setValue(gs.dx * 0.35); // soft follow
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx < -50) {
          // Swipe left → next month
          Animated.timing(slideX, { toValue: -SW * 0.3, duration: 180, useNativeDriver: true })
            .start(() => {
              setViewMonth(m => {
                if (m === 11) { setViewYear(y => y + 1); return 0; }
                return m + 1;
              });
              setSelectedDay(1);
              slideX.setValue(SW * 0.3);
              Animated.spring(slideX, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 0 }).start();
            });
        } else if (gs.dx > 50) {
          // Swipe right → prev month
          Animated.timing(slideX, { toValue: SW * 0.3, duration: 180, useNativeDriver: true })
            .start(() => {
              setViewMonth(m => {
                if (m === 0) { setViewYear(y => y - 1); return 11; }
                return m - 1;
              });
              setSelectedDay(1);
              slideX.setValue(-SW * 0.3);
              Animated.spring(slideX, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 0 }).start();
            });
        } else {
          Animated.spring(slideX, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 2 }).start();
        }
      },
    })
  ).current;

  // ── Data ──────────────────────────────────────────────────────────────────

  const eventsByDay = useMemo(() => {
    const map: Record<number, CalEvent[]> = {};
    events.forEach(e => {
      if (!map[e.day]) map[e.day] = [];
      map[e.day].push(e);
    });
    return map;
  }, [events]);

  const daysInMonth    = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = getFirstDayOfMonth(viewYear, viewMonth);
  const blanks = Array(firstDayOfWeek).fill(null);
  const days   = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Summary stats
  const dadDays  = days.filter(d => CUSTODY_SCHEDULE[d] === 'dad').length;
  const momDays  = days.filter(d => CUSTODY_SCHEDULE[d] === 'mom').length;
  const evtCount = events.length;

  function handleAddEvent(e: Omit<CalEvent,'id'>) {
    setEvents(prev => [...prev, { ...e, id: `e${Date.now()}` }]);
    setAddModal(false);
  }

  function handleLongPress(day: number) {
    setSelectedDay(day);
    setAddModal(true);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Screen header ── */}
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Calendar</Text>
          <Text style={styles.screenSub}>Noah's custody schedule</Text>
        </View>

        {/* ── Month navigator ── */}
        <View style={styles.monthNav}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => {
              if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1);
              setSelectedDay(1);
            }}
            hitSlop={{ top:12,bottom:12,left:12,right:12 }}
            activeOpacity={0.7}
          >
            <Icon icon={ChevronLeft} size="md" color={Colors.primary} strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} style={styles.monthCenter}>
            <Text style={styles.monthName}>Noah's {MONTHS[viewMonth]}</Text>
            <Text style={styles.monthYear}>{viewYear}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => {
              if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1);
              setSelectedDay(1);
            }}
            hitSlop={{ top:12,bottom:12,left:12,right:12 }}
            activeOpacity={0.7}
          >
            <Icon icon={ChevronRight} size="md" color={Colors.primary} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* ── Summary pills ── */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryPill, { backgroundColor: CUSTODY.dad.bg }]}>
            <Text style={[styles.summaryPillNum, { color: CUSTODY.dad.solid }]}>{dadDays}</Text>
            <Text style={[styles.summaryPillLabel, { color: CUSTODY.dad.text }]}>Your days</Text>
          </View>
          <View style={[styles.summaryPill, { backgroundColor: CUSTODY.mom.bg }]}>
            <Text style={[styles.summaryPillNum, { color: CUSTODY.mom.solid }]}>{momDays}</Text>
            <Text style={[styles.summaryPillLabel, { color: CUSTODY.mom.text }]}>Sarah's days</Text>
          </View>
          <View style={[styles.summaryPill, { backgroundColor: Colors.warningBg }]}>
            <Text style={[styles.summaryPillNum, { color: '#A07716' }]}>{EXCHANGE_DAYS.size}</Text>
            <Text style={[styles.summaryPillLabel, { color: '#A07716' }]}>Exchanges</Text>
          </View>
          <View style={[styles.summaryPill, { backgroundColor: Colors.neutralBg }]}>
            <Text style={[styles.summaryPillNum, { color: Colors.textSecondary }]}>{evtCount}</Text>
            <Text style={[styles.summaryPillLabel, { color: Colors.textSecondary }]}>Events</Text>
          </View>
        </View>

        {/* ── Legend ── */}
        <Legend />

        {/* ── Swipeable grid ── */}
        <Animated.View
          style={[styles.gridWrap, { transform: [{ translateX: slideX }] }]}
          {...panResponder.panHandlers}
        >
          {/* Day-of-week labels */}
          <View style={styles.dayLabelRow}>
            {DAY_LABELS.map((d, i) => (
              <Text
                key={i}
                style={[styles.dayLabel, i === 0 || i === 6 ? styles.dayLabelWeekend : null]}
              >
                {d}
              </Text>
            ))}
          </View>

          {/* Day cells */}
          <View style={styles.grid}>
            {blanks.map((_, i) => (
              <View key={`b${i}`} style={styles.cellOuter} />
            ))}
            {days.map(day => {
              const isToday    = isSameDay(new Date(viewYear, viewMonth, day), today);
              const isSelected = selectedDay === day;
              const isExchange = EXCHANGE_DAYS.has(day);
              return (
                <DayCell
                  key={day}
                  day={day}
                  parent={CUSTODY_SCHEDULE[day] ?? null}
                  isToday={isToday}
                  isSelected={isSelected}
                  isExchange={isExchange}
                  events={eventsByDay[day] ?? []}
                  pulseAnim={pulseAnim}
                  onPress={setSelectedDay}
                  onLongPress={handleLongPress}
                />
              );
            })}
          </View>
        </Animated.View>

        {/* ── Selected day detail card ── */}
        <DayDetail
          day={selectedDay}
          month={viewMonth}
          year={viewYear}
          parent={CUSTODY_SCHEDULE[selectedDay] ?? null}
          isExchange={EXCHANGE_DAYS.has(selectedDay)}
          events={eventsByDay[selectedDay] ?? []}
          onAddEvent={() => setAddModal(true)}
        />

        {/* Hint */}
        <Text style={styles.hint}>Long-press any date to add an event</Text>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── FAB ── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setAddModal(true)}
        activeOpacity={0.85}
      >
        <Icon icon={Plus} size="md" color={Colors.textInverse} strokeWidth={2.5} />
        <Text style={styles.fabLabel}>Add Event</Text>
      </TouchableOpacity>

      {/* ── Add event modal ── */}
      <AddEventModal
        visible={addModal}
        defaultDay={selectedDay}
        month={viewMonth}
        year={viewYear}
        onClose={() => setAddModal(false)}
        onSave={handleAddEvent}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Layout.screenPaddingH, paddingTop: Spacing.md },

  // Header
  screenHeader: { marginBottom: Spacing.lg },
  screenTitle:  { ...Typography.h1 },
  screenSub:    { ...Typography.small, marginTop: 3 },

  // Month navigator
  monthNav: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   Spacing.md,
  },
  navBtn: {
    width:          40,
    height:         40,
    borderRadius:   Radius.md,
    backgroundColor:Colors.card,
    alignItems:     'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  monthCenter: { alignItems: 'center' },
  monthName: {
    fontSize:      22,
    fontWeight:    '800',
    color:         Colors.textPrimary,
    letterSpacing: -0.4,
  },
  monthYear: { fontSize: 12, color: Colors.textSecondary, marginTop: 1, fontWeight: '500' },

  // Summary pills
  summaryRow: {
    flexDirection: 'row',
    gap:           Spacing.sm,
    marginBottom:  Spacing.md,
  },
  summaryPill: {
    flex:            1,
    alignItems:      'center',
    paddingVertical: 10,
    borderRadius:    Radius.md,
  },
  summaryPillNum:  { fontSize: 18, fontWeight: '800', lineHeight: 22 },
  summaryPillLabel:{ fontSize: 9,  fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 2 },

  // Legend
  legend: {
    flexDirection:    'row',
    justifyContent:   'center',
    alignItems:       'center',
    gap:              Spacing.lg,
    backgroundColor:  Colors.card,
    borderRadius:     Radius.md,
    paddingVertical:  10,
    marginBottom:     Spacing.md,
    ...Shadows.card,
  },
  legendItem:       { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendSwatch:     { width: 10, height: 10, borderRadius: 5 },
  legendExchangePip:{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#F59E0B', borderWidth: 1.5, borderColor: '#FFFBEB' },
  legendEventDot:   { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  legendText:       { fontSize: 11, fontWeight: '500', color: Colors.textSecondary },

  // Grid
  gridWrap:    { marginBottom: Spacing.md },
  dayLabelRow: { flexDirection: 'row', marginBottom: Spacing.xs },
  dayLabel: {
    width:      CELL_SIZE,
    textAlign:  'center',
    fontSize:   10,
    fontWeight: '700',
    color:      Colors.textSecondary,
    marginHorizontal: Spacing.xs / 2,
    textTransform:  'uppercase',
    letterSpacing:  0.5,
  },
  dayLabelWeekend: { color: Colors.textDisabled },

  grid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
  },

  // Cell
  cellOuter: {
    width:           CELL_SIZE,
    height:          CELL_H,
    marginHorizontal:Spacing.xs / 2,
    marginVertical:  Spacing.xs / 2,
    alignItems:      'center',
    justifyContent:  'center',
  },
  cell: {
    width:          CELL_SIZE,
    height:         CELL_H,
    borderRadius:   Radius.sm,
    alignItems:     'center',
    justifyContent: 'center',
    overflow:       'visible',
  },

  // Exchange pip — small amber dot at top-right
  exchangePip: {
    position:        'absolute',
    top:             3,
    right:           3,
    width:           7,
    height:          7,
    borderRadius:    4,
    borderWidth:     1.5,
    borderColor:     Colors.card,
  },

  dayNum: {
    fontSize:   13,
    fontWeight: '600',
    lineHeight: 17,
  },

  dotRow: {
    flexDirection: 'row',
    gap:           2.5,
    marginTop:     3,
  },
  dot: {
    width:        5,
    height:       5,
    borderRadius: 2.5,
  },

  // Detail card
  detailCard: {
    marginBottom: Spacing.md,
    overflow:     'hidden',
    ...Shadows.float,
  },
  detailHeader: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingHorizontal:Layout.cardPadding,
    paddingTop:     Spacing.md,
    paddingBottom:  Spacing.md,
  },
  detailWeekday: { ...Typography.label, marginBottom: 3 },
  detailDateStr: {
    fontSize:      22,
    fontWeight:    '700',
    color:         Colors.textPrimary,
    letterSpacing: -0.3,
  },
  custodyPill: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:              5,
    paddingVertical:  7,
    paddingHorizontal:12,
    borderRadius:     Radius.full,
  },
  custodyPillEmoji: { fontSize: 15 },
  custodyPillLabel: { fontSize: 13, fontWeight: '700', color: Colors.textInverse },

  detailBody: {
    paddingHorizontal:Layout.cardPadding,
    paddingBottom:   Layout.cardPadding,
    paddingTop:      Spacing.sm,
  },

  // Exchange banner
  exchangeBanner: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             Spacing.sm,
    backgroundColor: Colors.warningBg,
    borderRadius:    Radius.sm,
    padding:         Spacing.md,
    marginBottom:    Spacing.md,
  },
  exchangeBannerIcon: {
    width:          32,
    height:         32,
    borderRadius:   Radius.xs,
    backgroundColor:'#FEF3C7',
    alignItems:     'center',
    justifyContent: 'center',
  },
  exchangeBannerText: {
    fontSize:   13,
    fontWeight: '600',
    color:      '#A07716',
    flex:       1,
  },

  // Events in detail
  detailEventsLabel: { ...Typography.label, marginBottom: Spacing.sm },
  eventDivider:      { height: 1, backgroundColor: Colors.border, marginVertical: 8 },

  detailEventRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.md,
  },
  detailEventIcon: {
    width:          36,
    height:         36,
    borderRadius:   Radius.sm,
    alignItems:     'center',
    justifyContent: 'center',
  },
  detailEventInfo:  { flex: 1 },
  detailEventTitle: { ...Typography.bodyBold },
  detailEventTime:  { ...Typography.small, marginTop: 1 },
  detailEventDot: {
    width:        8,
    height:       8,
    borderRadius: 4,
  },

  // No events
  noEvents: {
    paddingVertical: Spacing.lg,
    alignItems:      'center',
    gap:             Spacing.xs,
  },
  noEventsEmoji: { fontSize: 20, color: Colors.textDisabled },
  noEventsText:  { ...Typography.small, textAlign: 'center' },

  // Add event inline
  detailAddRow: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            Spacing.xs,
    marginTop:      Spacing.md,
    paddingTop:     Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  detailAddText: { fontSize: 13, fontWeight: '600', color: Colors.primary },

  // Hint
  hint: {
    textAlign:    'center',
    fontSize:     11,
    fontWeight:   '500',
    color:        Colors.textDisabled,
    marginBottom: Spacing.md,
  },

  // FAB
  fab: {
    position:         'absolute',
    bottom:           24,
    right:            Layout.screenPaddingH,
    flexDirection:    'row',
    alignItems:       'center',
    gap:              Spacing.sm,
    backgroundColor:  Colors.primary,
    borderRadius:     Radius.full,
    paddingVertical:  14,
    paddingHorizontal:22,
    ...Shadows.modal,
  },
  fabLabel: { fontSize: 15, fontWeight: '700', color: Colors.textInverse },

  // Modal
  overlay:     { flex: 1, backgroundColor: 'rgba(15,10,40,0.45)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor:     Colors.card,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius:Radius.xl,
    padding:             Layout.screenPaddingH,
    paddingBottom:       Spacing.xxl,
    ...Shadows.modal,
  },
  sheetHandle: {
    width:          40,
    height:         4,
    borderRadius:   2,
    backgroundColor:Colors.border,
    alignSelf:      'center',
    marginBottom:   Spacing.lg,
  },
  modalHeader: {
    flexDirection:  'row',
    alignItems:     'flex-start',
    justifyContent: 'space-between',
    marginBottom:   Spacing.lg,
  },
  modalTitle:    { ...Typography.h2 },
  modalDateHint: { ...Typography.small, marginTop: 3 },
  modalCloseBtn: {
    width:          36,
    height:         36,
    borderRadius:   Radius.sm,
    backgroundColor:Colors.neutralBg,
    alignItems:     'center',
    justifyContent: 'center',
  },

  fieldLabel: { ...Typography.label, marginBottom: Spacing.sm, marginTop: Spacing.md },

  catRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           Spacing.sm,
  },
  catChip: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:              5,
    paddingVertical:  8,
    paddingHorizontal:12,
    borderRadius:     Radius.sm,
    backgroundColor:  Colors.neutralBg,
    borderWidth:      1.5,
    borderColor:      Colors.border,
  },
  catChipLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },

  textInput: {
    height:           Layout.inputHeight,
    borderRadius:     Radius.md,
    borderWidth:      1.5,
    borderColor:      Colors.border,
    paddingHorizontal:Spacing.md,
    fontSize:         15,
    color:            Colors.textPrimary,
    backgroundColor:  Colors.card,
  },
  textArea: { height: 68, paddingTop: Spacing.sm, textAlignVertical: 'top' },

  timeRow:          { gap: Spacing.sm, paddingRight: Spacing.md },
  timeChip:         { paddingVertical: 8, paddingHorizontal: 12, borderRadius: Radius.full, backgroundColor: Colors.neutralBg, borderWidth: 1.5, borderColor: Colors.border },
  timeChipActive:   { backgroundColor: '#ECEAFF', borderColor: Colors.primary },
  timeChipText:     { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  timeChipTextActive:{ color: Colors.primary },

  saveBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             Spacing.sm,
    height:          Layout.buttonHeight,
    borderRadius:    Radius.md,
    backgroundColor: Colors.primary,
    marginTop:       Spacing.lg,
  },
  saveBtnDisabled:{ opacity: 0.40 },
  saveBtnText:    { fontSize: 15, fontWeight: '700', color: Colors.textInverse },
});
