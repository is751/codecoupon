import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { parseLocalDate } from '../utils/expiry';

interface CountdownTimerProps {
  expiryDateStr?: string; // e.g. '2026-11-30'
  hoursLeftFallback?: number;
  compact?: boolean;
}

function calculateTimeLeft(dateStr?: string, fallbackHours: number = 24) {
  let target: number;

  if (dateStr) {
    const parsedLocal = parseLocalDate(dateStr);
    if (parsedLocal) {
      // Expire at 23:59:59.999 local time on the specific expiry date
      target = new Date(
        parsedLocal.getFullYear(),
        parsedLocal.getMonth(),
        parsedLocal.getDate(),
        23,
        59,
        59,
        999
      ).getTime();
    } else {
      target = Date.now() + fallbackHours * 3600 * 1000;
    }
  } else {
    target = Date.now() + fallbackHours * 3600 * 1000;
  }

  const difference = target - Date.now();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / 1000 / 60) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  return { days, hours, minutes, seconds, isExpired: false };
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  expiryDateStr,
  hoursLeftFallback = 24,
  compact = false,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>(() => calculateTimeLeft(expiryDateStr, hoursLeftFallback));

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(expiryDateStr, hoursLeftFallback));
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(expiryDateStr, hoursLeftFallback));
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryDateStr, hoursLeftFallback]);

  if (timeLeft.isExpired) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
        <AlertCircle className="w-3 h-3" />
        <span>Expired</span>
      </span>
    );
  }

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 12;

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 text-[11px] font-mono tabular-nums ${
          isUrgent ? 'text-orange-600 font-bold' : 'text-slate-600'
        }`}
        title={`Expires in ${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`}
      >
        <Clock className={`w-3 h-3 ${isUrgent ? 'text-orange-600 animate-pulse' : 'text-slate-400'}`} />
        <span>
          {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
          {String(timeLeft.hours).padStart(2, '0')}:
          {String(timeLeft.minutes).padStart(2, '0')}:
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200/80 px-2.5 py-1 rounded-md text-xs text-orange-950 font-medium">
      <Clock className={`w-3.5 h-3.5 text-orange-600 shrink-0 ${isUrgent ? 'animate-pulse' : ''}`} />
      <span className="text-[11px] text-orange-800 font-medium">Ends in:</span>
      <div className="flex items-center gap-1 font-mono tabular-nums text-xs font-bold text-orange-700">
        {timeLeft.days > 0 && (
          <>
            <span>{timeLeft.days}d</span>
            <span>:</span>
          </>
        )}
        <span>{String(timeLeft.hours).padStart(2, '0')}h</span>
        <span>:</span>
        <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
        <span>:</span>
        <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
      </div>
    </div>
  );
};
