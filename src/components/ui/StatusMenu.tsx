'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DocType, nextStatuses, statusMeta } from '@/lib/status';

/**
 * Small inline dropdown that lists the allowed next-status actions for a
 * document and calls `onChange` when one is picked. Renders nothing when the
 * document is in a terminal state (no allowed transitions), keeping the UI
 * clean and preventing invalid moves (spec §3–§6 state-machines).
 *
 * The menu is rendered through a portal to `document.body` and positioned with
 * `position: fixed` (coordinates read from the trigger button). The portal is
 * essential: an ancestor with a CSS transform (e.g. the page's
 * `animate-fade-in-up` wrapper) would otherwise become the containing block
 * for fixed positioning and throw the coordinates off.
 */
export function StatusMenu({
  type,
  current,
  disabled,
  onChange,
}: {
  type: DocType;
  current: string;
  disabled?: boolean;
  onChange: (status: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const options = nextStatuses(type, current);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(t) &&
        btnRef.current &&
        !btnRef.current.contains(t)
      ) {
        setOpen(false);
      }
    }
    function onScrollOrResize() {
      setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [open]);

  if (!options.length) return null;

  const MENU_WIDTH = 176;

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      // Align the menu's right edge under the button, clamped to the viewport.
      const left = Math.max(8, Math.min(r.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8));
      setCoords({ top: r.bottom + 6, left });
    }
    setOpen((o) => !o);
  };

  return (
    <>
      <button
        type="button"
        ref={btnRef}
        disabled={disabled}
        onClick={toggle}
        className="rounded-lg border border-surface-border px-2.5 py-1 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white disabled:opacity-50"
        title="Change status"
      >
        Status ▾
      </button>
      {open &&
        mounted &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: 'fixed', top: coords.top, left: coords.left, width: MENU_WIDTH }}
            className="z-[100] overflow-hidden rounded-xl border border-surface-border bg-surface-card shadow-card"
          >
            {options.map((s) => (
              <button
                key={s}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  onChange(s);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5"
              >
                <span
                  className={`h-2 w-2 rounded-full ring-1 ${statusMeta(s).className}`}
                />
                Mark {statusMeta(s).label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
