"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type UserCounterProps = {
  target: number;
  durationMs?: number;
};

export function UserCounter({ target, durationMs = 1300 }: UserCounterProps) {
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs]);

  return (
    <span className="inline-flex min-w-[6rem] translate-y-1 text-5xl font-semibold text-sky-300 sm:text-6xl">
      {formatter.format(displayValue)}
    </span>
  );
}

