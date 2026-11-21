import React, { useEffect, useRef, memo } from 'react';
import {
  Search,
  X,
  Check,
  AlertTriangle,
  ScanLine,
  CornerDownLeft,
} from 'lucide-react';
import {
  formatCountdown,
  getRemainingMs,
  isPassExpired,
  parseGuardInput,
} from '../../utils/passUtils';

export const GuardSearchBar = memo(function GuardSearchBar({
  query,
  onQueryChange,
  onSubmitQuery,
  invitationsByPin,
  invitationsById,
  now,
  feedbackError,
  expiredAlertPass,
  onInspectPass,
  onClearAlerts,
  shouldAutoFocus,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (shouldAutoFocus) {
      inputRef.current?.focus();
    }
  }, [shouldAutoFocus]);

  const parsed = parseGuardInput(query);

  let liveMatch = null;
  if (parsed.kind === 'qr') {
    liveMatch =
      invitationsById.get(parsed.id) || invitationsByPin.get(parsed.pin) || null;
  } else if (parsed.kind === 'pin') {
    liveMatch = invitationsByPin.get(parsed.pin) || null;
  }

  const liveMatchExpired = liveMatch ? isPassExpired(liveMatch, now) : false;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitQuery(query);
  };

  const handleClear = () => {
    onQueryChange('');
    onClearAlerts();
    inputRef.current?.focus();
  };

  const shownExpiredPass =
    expiredAlertPass || (liveMatch && liveMatchExpired ? liveMatch : null);

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="relative">
        <label htmlFor="guard-search-input" className="sr-only">
          Buscar PIN, número de casa, visitante o escanear código QR
        </label>

        <Search
          className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        />

        <input
          ref={inputRef}
          id="guard-search-input"
          type="text"
          autoFocus
          autoComplete="off"
          value={query}
          onChange={(e) => {
            onQueryChange(e.target.value);
            onClearAlerts();
          }}
          placeholder="Buscar PIN, Lote, visitante o escanear QR..."
          className="w-full pl-12 pr-36 py-3.5 rounded-xl border border-zinc-300 bg-zinc-50 text-zinc-950 placeholder:text-zinc-400 text-base font-medium tabular-nums transition-all hover:border-zinc-400 focus:bg-white focus:border-zinc-950 focus:ring-4 focus:ring-zinc-900/10 focus:outline-none"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Limpiar búsqueda"
            className="absolute right-28 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <span>Buscar</span>
          <CornerDownLeft className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
        </button>
      </form>

      {/* Atajos sutiles de lectura USB HID / Demo */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500">
        <span className="inline-flex items-center gap-1.5">
          <ScanLine className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
          <span>
            Compatible con lector QR USB (ej.{' '}
            <code className="font-mono text-zinc-700 bg-zinc-100 px-1 py-0.5 rounded">
              COTOPASS|H:90|P:4920|...
            </code>
            )
          </span>
        </span>
        <span className="font-mono text-[11px] text-zinc-400 tabular-nums">
          Demo: PIN activo <strong className="text-zinc-700">4920</strong> •
          Expirado <strong className="text-rose-600">9031</strong>
        </span>
      </div>

      {/* Coincidencia activa instantánea */}
      {liveMatch && !liveMatchExpired && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-md bg-emerald-600 text-white font-mono text-xs font-bold tabular-nums">
              PIN {liveMatch.code}
            </span>
            <span className="text-sm font-bold text-zinc-950">
              Casa {liveMatch.house} • {liveMatch.visitorName}
            </span>
            <span className="text-xs font-medium text-zinc-600 bg-white px-2 py-0.5 rounded border border-emerald-200">
              {liveMatch.type}
            </span>
            <span className="text-xs font-mono font-semibold tabular-nums text-emerald-700">
              Resta {formatCountdown(getRemainingMs(liveMatch.expiresAt, now))}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onInspectPass(liveMatch)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <Check className="w-4 h-4" aria-hidden="true" />
            <span>Verificar Acceso (Enter)</span>
          </button>
        </div>
      )}

      {/* Alerta roja obligatoria: CÓDIGO EXPIRADO */}
      {shownExpiredPass && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-50 border-2 border-rose-500/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-scale-in"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-rose-800 tracking-tight">
                CÓDIGO EXPIRADO — Solicitar nuevo pase al residente
              </p>
              <p className="text-xs text-rose-700 mt-0.5 font-mono tabular-nums">
                Casa {shownExpiredPass.house} • {shownExpiredPass.visitorName} (
                {shownExpiredPass.type}) • PIN {shownExpiredPass.code}
              </p>
            </div>
          </div>

          <span className="shrink-0 px-3 py-1.5 rounded-lg bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold uppercase tracking-wider">
            Acceso Bloqueado
          </span>
        </div>
      )}

      {/* Error genérico de búsqueda */}
      {feedbackError && !shownExpiredPass && (
        <p
          role="alert"
          className="text-xs font-semibold text-rose-600 flex items-center gap-1.5 animate-fade-in"
        >
          <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{feedbackError}</span>
        </p>
      )}
    </div>
  );
});
