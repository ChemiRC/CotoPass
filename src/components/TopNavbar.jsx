import React, { memo } from 'react';
import { ShieldCheck, Smartphone, Monitor } from 'lucide-react';
import { COMMUNITY_NAME } from '../data/mockData';

export const TopNavbar = memo(function TopNavbar({
  activeView,
  onSelectView,
  activePassesCount,
  activeResidentHouse,
}) {
  return (
    <header className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur-md text-zinc-100 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Identidad de Marca */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 ring-1 ring-white/15 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">
                CotoPass
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 truncate hidden sm:block">
              {COMMUNITY_NAME} • Control de Acceso en Tiempo Real
            </p>
          </div>
        </div>

        {/* Conmutador Global: Vista Residente / Vista Caseta */}
        <nav
          role="tablist"
          aria-label="Cambiar modo de aplicación"
          className="inline-flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeView === 'residente'}
            onClick={() => onSelectView('residente')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              activeView === 'residente'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <Smartphone className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Vista Residente</span>
            <span className="hidden md:inline-block text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded bg-black/25 text-indigo-100">
              Lote {activeResidentHouse}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeView === 'caseta'}
            onClick={() => onSelectView('caseta')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              activeView === 'caseta'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <Monitor className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Vista Caseta</span>
            <span
              aria-label={`${activePassesCount} pases activos`}
              className={`px-1.5 py-0.5 text-[11px] font-mono font-bold tabular-nums rounded-md ${
                activePassesCount > 0
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {activePassesCount}
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
});
