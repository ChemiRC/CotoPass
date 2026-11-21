import React, { useEffect, useRef, memo } from 'react';
import { Check, ShieldCheck, Repeat } from 'lucide-react';

export const AuthorizedOverlay = memo(function AuthorizedOverlay({
  authorization,
  onDismiss,
}) {
  const readyForKeyDismissRef = useRef(false);

  useEffect(() => {
    if (!authorization) return undefined;
    readyForKeyDismissRef.current = false;

    const armTimer = setTimeout(() => {
      readyForKeyDismissRef.current = true;
    }, 150);

    const autoCloseTimer = setTimeout(() => {
      onDismiss();
    }, 3000);

    const handleKeyDown = (e) => {
      if (
        readyForKeyDismissRef.current &&
        (e.key === 'Escape' || e.key === 'Enter')
      ) {
        e.preventDefault();
        onDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(armTimer);
      clearTimeout(autoCloseTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [authorization, onDismiss]);

  if (!authorization) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      onClick={onDismiss}
      className="fixed inset-0 z-50 bg-emerald-600 text-white flex flex-col items-center justify-center p-6 cursor-pointer select-none animate-fade-in"
    >
      <div className="max-w-4xl w-full text-center flex flex-col items-center">
        <div className="w-28 h-28 rounded-3xl bg-zinc-950/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center mb-8 shadow-2xl">
          <Check className="w-16 h-16 text-white stroke-[3]" aria-hidden="true" />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-950/25 text-emerald-50 text-xs font-mono uppercase tracking-widest mb-5 border border-white/25 tabular-nums">
          <ShieldCheck className="w-4 h-4" aria-hidden="true" />
          <span>Barrera Abierta • PIN {authorization.code}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight tabular-nums">
          AUTORIZADO - Casa {authorization.house} ({authorization.visitorName})
        </h1>

        <p className="mt-5 text-emerald-50 text-lg sm:text-xl font-medium">
          Tipo: {authorization.type} •{' '}
          {authorization.singleUse
            ? 'Pase de un solo uso consumido'
            : `Pase de uso múltiple vigente (Ingreso #${authorization.usesCount})`}
        </p>

        {!authorization.singleUse && (
          <div className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400/20 border border-amber-200/40 text-amber-50 text-xs font-semibold">
            <Repeat className="w-4 h-4" aria-hidden="true" />
            <span>Este pase permanece activo para futuras entradas</span>
          </div>
        )}

        {/* Barra animada real de 3 segundos */}
        <div className="mt-10 w-72 h-2 bg-emerald-800/70 rounded-full overflow-hidden">
          <div
            key={authorization.overlayKey}
            className="h-full w-full bg-white rounded-full animate-countdown-3s"
          />
        </div>

        <p className="mt-3 text-xs font-mono text-emerald-100/90">
          Cierre automático en 3 s • Clic, Enter o Esc para siguiente vehículo
        </p>
      </div>
    </div>
  );
});
