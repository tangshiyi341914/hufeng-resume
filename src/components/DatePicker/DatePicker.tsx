import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

export default function DatePicker({ value, onChange, placeholder = '选择日期' }: Props) {
  const [open, setOpen] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [viewYear, setViewYear] = useState(() => {
    if (value) return parseInt(value.split('-')[0]);
    return new Date().getFullYear();
  });
  const [dropUp, setDropUp] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // 检查弹出方向
  const checkPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setDropUp(spaceBelow < 320);
  }, []);

  useEffect(() => {
    if (open) checkPosition();
  }, [open, checkPosition]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowYearPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const displayText = value ? `${value.split('-')[0]}年${parseInt(value.split('-')[1])}月` : '';

  const selectMonth = (month: number) => {
    onChange(`${viewYear}-${String(month).padStart(2, '0')}`);
    setOpen(false);
    setShowYearPicker(false);
  };

  const selectYear = (year: number) => {
    setViewYear(year);
    setShowYearPicker(false);
  };

  const prevYear = () => setViewYear((y) => y - 1);
  const nextYear = () => setViewYear((y) => y + 1);

  const selectedYear = value ? parseInt(value.split('-')[0]) : null;
  const selectedMonth = value ? parseInt(value.split('-')[1]) : null;

  // 生成年份列表（前后 50 年）
  const currentYear = new Date().getFullYear();
  const yearRange = Array.from({ length: 101 }, (_, i) => currentYear - 70 + i);

  const popupClass = `absolute left-0 z-50 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-3 ${
    dropUp ? 'bottom-full mb-1' : 'top-full mt-1'
  }`;

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (!open) {
            if (value) setViewYear(parseInt(value.split('-')[0]));
            checkPosition();
          }
          setOpen(!open);
          setShowYearPicker(false);
        }}
        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-left flex items-center gap-2 hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/50 transition-all bg-white"
      >
        <Calendar size={14} className="text-gray-400 flex-shrink-0" />
        <span className={displayText ? 'text-gray-700' : 'text-gray-300'}>{displayText || placeholder}</span>
      </button>

      {open && (
        <div className={popupClass}>
          {showYearPicker ? (
            /* 年份选择面板 */
            <div>
              <div className="flex items-center justify-between mb-2">
                <button onClick={() => setShowYearPicker(false)} className="p-1 hover:bg-gray-100 rounded text-gray-500">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-semibold text-gray-700">选择年份</span>
                <div className="w-6" />
              </div>
              <div className="max-h-48 overflow-y-auto grid grid-cols-4 gap-1">
                {yearRange.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => selectYear(y)}
                    className={`py-1.5 text-xs rounded-md transition-all ${
                      y === viewYear
                        ? 'bg-primary text-white font-semibold'
                        : y === currentYear
                        ? 'text-primary font-medium hover:bg-primary-pale'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* 月份选择面板 */
            <div>
              <div className="flex items-center justify-between mb-3">
                <button onClick={prevYear} className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700 transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setShowYearPicker(true)}
                  className="text-sm font-semibold text-gray-700 hover:text-primary hover:bg-primary-pale px-2 py-0.5 rounded transition-colors cursor-pointer"
                >
                  {viewYear}年
                </button>
                <button onClick={nextYear} className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700 transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {MONTHS.map((name, i) => {
                  const month = i + 1;
                  const isActive = selectedYear === viewYear && selectedMonth === month;
                  return (
                    <button
                      key={month}
                      type="button"
                      onClick={() => selectMonth(month)}
                      className={`py-2 text-xs font-medium rounded-md transition-all ${
                        isActive
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-gray-600 hover:bg-primary-pale hover:text-primary'
                      }`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>

              {value && (
                <button
                  type="button"
                  onClick={() => { onChange(''); setOpen(false); }}
                  className="mt-2 w-full text-xs text-gray-400 hover:text-red-500 py-1.5 transition-colors"
                >
                  清除日期
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
