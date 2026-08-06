'use client';

import { useEffect, useState, useCallback } from 'react';
import { ServiceType } from './Step1Services';

interface Props {
  services: ServiceType[];
  date: string;
  slots: number[];
  onDateChange: (date: string) => void;
  onSlotsChange: (slots: number[]) => void;
  error?: string;
}

const SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
];

type SlotStatus = 'available' | 'booked' | 'unavailable';

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}
function todayString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function Step2DateSlots({ services, date, slots, onDateChange, onSlotsChange, error }: Props) {
  const today = todayString();
  const todayDate = new Date();

  const [calYear, setCalYear] = useState(() => todayDate.getFullYear());
  const [calMonth, setCalMonth] = useState(() => todayDate.getMonth());
  const [availability, setAvailability] = useState<SlotStatus[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Mock API call to get availability
  const fetchAvailability = useCallback(async (d: string) => {
    if (!d || services.length === 0) return;
    setLoadingSlots(true);
    // Simulate network delay
    setTimeout(() => {
      // Mock random availability based on date hash
      const isWeekend = new Date(d).getDay() === 0 || new Date(d).getDay() === 6;
      const mockSlots = SLOTS.map((_, i): SlotStatus => {
        if (isWeekend && (i === 4 || i === 5)) return 'booked';
        if (i % 7 === 0) return 'unavailable';
        return 'available';
      });
      setAvailability(mockSlots);
      setLoadingSlots(false);
    }, 400);
  }, [services]);

  useEffect(() => {
    if (date) fetchAvailability(date);
  }, [date, fetchAvailability]);

  // Calendar helpers
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfWeek(calYear, calMonth);

  function buildDateStr(day: number) {
    return `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function selectDate(day: number) {
    const d = buildDateStr(day);
    if (d < today) return;
    onDateChange(d);
    onSlotsChange([]);
  }

  function prevMonth() {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  }

  function toggleSlot(idx: number) {
    if (!availability) return;
    const status = availability[idx];
    if (status !== 'available') return;
    if (slots.includes(idx)) {
      onSlotsChange(slots.filter(s => s !== idx));
    } else {
      onSlotsChange([...slots, idx]);
    }
  }

  const advance = slots.length > 0 ? slots.length * 200 : null;
  const monthName = new Date(calYear, calMonth).toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div>
      <h2 className="text-[1.05rem] font-bold mb-1">Pick a Date & Slots</h2>
      <p className="text-mu text-sm mb-5">
        Select a date then choose your time slots. Multiple slots allowed.
      </p>

      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {/* Calendar */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <button className="btn btn-out btn-sm" onClick={prevMonth} aria-label="Previous month">‹</button>
            <span className="text-sm font-semibold">{monthName}</span>
            <button className="btn btn-out btn-sm" onClick={nextMonth} aria-label="Next month">›</button>
          </div>
          <div className="cal-grid">
            {WEEKDAYS.map(d => <div key={d} className="cal-day-header">{d}</div>)}
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`e-${i}`} className="cal-day empty" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const ds = buildDateStr(day);
              const isPast = ds < today;
              const isToday = ds === today;
              const isSelected = ds === date;
              let cls = 'cal-day';
              if (isPast) cls += ' disabled';
              else if (isSelected) cls += ' selected';
              else if (isToday) cls += ' today';

              return (
                <div
                  key={day}
                  id={`cal-day-${ds}`}
                  className={cls}
                  onClick={() => !isPast && selectDate(day)}
                  aria-label={ds}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        {/* Slots */}
        <div>
          {!date ? (
            <div className="text-mu text-sm py-6 text-center border border-dashed border-c3 rounded-xl">
              ← Select a date first
            </div>
          ) : loadingSlots ? (
            <div className="animate-pulse">
              <div className="text-[.72rem] text-mu uppercase tracking-wider mb-2">
                Available slots for {date}
              </div>
              <div className="slot-grid">
                {SLOTS.map((_, idx) => (
                  <div key={idx} className="slot-btn" style={{ background: 'var(--c2)', borderColor: 'transparent', color: 'transparent' }}>
                    00:00 AM
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="text-[.72rem] text-mu uppercase tracking-wider mb-2">
                Available slots for {date}
              </div>
              <div className="slot-grid">
                {SLOTS.map((label, idx) => {
                  const status = availability?.[idx] ?? 'available';
                  let cls = 'slot-btn';
                  if (slots.includes(idx)) cls += ' selected';
                  else if (status === 'booked') cls += ' booked';
                  else if (status === 'unavailable') cls += ' unavailable';
                  return (
                    <button
                      key={idx}
                      id={`slot-${idx}`}
                      className={cls}
                      onClick={() => toggleSlot(idx)}
                      aria-label={`${label} ${status}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {advance !== null && (
                <div className="mt-4 text-[.84rem] text-mu">
                  Estimated 50% advance:{' '}
                  <span className="text-gold font-bold">₹{advance.toLocaleString('en-IN')}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error mt-4">⚠ {error}</div>}
    </div>
  );
}
