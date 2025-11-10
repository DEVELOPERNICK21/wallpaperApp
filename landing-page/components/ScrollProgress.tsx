"use client";

import { useEffect, useState } from "react";

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [isHidden, setIsHidden] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

      const ratio = docHeight > 0 ? scrollTop / docHeight : 0;
      setProgress(Math.min(Math.max(ratio, 0), 1));
      setIsHidden(scrollTop < 32);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 h-1 transition-opacity duration-500 ${
        isHidden ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="h-full bg-gradient-to-r from-sky-500 via-emerald-400 to-sky-500 transition-all duration-300 ease-out"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}

