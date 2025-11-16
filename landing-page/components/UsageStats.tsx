"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type UsageStatsProps = {
  target: number;
  label: string;
  durationMs?: number;
  icon?: string;
};

function AnimatedCounter({ target, label, durationMs = 1300, icon }: UsageStatsProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  const formatter = useMemo(
    () => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }),
    [],
  );

  useEffect(() => {
    const start = performance.now();
    const startValue = displayValue;

    const animate = (timestamp: number) => {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = Math.round(
        startValue + (target - startValue) * eased,
      );

      setDisplayValue(nextValue);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [target, durationMs]);

  return (
    <div className="flex flex-col items-center gap-2">
      {icon && (
        <span className="text-2xl" role="img" aria-label={label}>
          {icon}
        </span>
      )}
      <span className="text-3xl font-semibold text-sky-300 sm:text-4xl">
        {formatter.format(displayValue)}
      </span>
      <span className="text-xs uppercase tracking-wider text-slate-400 sm:text-sm">
        {label}
      </span>
    </div>
  );
}

type UsageStatsDisplayProps = {
  users: number;
  chats: number;
  messages: number;
};

export function UsageStats({ users, chats, messages }: UsageStatsDisplayProps) {
  return (
    <div className="grid grid-cols-3 gap-4 rounded-2xl border border-slate-800/70 bg-slate-950/40 p-6">
      <AnimatedCounter target={users} label="Users" icon="👥" />
      <AnimatedCounter target={chats} label="Chats" icon="💬" />
      <AnimatedCounter target={messages} label="Messages" icon="📨" />
    </div>
  );
}

