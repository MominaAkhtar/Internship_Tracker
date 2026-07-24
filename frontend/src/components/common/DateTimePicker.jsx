import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Clock, Sun, Moon } from 'lucide-react';

/* ── Teal colour scheme — light & dark variants ── */
const LIGHT_COLORS = {
  accent: '#4FB3BF',
  accentDark: '#3FA3AF',
  accentSoft: '#EAF6F7',
  textDark: '#4A5568',
  textMuted: '#A0AEC0',
  textInactive: '#CBD5E0',
  border: '#E2E8F0',
  hover: '#F7FAFC',
  surface: '#FFFFFF',
  danger: '#E53E3E',
  popoverShadow: '0 16px 40px -8px rgba(15,23,42,0.16)',
  selectedShadow: '0 4px 10px -2px rgba(63,163,175,0.6)',
  chipShadow: '0 6px 14px -4px rgba(63,163,175,0.5)',
};

const DARK_COLORS = {
  accent: '#5FC7D2',
  accentDark: '#7BD3DC',
  accentSoft: '#1B3A3E',
  textDark: '#E2E8F0',
  textMuted: '#8DA0B3',
  textInactive: '#4E5F72',
  border: '#324254',
  hover: '#25313F',
  surface: '#1B2530',
  danger: '#FC8181',
  popoverShadow: '0 20px 45px -8px rgba(0,0,0,0.55)',
  selectedShadow: '0 4px 12px -2px rgba(95,199,210,0.45)',
  chipShadow: '0 6px 16px -4px rgba(95,199,210,0.4)',
};

const POPOVER_Z_INDEX = 99999;
const VIEWPORT_PADDING = 12;
const GAP = 8;
const START_YEAR = 2020;
const END_YEAR = 2035;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const DateTimePicker = ({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
  darkMode, // optional controlled override: true/false. Omit to auto-detect.
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // ── Dark mode detection ──
  // If `darkMode` prop is supplied, it wins. Otherwise auto-detect from a
  // `dark` class on <html> (common Tailwind convention) or the OS preference,
  // and stay in sync if either changes.
  const getAutoDark = () => {
    if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) return true;
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  };

  const [autoDark, setAutoDark] = useState(getAutoDark);

  useEffect(() => {
    if (darkMode !== undefined) return undefined;
    if (typeof window === 'undefined') return undefined;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => setAutoDark(getAutoDark());

    mq.addEventListener('change', sync);
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      mq.removeEventListener('change', sync);
      observer.disconnect();
    };
  }, [darkMode]);

  const isDark = darkMode !== undefined ? darkMode : autoDark;
  const COLORS = isDark ? DARK_COLORS : LIGHT_COLORS;

  useEffect(() => {
    if (disabled) {
      setIsOpen(false);
    }
  }, [disabled]);
  const [isPositioned, setIsPositioned] = useState(false);
  const [view, setView] = useState('days'); // 'days' | 'months' | 'years'
  const [yearPageStart, setYearPageStart] = useState(START_YEAR);
  const [slideDirection, setSlideDirection] = useState(0);

  const containerRef = useRef(null);
  const popoverRef = useRef(null);
  const triggerRef = useRef(null);

  const getParsedDate = (val) => {
    if (!val) return new Date();
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const initialDate = getParsedDate(value);
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(value ? getParsedDate(value) : null);

  const [hour, setHour] = useState(initialDate.getHours() % 12 || 12);
  const [minute, setMinute] = useState(Math.round(initialDate.getMinutes() / 5) * 5 % 60);
  const [period, setPeriod] = useState(initialDate.getHours() >= 12 ? 'PM' : 'AM');

  const [coords, setCoords] = useState({ top: 0, left: 0, openUpward: false });

  useEffect(() => {
    if (value) {
      const d = getParsedDate(value);
      setSelectedDate(d);
      setCurrentDate(d);
      setHour(d.getHours() % 12 || 12);
      setMinute(d.getMinutes());
      setPeriod(d.getHours() >= 12 ? 'PM' : 'AM');
      setYearPageStart(Math.floor(d.getFullYear() / 12) * 12);
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  useEffect(() => {
    if (!isOpen) setView('days');
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const inTrigger = containerRef.current?.contains(event.target);
      const inPopover = popoverRef.current?.contains(event.target);
      if (!inTrigger && !inPopover) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const updateCoords = useCallback(() => {
    const trigger = triggerRef.current;
    const popover = popoverRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const popoverHeight = popover?.offsetHeight || 500;
    const popoverWidth = popover?.offsetWidth || 340;

    const spaceBelow = viewportHeight - rect.bottom - VIEWPORT_PADDING;
    const spaceAbove = rect.top - VIEWPORT_PADDING;
    const openUpward = spaceBelow < popoverHeight + GAP && spaceAbove > spaceBelow;

    let top = openUpward ? rect.top - popoverHeight - GAP : rect.bottom + GAP;
    top = Math.max(VIEWPORT_PADDING, Math.min(top, viewportHeight - popoverHeight - VIEWPORT_PADDING));

    let left = rect.left;
    if (left + popoverWidth > viewportWidth - VIEWPORT_PADDING) {
      left = viewportWidth - popoverWidth - VIEWPORT_PADDING;
    }
    left = Math.max(VIEWPORT_PADDING, left);

    setCoords({ top, left, openUpward });
    setIsPositioned(true);
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) {
      setIsPositioned(false);
      return;
    }

    updateCoords();
    const frame1 = requestAnimationFrame(() => {
      updateCoords();
      requestAnimationFrame(updateCoords);
    });

    let resizeObserver;
    if (popoverRef.current) {
      resizeObserver = new ResizeObserver(updateCoords);
      resizeObserver.observe(popoverRef.current);
    }

    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords, true);

    return () => {
      cancelAnimationFrame(frame1);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
    };
  }, [isOpen, currentDate, view, updateCoords]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const buildDateTime = (baseDate, h, m, p) => {
    const result = new Date(baseDate);
    const h24 = p === 'PM' ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h);
    result.setHours(h24, m, 0, 0);
    return result;
  };

  const commitDate = (nextDate) => {
    setSelectedDate(nextDate);
    onChange(nextDate.toISOString());
  };

  const handlePrevMonth = () => {
    setSlideDirection(-1);
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setSlideDirection(1);
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (gridDay) => {
    const selected = new Date(gridDay.year, gridDay.month, gridDay.day);
    commitDate(buildDateTime(selected, hour, minute, period));
  };

  const handleSelectMonth = (monthIndex) => {
    setCurrentDate(new Date(year, monthIndex, 1));
    setView('days');
  };

  const handleSelectYear = (selectedYear) => {
    setCurrentDate(new Date(selectedYear, month, 1));
    setView('months');
  };

  const handleTimeChange = (newHour, newMinute, newPeriod) => {
    setHour(newHour);
    setMinute(newMinute);
    setPeriod(newPeriod);
    const base = selectedDate ? new Date(selectedDate) : new Date();
    commitDate(buildDateTime(base, newHour, newMinute, newPeriod));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setHour(now.getHours() % 12 || 12);
    setMinute(Math.round(now.getMinutes() / 5) * 5 % 60);
    setPeriod(now.getHours() >= 12 ? 'PM' : 'AM');
    commitDate(now);
    setView('days');
  };

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const prevMonthDays = getDaysInMonth(year, month - 1);
  const gridDays = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    gridDays.push({
      day: prevMonthDays - i,
      month: month === 0 ? 11 : month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false,
    });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    gridDays.push({ day: i, month, year, isCurrentMonth: true });
  }
  const remainingSlots = 42 - gridDays.length;
  for (let i = 1; i <= remainingSlots; i++) {
    gridDays.push({
      day: i,
      month: month === 11 ? 0 : month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false,
    });
  }

  const formatDateInput = (d) => {
    if (!d) return 'Select date';
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  const formatTimeInput = () => {
    const hr = String(hour).padStart(2, '0');
    const min = String(minute).padStart(2, '0');
    return `${hr}:${min} ${period}`;
  };

  const formatDisplayString = () => {
    if (!selectedDate) return 'Select date and time';
    return `${formatDateInput(selectedDate)} · ${formatTimeInput()}`;
  };

  const isToday = (gridDay) => {
    const today = new Date();
    return (
      today.getDate() === gridDay.day &&
      today.getMonth() === gridDay.month &&
      today.getFullYear() === gridDay.year
    );
  };

  const isSelected = (gridDay) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === gridDay.day &&
      selectedDate.getMonth() === gridDay.month &&
      selectedDate.getFullYear() === gridDay.year
    );
  };

  const yearOptions = Array.from({ length: 12 }, (_, i) => yearPageStart + i).filter(
    (y) => y >= START_YEAR && y <= END_YEAR
  );

  const popoverContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={popoverRef}
          role="dialog"
          aria-modal="true"
          aria-label="Date and time picker"
          initial={{ opacity: 0, y: coords.openUpward ? 8 : -8 }}
          animate={{ opacity: isPositioned ? 1 : 0, y: isPositioned ? 0 : coords.openUpward ? 8 : -8 }}
          exit={{ opacity: 0, y: coords.openUpward ? 8 : -8 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-[340px] rounded-2xl select-none text-left max-h-[calc(100vh-24px)] overflow-y-auto"
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            zIndex: POPOVER_Z_INDEX,
            backgroundColor: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            boxShadow: COLORS.popoverShadow,
          }}
        >
          <div className="p-5">
            {/* Preview row */}
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-2.5" style={{ color: COLORS.textMuted }}>
              Interview date &amp; time
            </p>
            <div className="flex gap-2.5 mb-5">
              <div
                className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px]"
                style={{ color: COLORS.accentDark, backgroundColor: COLORS.accentSoft }}
              >
                <Calendar className="w-4 h-4 shrink-0" strokeWidth={1.75} style={{ color: COLORS.accent }} />
                <span className="font-medium">{formatDateInput(selectedDate)}</span>
              </div>
              <div
                className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px]"
                style={{ color: COLORS.textDark, backgroundColor: COLORS.hover }}
              >
                <Clock className="w-4 h-4 shrink-0" strokeWidth={1.75} style={{ color: COLORS.textMuted }} />
                <span className="font-medium">{formatTimeInput()}</span>
              </div>
            </div>

            {/* ── DAYS VIEW ── */}
            {view === 'days' && (
              <>
                <div className="flex items-center justify-between mb-4 px-0.5">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    aria-label="Previous month"
                    className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer"
                    style={{ color: COLORS.textMuted }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.hover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setView('months')}
                      className="px-2 py-1 rounded-md text-[14.5px] font-semibold transition-colors cursor-pointer"
                      style={{ color: COLORS.textDark }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.hover; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      {MONTHS[month]}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setYearPageStart(Math.floor(year / 12) * 12);
                        setView('years');
                      }}
                      className="px-2 py-1 rounded-md text-[14.5px] font-semibold transition-colors cursor-pointer"
                      style={{ color: COLORS.textMuted }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.hover; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      {year}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextMonth}
                    aria-label="Next month"
                    className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer"
                    style={{ color: COLORS.textMuted }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.hover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <ChevronRight className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>

                <div className="grid grid-cols-7 mb-1.5">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <span
                      key={`${day}-${i}`}
                      className="text-[10.5px] font-semibold uppercase tracking-wide text-center py-1"
                      style={{ color: COLORS.textInactive }}
                    >
                      {day}
                    </span>
                  ))}
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`${year}-${month}`}
                    initial={{ opacity: 0, x: slideDirection * 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: slideDirection * -10 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="grid grid-cols-7 gap-y-1 mb-5"
                  >
                    {gridDays.map((gridDay, idx) => {
                      const active = isSelected(gridDay);
                      const today = isToday(gridDay);
                      const currentMonth = gridDay.isCurrentMonth;

                      return (
                        <div key={`${gridDay.year}-${gridDay.month}-${gridDay.day}-${idx}`} className="flex justify-center items-center h-9">
                          <motion.button
                            type="button"
                            onClick={() => handleSelectDay(gridDay)}
                            whileTap={{ scale: 0.92 }}
                            className="w-8 h-8 text-[13px] rounded-[10px] cursor-pointer flex flex-col items-center justify-center gap-0.5"
                            style={{
                              backgroundColor: active ? COLORS.accent : 'transparent',
                              color: active ? COLORS.surface : currentMonth ? COLORS.textDark : COLORS.textInactive,
                              fontWeight: active || today ? 600 : 400,
                              boxShadow: active ? COLORS.selectedShadow : 'none',
                              transition: 'background-color 150ms ease, box-shadow 150ms ease',
                            }}
                            onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = COLORS.hover; }}
                            onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
                          >
                            <span>{gridDay.day}</span>
                            <span
                              className="w-[3px] h-[3px] rounded-full"
                              style={{ backgroundColor: today && !active ? COLORS.accent : 'transparent' }}
                            />
                          </motion.button>
                        </div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </>
            )}

            {/* ── MONTHS VIEW ── */}
            {view === 'months' && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => setView('days')}
                    className="text-[13px] font-medium cursor-pointer hover:opacity-70"
                    style={{ color: COLORS.textMuted }}
                  >
                    ← Back
                  </button>
                  <span className="text-[14.5px] font-semibold" style={{ color: COLORS.textDark }}>
                    Select month
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setYearPageStart(Math.floor(year / 12) * 12);
                      setView('years');
                    }}
                    className="text-[13px] font-semibold cursor-pointer hover:opacity-70"
                    style={{ color: COLORS.accent }}
                  >
                    {year}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {MONTHS_SHORT.map((m, idx) => {
                    const isActive = idx === month;
                    const isCurrent = idx === new Date().getMonth() && year === new Date().getFullYear();
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleSelectMonth(idx)}
                        className="py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 cursor-pointer"
                        style={{
                          backgroundColor: isActive ? COLORS.accent : isCurrent ? COLORS.accentSoft : 'transparent',
                          color: isActive ? COLORS.surface : isCurrent ? COLORS.accentDark : COLORS.textDark,
                          boxShadow: isActive ? COLORS.chipShadow : 'none',
                        }}
                        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = COLORS.hover; }}
                        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = isCurrent ? COLORS.accentSoft : 'transparent'; }}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── YEARS VIEW ── */}
            {view === 'years' && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => setView('months')}
                    className="text-[13px] font-medium cursor-pointer hover:opacity-70"
                    style={{ color: COLORS.textMuted }}
                  >
                    ← Back
                  </button>
                  <span className="text-[14.5px] font-semibold" style={{ color: COLORS.textDark }}>
                    Select year
                  </span>
                  <div className="w-10" />
                </div>

                <div className="flex items-center justify-between mb-3">
                  <button
                    type="button"
                    disabled={yearPageStart <= START_YEAR}
                    onClick={() => setYearPageStart((p) => Math.max(START_YEAR, p - 12))}
                    className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer disabled:opacity-30"
                    style={{ color: COLORS.textMuted }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.hover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[12.5px] font-medium" style={{ color: COLORS.textMuted }}>
                    {yearPageStart} – {Math.min(yearPageStart + 11, END_YEAR)}
                  </span>
                  <button
                    type="button"
                    disabled={yearPageStart + 12 > END_YEAR}
                    onClick={() => setYearPageStart((p) => Math.min(END_YEAR - 11, p + 12))}
                    className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer disabled:opacity-30"
                    style={{ color: COLORS.textMuted }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.hover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {yearOptions.map((y) => {
                    const isActive = y === year;
                    const isCurrent = y === new Date().getFullYear();
                    return (
                      <button
                        key={y}
                        type="button"
                        onClick={() => handleSelectYear(y)}
                        className="py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 cursor-pointer"
                        style={{
                          backgroundColor: isActive ? COLORS.accent : isCurrent ? COLORS.accentSoft : 'transparent',
                          color: isActive ? COLORS.surface : isCurrent ? COLORS.accentDark : COLORS.textDark,
                          boxShadow: isActive ? COLORS.chipShadow : 'none',
                        }}
                        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = COLORS.hover; }}
                        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = isCurrent ? COLORS.accentSoft : 'transparent'; }}
                      >
                        {y}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Time picker — always visible */}
            <div
              className="pt-4 mb-1 border-t"
              style={{ borderColor: COLORS.border }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: COLORS.textMuted }}>Time</p>
              <div className="flex items-center justify-center gap-2">
                <select
                  value={hour}
                  onChange={(e) => handleTimeChange(parseInt(e.target.value, 10), minute, period)}
                  aria-label="Hour"
                  className="px-3 py-2 rounded-lg border text-[13px] font-medium cursor-pointer focus:outline-none"
                  style={{ borderColor: COLORS.border, color: COLORS.textDark, backgroundColor: COLORS.surface }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = COLORS.accent; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = COLORS.border; }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                    <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
                  ))}
                </select>
                <span className="font-semibold" style={{ color: COLORS.textInactive }}>:</span>
                <select
                  value={minute}
                  onChange={(e) => handleTimeChange(hour, parseInt(e.target.value, 10), period)}
                  aria-label="Minute"
                  className="px-3 py-2 rounded-lg border text-[13px] font-medium cursor-pointer focus:outline-none"
                  style={{ borderColor: COLORS.border, color: COLORS.textDark, backgroundColor: COLORS.surface }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = COLORS.accent; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = COLORS.border; }}
                >
                  {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
                    <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                  ))}
                </select>
                <div className="flex rounded-lg overflow-hidden" style={{ backgroundColor: COLORS.hover }}>
                  {['AM', 'PM'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleTimeChange(hour, minute, p)}
                      className="px-3 py-2 text-[12px] font-semibold cursor-pointer transition-colors"
                      style={{
                        backgroundColor: period === p ? COLORS.accent : 'transparent',
                        color: period === p ? COLORS.surface : COLORS.textMuted,
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={handleToday}
                className="text-[13px] font-semibold transition-colors cursor-pointer hover:opacity-80"
                style={{ color: COLORS.textMuted }}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer hover:opacity-90"
                style={{ color: COLORS.surface, backgroundColor: COLORS.accent }}
              >
                Select
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={`flex flex-col gap-1.5 w-full text-left relative ${className}`} ref={containerRef}>
      {label && (
        <label htmlFor={name} className="text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.textMuted }}>
          {label} {required && <span style={{ color: COLORS.danger }}>*</span>}
        </label>
      )}

      <button
        ref={triggerRef}
        id={name}
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) setIsOpen((prev) => !prev); }}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all duration-150 focus:outline-none flex items-center justify-between text-left select-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        style={{
          borderColor: error ? COLORS.danger : isOpen ? COLORS.accent : COLORS.border,
          backgroundColor: COLORS.surface,
        }}
      >
        <span style={{ color: selectedDate ? COLORS.textDark : COLORS.textMuted }}>
          {formatDisplayString()}
        </span>
        <Calendar className="w-4 h-4" strokeWidth={1.5} style={{ color: isOpen ? COLORS.accent : COLORS.textMuted }} />
      </button>

      {error && (
        <span className="text-xs font-semibold" style={{ color: COLORS.danger }} role="alert">
          {error.message || error}
        </span>
      )}

      {createPortal(popoverContent, document.body)}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Demo wrapper — shown only in this preview so you can see both
   modes side by side. Import { DateTimePicker } from this file
   in your own app; you don't need this Demo component.
   ───────────────────────────────────────────────────────────── */
function Demo() {
  const [dark, setDark] = useState(false);
  const [value, setValue] = useState(null);

  return (
    <div
      style={{
        minHeight: '520px',
        padding: '48px 24px',
        backgroundColor: dark ? '#0F1720' : '#F8FAFC',
        transition: 'background-color 200ms ease',
      }}
    >
      <div style={{ maxWidth: 360, margin: '0 auto' }}>
        <button
          type="button"
          onClick={() => setDark((d) => !d)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-semibold mb-6 cursor-pointer transition-colors"
          style={{
            color: dark ? '#E2E8F0' : '#4A5568',
            backgroundColor: dark ? '#1B2530' : '#FFFFFF',
            border: `1px solid ${dark ? '#324254' : '#E2E8F0'}`,
          }}
        >
          {dark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          {dark ? 'Dark mode' : 'Light mode'} — click to toggle
        </button>

        <DateTimePicker
          label="Interview date & time"
          name="interview"
          value={value}
          onChange={setValue}
          darkMode={dark}
          required
        />
      </div>
    </div>
  );
}

export default Demo;
