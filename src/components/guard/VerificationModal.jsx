import React, { useEffect, useRef, memo } from 'react';
import {
  ShieldCheck,
  Check,
  X,
  AlertTriangle,
  Car,
  Package,
  Users,
  Clock,
  Repeat,
  Home,
} from 'lucide-react';
import { getHouseProfile } from '../../data/mockData';
import {
  formatCountdown,
  getRemainingMs,
  isPassExpired,
} from '../../utils/passUtils';

const TYPE_ICONS = {
  'Uber/Didi': Car,
  Paquetería: Package,
  Visita: Users,
};

export const VerificationModal = memo(function VerificationModal({
  invitation,
  now,
  onConfirm,
  onCancel,
}) {
  const readyForEnterRef = useRef(false);

  // Evitar que el mismo Enter que abrió el modal dispare inmediatamente la confirmación
  useEffect(() => {
    if (!invitation) return undefined;
    readyForEnterRef.current = false;

    const armTimer = setTimeout(() => {
      readyForEnterRef.current = true;
    }, 150);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
        return;
      }
      if (e.key === 'Enter' && readyForEnterRef.current && !e.repeat) {
        if (!isPassExpired(invitation, Date.now())) {
          e.preventDefault();
          onConfirm(invitation);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(armTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [invitation, onConfirm, onCancel]);

  if (!invitation) return null;

  const expired = isPassExpired(invitation, now);
  const remaining = formatCountdown(getRemainingMs(invitation.expiresAt, now));
  const houseProfile = getHouseProfile(invitation.house);
  const TypeIcon = TYPE_ICONS[invitation.type] || Users;

  return (
    <div
      className="fixed inset-0 z-50 bg-zinc-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="verify-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden animate-scale-in"
      >
        {/* Cabecera de Seguridad */}
        <div
          className={`p-6 flex items-center justify-between ${
            expired ? 'bg-rose-600 text-white' : 'bg-zinc-950 text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                expired ? 'bg-rose-700' : 'bg-indigo-600'
              }`}
            >
              {expired ? (
                <AlertTriangle className="w-5 h-5 text-white" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest opacity-80">
                Verificación de Seguridad en Caseta
              </p>
              <h2
                id="verify-modal-title"
                className="text-lg font-bold tracking-tight"
              >
                {expired
                  ? 'Acceso Rechazado — Pase Expirado'
                  : 'Confirmar Identidad del Visitante'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancelar verificación"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo de Datos de Alta Legibilidad */}
        <div className="p-6 space-y-5">
          {expired && (
            <div
              role="alert"
              className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-400 text-rose-800 text-sm font-extrabold text-center"
            >
              CÓDIGO EXPIRADO — Solicitar nuevo pase al residente
            </div>
          )}

          {/* Visitante y Tipo */}
          <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-950 text-white text-xs font-bold">
                <TypeIcon className="w-3.5 h-3.5" aria-hidden="true" />
                {invitation.type}
              </span>
              <span className="font-mono text-sm font-black tabular-nums px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                PIN: {invitation.code}
              </span>
            </div>

            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                Visitante
              </p>
              <p className="text-2xl font-black text-zinc-950 tracking-tight mt-0.5">
                {invitation.visitorName}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-200">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                  <Home className="w-3 h-3" aria-hidden="true" />
                  Destino
                </p>
                <p className="text-sm font-bold text-zinc-900 tabular-nums mt-0.5">
                  Casa {invitation.house}
                </p>
                <p className="text-[11px] text-zinc-500 truncate">
                  {houseProfile.familyName}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  Vigencia Restante
                </p>
                <p
                  className={`text-sm font-mono font-bold tabular-nums mt-0.5 ${
                    expired ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  {expired ? '00:00 (Expirado)' : remaining}
                </p>
                <p className="text-[11px] text-zinc-500">
                  Emitido por {invitation.ttlLabel}
                </p>
              </div>
            </div>
          </div>

          {/* Modalidad de Uso */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
              invitation.singleUse
                ? 'bg-zinc-50 border-zinc-200 text-zinc-700'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-semibold">
              {!invitation.singleUse && (
                <Repeat
                  className="w-4 h-4 text-amber-600 shrink-0"
                  aria-hidden="true"
                />
              )}
              <span>
                {invitation.singleUse
                  ? 'Pase de un solo uso — Se consumirá al confirmar'
                  : `Pase de uso múltiple — Permanecerá activo (${invitation.usesCount} ingresos previos)`}
              </span>
            </div>
          </div>

          {/* Botones de Decisión */}
          <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-700 font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400"
            >
              Cancelar (Esc)
            </button>

            <button
              type="button"
              disabled={expired}
              onClick={() => onConfirm(invitation)}
              className={`w-full sm:flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-4 ${
                expired
                  ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-lg shadow-emerald-600/20 focus:ring-emerald-500/30'
              }`}
            >
              <Check className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
              <span>Confirmar y Abrir (Enter)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
