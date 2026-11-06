import { STAT_KEYS, STAT_META } from '../lib/game';
import type { Fx, Stats } from '../lib/game';

interface Props { stats: Stats; preview: Fx | null; flash: Partial<Record<keyof Stats, number>> }

export default function StatBars({ stats, preview, flash }: Props) {
  return (
    <header className="grid grid-cols-4 gap-2 w-full max-w-sm px-3 pt-[max(env(safe-area-inset-top),0.75rem)]">
      {STAT_KEYS.map(k => {
        const v = stats[k];
        const danger = v <= 15 || v >= 85;
        const p = preview?.[k] ?? 0;
        const d = flash[k] ?? 0;
        return (
          <div key={k} className="flex flex-col items-center" aria-label={`${STAT_META[k].name}: ${v}`}>
            <div className="relative h-5 flex items-center justify-center text-lg leading-none">
              {STAT_META[k].icon}
              {p !== 0 && (
                <span className={`absolute -top-1 -right-1 rounded-full bg-billete border-2 border-black ${Math.abs(p) > 9 ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5'}`} />
              )}
            </div>
            <div className={`w-full h-14 border-2 border-black bg-panel relative overflow-hidden ${danger ? 'animate-pulse' : ''}`}>
              <div
                className={`absolute bottom-0 left-0 right-0 transition-[height] duration-500 ease-out ${danger ? 'bg-corrupt' : 'bg-billete'}`}
                style={{ height: `${v}%` }}
              />
              {d !== 0 && (
                <span className={`absolute inset-0 flex items-center justify-center font-display text-lg drop-shadow ${d > 0 ? 'text-white' : 'text-corrupt'} bg-black/50 delta-pop`}>
                  {d > 0 ? '+' : ''}{d}
                </span>
              )}
            </div>
            <span className="text-[10px] uppercase tracking-wide text-paper/70 mt-0.5 font-bold">{STAT_META[k].short}</span>
          </div>
        );
      })}
    </header>
  );
}
