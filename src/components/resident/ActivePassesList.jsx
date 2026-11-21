import React, { memo } from 'react';
import {
  QrCode,
  Trash2,
  Clock,
  Repeat,
  AlertTriangle,
  TimerOff,
} from 'lucide-react';
import {
  formatCountdown,
  getRemainingMs,
  isPassExpired,
  isExpiringSoon,
} from '../../utils/passUtils';

export const ActivePassesList = memo(function ActivePassesList({
  house,
  invitations,
  now,
  selectedPassId,
  onInspectPass,
  onRevokePass,
  onForceExpire,
}) {
  if (!invitations || invitations.length === 0) {
    return (
      <div className="mt-6 pt-5 border-t border-zinc-100 text-center">
        <p className="text-xs font-medium text-zinc-400">
          No hay pases emitidos para el Lote {house} todavía.
        </p>
      </div>
    );
  }

  return (
    <section
      aria-label={`Pases emitidos para el Lote ${house}`}
      className="mt-6 pt-5 border-t border-zinc-200/80"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500">
          Pases de Lote {house} ({invitations.length})
        </h2>
        <span className="text-[11px] text-zinc-400">
          Toca un pase para ver QR
        </span>
      </div>

      <div className="space-y-2.5">
        {invitations.map((inv) => {
          const expired = isPassExpired(inv, now);
          const expiringSoon = isExpiringSoon(inv, now);
          const remaining = formatCountdown(getRemainingMs(inv.expiresAt, now));
          const isCurrentOpen = inv.id === selectedPassId;

          return (
            <div
              key={inv.id}
              className={`p-3 rounded-2xl border transition-all ${
                expired
                  ? 'bg-rose-50/60 border-rose-200'
                  : isCurrentOpen
                  ? 'bg-indigo-50/60 border-indigo-300'
                  : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onInspectPass(inv.id)}
                  className="flex-1 text-left min-w-0 focus:outline-none"
                >
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-zinc-900 truncate">
                      {inv.visitorName}
                    </span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-200/80 text-zinc-700">
                      {inv.type}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-2 flex-wrap text-[11px]">
                    {expired ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-rose-700">
                        <AlertTriangle
                          className="w-3 h-3"
                          aria-hidden="true"
                        />
                        Expirado
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1 font-mono font-semibold tabular-nums ${
                          expiringSoon ? 'text-amber-700' : 'text-zinc-600'
                        }`}
                      >
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        {remaining}
                      </span>
                    )}

                    <span className="text-zinc-300">•</span>

                    <span className="inline-flex items-center gap-1 text-zinc-500">
                      {!inv.singleUse && (
                        <Repeat
                          className="w-3 h-3 text-amber-600"
                          aria-hidden="true"
                        />
                      )}
                      <span>
                        {inv.singleUse
                          ? 'Un solo uso'
                          : `Uso múltiple (${inv.usesCount} ing.)`}
                      </span>
                    </span>
                  </div>
                </button>

                <span
                  className={`shrink-0 px-2 py-1 rounded-lg font-mono text-xs font-bold tabular-nums ${
                    expired
                      ? 'bg-rose-100 text-rose-700 line-through'
                      : 'bg-zinc-950 text-white'
                  }`}
                >
                  {inv.code}
                </span>
              </div>

              <div className="mt-2.5 pt-2 border-t border-zinc-200/70 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onInspectPass(inv.id)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 hover:text-indigo-800 focus:outline-none focus:underline"
                >
                  <QrCode className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Ver pase / Compartir</span>
                </button>

                <div className="flex items-center gap-2">
                  {!expired && (
                    <button
                      type="button"
                      onClick={() => onForceExpire(inv.id)}
                      aria-label={`Simular expiración del pase de ${inv.visitorName}`}
                      title="Demo: expirar código ahora"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-amber-700 px-1.5 py-0.5 rounded hover:bg-amber-50 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <TimerOff className="w-3 h-3" aria-hidden="true" />
                      <span>Expirar</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onRevokePass(inv.id)}
                    aria-label={`Revocar pase de ${inv.visitorName}`}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 hover:text-rose-700 px-1.5 py-0.5 rounded hover:bg-rose-50 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <Trash2 className="w-3 h-3" aria-hidden="true" />
                    <span>Revocar</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
});
