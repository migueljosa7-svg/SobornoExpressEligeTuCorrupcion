import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameEvent } from '../lib/game';

export type Side = 'left' | 'right';

interface Props {
  event: GameEvent;
  onChoose: (side: Side) => void;
  onPreview: (side: Side | null) => void;
  /** Cambia cuando el padre quiere forzar una decisión (botones). */
  command: { side: Side; n: number } | null;
}

const THRESHOLD = 90;
const FLY = 520;

export default function SwipeCard({ event, onChoose, onPreview, command }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; id: number } | null>(null);
  const dx = useRef(0);
  const raf = useRef(0);
  const leaving = useRef(false);
  const lastCmd = useRef(0);
  const [side, setSide] = useState<Side | null>(null);
  const [lblOpacity, setLblOpacity] = useState(0);

  const paint = useCallback((x: number, animate: boolean) => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transition = animate ? 'transform .28s cubic-bezier(.2,.8,.2,1)' : 'none';
    el.style.transform = `translate3d(${x}px,${Math.abs(x) * 0.04}px,0) rotate(${x / 18}deg)`;
  }, []);

  const update = useCallback((x: number) => {
    const s: Side | null = x > 12 ? 'right' : x < -12 ? 'left' : null;
    setSide(s);
    setLblOpacity(Math.min(1, Math.abs(x) / THRESHOLD));
    onPreview(Math.abs(x) > 30 ? s : null);
  }, [onPreview]);

  const fly = useCallback((s: Side) => {
    if (leaving.current) return;
    leaving.current = true;
    const el = cardRef.current;
    if (el) {
      el.style.transition = 'transform .3s ease-in, opacity .3s';
      const x = s === 'right' ? FLY : -FLY;
      el.style.transform = `translate3d(${x}px,40px,0) rotate(${x / 14}deg)`;
      el.style.opacity = '0';
    }
    setSide(s);
    setLblOpacity(1);
    window.setTimeout(() => onChoose(s), 260);
  }, [onChoose]);

  useEffect(() => {
    if (command && command.n !== lastCmd.current) {
      lastCmd.current = command.n;
      fly(command.side);
    }
  }, [command, fly]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const down = (e: React.PointerEvent) => {
    if (leaving.current) return;
    start.current = { x: e.clientX, id: e.pointerId };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent) => {
    if (!start.current || leaving.current) return;
    dx.current = e.clientX - start.current.x;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => { paint(dx.current, false); update(dx.current); });
  };
  const up = () => {
    if (!start.current) return;
    start.current = null;
    cancelAnimationFrame(raf.current);
    if (Math.abs(dx.current) > THRESHOLD) fly(dx.current > 0 ? 'right' : 'left');
    else { dx.current = 0; paint(0, true); update(0); }
  };

  const key = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') fly('left');
    if (e.key === 'ArrowRight') fly('right');
  };

  return (
    <div
      ref={cardRef}
      tabIndex={0}
      onKeyDown={key}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      className="card-enter relative w-full max-w-sm select-none touch-none cursor-grab active:cursor-grabbing bg-paper text-ink border-4 border-black shadow-brut will-change-transform outline-none"
      style={{ touchAction: 'none' }}
    >
      <div className="bg-corrupt text-paper font-display uppercase tracking-wider px-3 py-2 border-b-4 border-black flex items-center gap-2 text-lg">
        <span className="text-2xl">{event.icon}</span>{event.who}
      </div>
      <p className="px-4 py-6 text-xl leading-snug font-bold min-h-[11rem] flex items-center">{event.text}</p>
      <div className="flex justify-between border-t-4 border-black font-display uppercase text-sm">
        <span className="px-3 py-2 bg-ink text-billete">← {event.left.label}</span>
        <span className="px-3 py-2 bg-ink text-billete">{event.right.label} →</span>
      </div>
      {side && (
        <div
          className={`pointer-events-none absolute top-14 border-4 px-3 py-1 font-display text-2xl uppercase -rotate-6 bg-ink ${side === 'right' ? 'right-3 text-billete border-billete' : 'left-3 text-corrupt border-corrupt'}`}
          style={{ opacity: lblOpacity }}
        >
          {event[side].label}
        </div>
      )}
    </div>
  );
}
