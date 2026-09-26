'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { animate, motion, useReducedMotion } from 'framer-motion';
import { compact } from '@/lib/types';
export function CardMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null); const reduced = useReducedMotion();
  useEffect(() => { if (reduced) return; const controls = Array.from(ref.current?.querySelectorAll<HTMLElement>('[data-count]') || []).map(el => animate(0, Number(el.dataset.count), { duration: 1.1, onUpdate: value => { el.textContent = compact(Math.round(value)); } })); return () => controls.forEach(c => c.stop()); }, [reduced, children]);
  return <motion.div ref={ref} initial={reduced ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}>{children}</motion.div>;
}
