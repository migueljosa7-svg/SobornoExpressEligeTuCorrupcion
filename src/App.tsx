import { useCallback, useMemo, useRef, useState } from 'react';
import SwipeCard from './components/SwipeCard';
import type { Side } from './components/SwipeCard';
import StatBars from './components/StatBars';
import {
  ALL_EVENTS, START, STAT_KEYS, STAT_META, applyFx, getEnding, loadBest, rankFor, saveBest, shuffle
} from './lib/game';
import type { Ending, GameEvent, Stats } from './lib/game';

type Screen = 'menu' | 'play' | 'over';

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [stats, setStats] = useState<Stats>(START);
  const [deck, setDeck] = useState<GameEvent[]>([]);
  const [turn, setTurn] = useState(0);
  const [preview, setPreview] = useState<Side | null>(null);
  const [flash, setFlash] = useState<Partial<Stats>>({});
  const [ending, setEnding] = useState<Ending | null>(null);
  const [best, setBest] = useState(loadBest());
  const [cmd, setCmd] = useState<{ side: Side; n: number } | null>(null);
  const [toast, setToast] = useState('');
  const cmdN = useRef(0);
  const history = useRef<string[]>([]);

  const current = deck[0];

  const startGame = () => {
    setStats(START); setTurn(0); setEnding(null); setFlash({}); setPreview(null);
    setDeck(shuffle(ALL_EVENTS)); history.current = [];
    setScreen('play');
  };

  const choose = useCallback((side: Side) => {
    const ev = deck[0];
    if (!ev) return;
    const next = applyFx(stats, ev[side].fx);
    const diff: Partial<Stats> = {};
    STAT_KEYS.forEach(k => { if (next[k] !== stats[k]) diff[k] = next[k] - stats[k]; });
    setFlash(diff);
    window.setTimeout(() => setFlash({}), 900);
    history.current.push(ev[side].label);
    setPreview(null);
    setStats(next);
    const turns = turn + 1;
    setTurn(turns);
    const end = getEnding(next);
    if (end) {
      if (turns > best) { setBest(turns); saveBest(turns); }
      window.setTimeout(() => { setEnding(end); setScreen('over'); }, 700);
      return;
    }
    // Rebarajar al agotar el mazo evitando repetir la carta recién jugada.
    setDeck(d => {
      const rest = d.slice(1);
      if (rest.length > 0) return rest;
      let fresh = shuffle(ALL_EVENTS);
      if (fresh[0].id === ev.id) fresh = [...fresh.slice(1), fresh[0]];
      return fresh;
    });
  }, [deck, stats, turn, best]);

  const press = (side: Side) => { cmdN.current += 1; setCmd({ side, n: cmdN.current }); };

  const previewFx = useMemo(() => (current && preview ? current[preview].fx : null), [current, preview]);

  const share = async () => {
    const rank = rankFor(turn);
    const text = `🏛️ SOBORNO EXPRESS\n${ending?.title}\nAguanté ${turn} decisiones corruptas.\nRango: ${rank}\n¿Aguantas más tú sin acabar en el juzgado?`;
    try {
      if (navigator.share) await navigator.share({ text });
      else { await navigator.clipboard.writeText(text); setToast('Copiado al portapapeles'); window.setTimeout(() => setToast(''), 1800); }
    } catch { /* cancelado */ }
  };

  if (screen === 'menu') {
    return (
      <Shell>
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 px-6">
          <div className="text-7xl">💶</div>
          <h1 className="font-display uppercase text-5xl leading-none text-billete" style={{ textShadow: '4px 4px 0 #e11d2e' }}>
            Soborno<br />Express
          </h1>
          <p className="font-bold text-paper/80">Elige tu corrupción. Desliza, pacta y sobrevive sin acabar delante del juez.</p>
          <button className="btn-brut bg-corrupt text-paper" onClick={startGame}>Empezar legislatura</button>
          {best > 0 && <p className="text-sm text-paper/60 uppercase font-bold">Récord: {best} decisiones</p>}
          <p className="text-xs text-paper/40 max-w-xs">Sátira ficticia. Cualquier parecido con la realidad es puro y muy lamentable.</p>
        </div>
      </Shell>
    );
  }

  if (screen === 'over' && ending) {
    return (
      <Shell>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5 text-center w-full max-w-sm">
          <div className="text-6xl">🚨</div>
          <h2 className="font-display uppercase text-4xl text-corrupt" style={{ textShadow: '3px 3px 0 #000' }}>{ending.title}</h2>
          <p className="font-bold bg-paper text-ink border-4 border-black shadow-brut p-4 text-left">{ending.text}</p>
          <div className="w-full grid grid-cols-2 gap-2 text-left">
            <Stat label="Decisiones" value={String(turn)} />
            <Stat label="Récord" value={String(best)} />
            <div className="col-span-2"><Stat label="Rango final" value={rankFor(turn)} /></div>
          </div>
          <div className="w-full grid grid-cols-4 gap-1 text-center text-xs">
            {STAT_KEYS.map(k => (
              <div key={k} className="bg-panel border-2 border-black p-1">
                <div>{STAT_META[k].icon}</div>
                <div className="font-display text-lg text-billete">{stats[k]}</div>
              </div>
            ))}
          </div>
          <button className="btn-brut bg-billete text-ink w-full" onClick={share}>Compartir meme</button>
          <button className="btn-brut bg-corrupt text-paper w-full" onClick={startGame}>Otra legislatura</button>
          <button className="text-paper/60 underline text-sm" onClick={() => setScreen('menu')}>Menú</button>
        </div>
        {toast && <div className="fixed bottom-6 bg-billete text-ink font-bold px-4 py-2 border-2 border-black">{toast}</div>}
      </Shell>
    );
  }

  return (
    <Shell>
      <StatBars stats={stats} preview={previewFx} flash={flash} />
      <div className="text-xs uppercase font-bold text-paper/50 mt-2">Decisión nº {turn + 1}</div>
      <main className="flex-1 w-full flex items-center justify-center px-5">
        {current && <SwipeCard key={`${current.id}-${turn}`} event={current} onChoose={choose} onPreview={setPreview} command={cmd} />}
      </main>
      <footer className="w-full max-w-sm grid grid-cols-2 gap-3 px-5 pb-[max(env(safe-area-inset-bottom),1rem)]">
        <button className="btn-brut bg-panel text-corrupt border-corrupt" onClick={() => press('left')}>← {current?.left.label}</button>
        <button className="btn-brut bg-panel text-billete border-billete" onClick={() => press('right')}>{current?.right.label} →</button>
      </footer>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="h-full w-full flex flex-col items-center bg-ink text-paper">{children}</div>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-panel border-2 border-black p-2">
      <div className="text-[10px] uppercase text-paper/60 font-bold">{label}</div>
      <div className="font-display text-xl text-billete uppercase">{value}</div>
    </div>
  );
}
