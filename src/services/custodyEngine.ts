export type CustodyOwner = 'you' | 'other';

export type CustodyPattern =
  | 'two_two_three'
  | 'week_on_week_off'
  | 'alternating_days'
  | 'manual_fallback';

export type CustodyRule = {
  pattern: CustodyPattern;
  startDate: string;
  startsWith: CustodyOwner;
};

export const DEFAULT_CUSTODY_RULE: CustodyRule = {
  pattern: 'two_two_three',
  startDate: '2026-06-01',
  startsWith: 'you',
};

const PATTERN_BLOCKS: Record<CustodyPattern, number[]> = {
  two_two_three: [2, 2, 3, 2, 2, 3],
  week_on_week_off: [7, 7],
  alternating_days: [1, 1],
  manual_fallback: [7, 7],
};

function parseLocalDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function daysBetween(startDate: string, targetDate: string) {
  const start = parseLocalDate(startDate);
  const target = parseLocalDate(targetDate);
  const ms = target.getTime() - start.getTime();
  return Math.floor(ms / 86400000);
}

function flip(owner: CustodyOwner): CustodyOwner {
  return owner === 'you' ? 'other' : 'you';
}

export function ownerForDate(date: string, rule: CustodyRule = DEFAULT_CUSTODY_RULE): CustodyOwner {
  const blocks = PATTERN_BLOCKS[rule.pattern] || PATTERN_BLOCKS.two_two_three;
  const cycleLength = blocks.reduce((sum, n) => sum + n, 0);
  const offset = daysBetween(rule.startDate, date);
  const normalized = ((offset % cycleLength) + cycleLength) % cycleLength;

  let cursor = 0;
  let owner = rule.startsWith;

  for (const blockLength of blocks) {
    if (normalized < cursor + blockLength) return owner;
    cursor += blockLength;
    owner = flip(owner);
  }

  return rule.startsWith;
}

export function isHandoffDate(date: string, rule: CustodyRule = DEFAULT_CUSTODY_RULE): boolean {
  const target = parseLocalDate(date);
  const prev = new Date(target);
  prev.setDate(target.getDate() - 1);
  const prevIso = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}-${String(prev.getDate()).padStart(2, '0')}`;
  return ownerForDate(prevIso, rule) !== ownerForDate(date, rule);
}

export function getMonthCustodySummary(year: number, month: number, rule: CustodyRule = DEFAULT_CUSTODY_RULE) {
  const totalDays = new Date(year, month + 1, 0).getDate();
  let yourDays = 0;
  let coParentDays = 0;
  let handoffs = 0;

  for (let day = 1; day <= totalDays; day++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const owner = ownerForDate(date, rule);
    if (owner === 'you') yourDays++;
    else coParentDays++;
    if (isHandoffDate(date, rule)) handoffs++;
  }

  return { yourDays, coParentDays, handoffs };
}
