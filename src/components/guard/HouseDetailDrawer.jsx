import React, { useEffect, memo } from 'react';
import {
  X,
  Check,
  AlertTriangle,
  Clock,
  Repeat,
  UserCheck,
  TimerOff,
  Trash2,
} from 'lucide-react';
import { getHouseProfile } from '../../data/mockData';
import {
  formatCountdown,
  formatRelativeTime,
  getRemainingMs,
  isPassExpired,
  isExpiringSoon,
} from '../../utils/passUtils';

export const HouseDetailDrawer = memo(function HouseDetailDrawer({
  selectedHouse,
  invitations,
  now,
  onClose,
  onAuthorizePass,
  onRevokePass,
  onForceExpirePass,
}) {
  useEffect(() => {
    if (selectedHouse === null) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedHouse, onClose]);

  if (selectedHouse === null) return null;

  const houseProfile = getHouseProfile(selectedHouse);
  const activeCount = invitations.filter((inv) => !isPassExpired(inv, now)).length;

  return (
    <div
      className="fixed inset-0 z-40 bg-zinc-950/60 backdrop-blur-sm flex justify-end animate-fade-in"
      onClick={onClose}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="house-drawer-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white h-full shadow-2xl border-l border-zinc-200 flex flex-col justify-between overflow-y-auto animate-slide-in-right"
      >
        <div>
          {/* Cabecera del Drawer */}
          <div className="p-6 bg-zinc-950 text-white flex items-center justify-between sticky top-0 z-10 border-b border-zinc-800">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-mono font-black text-xl tabular-nums text-white shrink-0">
                {selectedHouse}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3
                    id="house-drawer-title"
                    className="text-xl font-bold tracking-tight tabular-nums"
                  >
                    Casa {selectedHouse}
                  </h3>
                  <span className="text-xs font-mono tabular-nums px-2 py-0.5 rounded bg-zinc-800 text-zinc-200">
                    {activeCount} activo(s)
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5 truncate">
                  {houseProfile.familyName} • {houseProfile.street}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar panel de casa"
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Listado de Invitaciones */}
          <div className="p-6 space-y-4">
            {invitations.length === 0 ? (
              <div className="text-center py-14 px-4 rounded-2xl bg-zinc-50 border border-dashed border-zinc-200">
                <UserCheck
                  className="w-10 h-10 text-zinc-400 mx-auto mb-3"
                  aria-hidden="true"
                />
                <p className="text-sm font-bold text-zinc-800">
                  Casa {selectedHouse} sin pases registrados
                </p>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                  No existen invitaciones activas ni expiradas recientes para este lote.
                </p>
              </div>
            ) : (
              invitations.map((inv) => {
                const expired = isPassExpired(inv, now);
                const expiringSoon = isExpiringSoon(inv, now);
                const remaining = formatCountdown(
                  getRemainingMs(inv.expiresAt, now)
                );

                return (
                  <article
                    key={inv.id}
                    className={`p-5 rounded-2xl border transition-all space-y-4 ${
                      expired
                        ? 'bg-rose-50/70 border-rose-300'
                        : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-2 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-zinc-950 text-white text-xs font-semibold">
                            {inv.type}
                          </span>

                          <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-mono font-bold tabular-nums">
                            PIN: {inv.code}
                          </span>

                          {!expired && (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold tabular-nums border ${
                                expiringSoon
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                              }`}
                            >
                              <Clock className="w-3 h-3" aria-hidden="true" />
                              {remaining}
                            </span>
                          )}
                        </div>

                        <h4 className="text-lg font-bold text-zinc-950 tracking-tight">
                          {inv.visitorName}
                        </h4>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                          <span
                            className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded ${
                              inv.singleUse
                                ? 'bg-zinc-100 text-zinc-700'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {!inv.singleUse && (
                              <Repeat className="w-3 h-3" aria-hidden="true" />
                            )}
                            {inv.singleUse
                              ? 'Un solo uso'
                              : `Uso múltiple • ${inv.usesCount} ${
                                  inv.usesCount === 1
                                    ? 'ingreso registrado'
                                    : 'ingresos registrados'
                                }`}
                          </span>
                          <span className="text-zinc-400 font-mono text-[11px]">
                            Emitido {formatRelativeTime(inv.createdAt, now)}
                          </span>
                        </div>
                      </div>

                      {/* Acción Primaria: Dar Acceso o Bloqueado */}
                      {expired ? (
                        <button
                          type="button"
                          disabled
                          className="shrink-0 py-3 px-5 rounded-xl bg-rose-200 text-rose-700 font-bold text-xs cursor-not-allowed flex items-center justify-center gap-1.5"
                        >
                          <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                          <span>Expirado</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onAuthorizePass(inv)}
                          className="shrink-0 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
                        >
                          <Check className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
                          <span>Dar Acceso</span>
                        </button>
                      )}
                    </div>

                    {/* Alerta explícita si está expirado */}
                    {expired && (
                      <div
                        role="alert"
                        className="p-3 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-between gap-3"
                      >
                        <p className="text-xs font-extrabold text-rose-800">
                          CÓDIGO EXPIRADO — Solicitar nuevo pase al residente
                        </p>
                        <button
                          type="button"
                          onClick={() => onRevokePass(inv.id)}
                          aria-label={`Descartar pase expirado de ${inv.visitorName}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 hover:text-rose-900 px-2 py-1 rounded-lg hover:bg-rose-200/70 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Limpiar</span>
                        </button>
                      </div>
                    )}

                    {/* Controles discretos de demostración para pases activos */}
                    {!expired && (
                      <div className="pt-2 border-t border-zinc-100 flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => onForceExpirePass(inv.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 hover:text-rose-600 transition-colors"
                        >
                          <TimerOff className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Simular expiración (Demo)</span>
                        </button>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </div>

        {/* Pie del Drawer */}
        <div className="p-5 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <span className="text-[11px] font-mono text-zinc-500">
            TERMINAL CASETA #01 • ESC PARA CERRAR
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400"
          >
            Cerrar
          </button>
        </div>
      </aside>
    </div>
  );
});
