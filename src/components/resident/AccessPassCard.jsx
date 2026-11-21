import React, { useState, useEffect, memo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Share2,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Copy,
  Repeat,
  TimerOff,
} from 'lucide-react';
import {
  buildQrPayload,
  buildWhatsAppMessage,
  formatCountdown,
  getRemainingMs,
  isPassExpired,
  isExpiringSoon,
} from '../../utils/passUtils';

export const AccessPassCard = memo(function AccessPassCard({
  pass,
  now,
  onCloseCard,
  onJumpToGuard,
  onForceExpire,
}) {
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timer = setTimeout(() => setToastMessage(''), 3200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const expired = isPassExpired(pass, now);
  const expiringSoon = isExpiringSoon(pass, now);
  const remainingMs = getRemainingMs(pass.expiresAt, now);
  const countdownText = formatCountdown(remainingMs);
  const qrPayload = buildQrPayload(pass);
  const usageLabel = pass.singleUse ? 'Un solo uso' : 'Uso múltiple';

  const handleShareWhatsApp = async () => {
    const shareText = buildWhatsAppMessage(pass, now);

    // 1. Intentar Web Share API nativo en dispositivos compatibles
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `CotoPass — Pase Lote ${pass.house}`,
          text: shareText,
        });
        setToastMessage('Pase compartido mediante menú nativo.');
        return;
      } catch (err) {
        // Si el usuario canceló explícitamente el share sheet nativo, no abrir fallback
        if (err && err.name === 'AbortError') {
          return;
        }
      }
    }

    // 2. Fallback: copiar al portapapeles + abrir WhatsApp Web / App
    if (
      typeof navigator !== 'undefined' &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === 'function'
    ) {
      navigator.clipboard.writeText(shareText).catch(() => {});
    }

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setToastMessage('Enlace de WhatsApp abierto y pase copiado al portapapeles.');
  };

  const handleCopyQrPayload = () => {
    if (
      typeof navigator !== 'undefined' &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === 'function'
    ) {
      navigator.clipboard.writeText(qrPayload).catch(() => {});
      setToastMessage('Cadena QR copiada. Pégala en Vista Caseta para probar lectura.');
    }
  };

  return (
    <div className="space-y-4 animate-scale-in">
      {/* Tarjeta Apple Wallet */}
      <div
        className={`relative rounded-3xl p-6 shadow-xl border overflow-hidden ${
          expired
            ? 'bg-zinc-900 text-zinc-300 border-rose-500/50'
            : 'bg-zinc-950 text-white border-zinc-800'
        }`}
      >
        {/* Muescas laterales estilo ticket físico */}
        <div
          aria-hidden="true"
          className="w-6 h-6 rounded-full bg-white absolute -left-3 top-1/2 -translate-y-1/2 border border-zinc-200"
        />
        <div
          aria-hidden="true"
          className="w-6 h-6 rounded-full bg-white absolute -right-3 top-1/2 -translate-y-1/2 border border-zinc-200"
        />

        {/* Cabecera del Ticket */}
        <div className="flex items-center justify-between gap-2 pb-4 border-b border-dashed border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              {pass.type}
            </span>
            <span className="text-xs font-mono font-semibold tabular-nums text-zinc-400">
              Lote {pass.house}
            </span>
          </div>

          {expired ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-rose-300 bg-rose-500/20 px-2.5 py-1 rounded-full border border-rose-500/30">
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
              Expirado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/25">
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              Activo en Caseta
            </span>
          )}
        </div>

        {/* Visitante y PIN */}
        <div className="py-4 text-center space-y-3">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
              Visitante Autorizado
            </p>
            <p className="text-lg font-bold tracking-tight text-white mt-0.5">
              {pass.visitorName}
            </p>
          </div>

          <div className="py-3 px-4 rounded-2xl bg-zinc-900 border border-zinc-800">
            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">
              PIN de Acceso en Caseta
            </p>
            <p
              className={`text-3xl font-black font-mono tabular-nums tracking-tight ${
                expired ? 'text-zinc-500 line-through' : 'text-white'
              }`}
            >
              Código: {pass.code}
            </p>
          </div>
        </div>

        {/* QR Real Escaneable (qrcode.react) */}
        <div className="flex flex-col items-center justify-center my-2">
          <div
            className={`p-4 bg-white rounded-2xl shadow-md transition-opacity ${
              expired ? 'opacity-35 grayscale' : 'opacity-100'
            }`}
          >
            <QRCodeSVG
              value={qrPayload}
              size={156}
              level="M"
              bgColor="#ffffff"
              fgColor="#09090b"
              includeMargin={false}
              aria-label={`Código QR para acceso ${pass.code}`}
            />
          </div>

          <button
            type="button"
            onClick={handleCopyQrPayload}
            className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-mono text-zinc-400 hover:text-zinc-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            title="Copiar cadena QR para simular escáner en Caseta"
          >
            <Copy className="w-3 h-3" aria-hidden="true" />
            <span className="truncate max-w-[230px]">{qrPayload}</span>
          </button>
        </div>

        {/* Estado de Vigencia y Modalidad de Uso */}
        <div className="mt-4 space-y-2">
          {expired ? (
            <div className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span className="text-xs font-bold">
                CÓDIGO EXPIRADO — Genera un nuevo pase
              </span>
            </div>
          ) : (
            <div
              className={`flex items-center justify-between gap-2 py-2.5 px-3.5 rounded-xl border ${
                expiringSoon
                  ? 'bg-amber-500/15 border-amber-500/35 text-amber-200'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-200'
              }`}
            >
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Restante:</span>
                <span className="font-mono font-bold tabular-nums">
                  {countdownText}
                </span>
              </span>

              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                  pass.singleUse
                    ? 'bg-zinc-800 text-zinc-200'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {!pass.singleUse && (
                  <Repeat className="w-3 h-3" aria-hidden="true" />
                )}
                <span>{usageLabel}</span>
              </span>
            </div>
          )}

          {!pass.singleUse && (
            <p className="text-center text-[11px] font-mono tabular-nums text-zinc-400">
              {pass.usesCount}{' '}
              {pass.usesCount === 1
                ? 'ingreso registrado'
                : 'ingresos registrados'}{' '}
              • Vigencia original: {pass.ttlLabel}
            </p>
          )}
        </div>
      </div>

      {/* Compartir por WhatsApp */}
      <button
        type="button"
        disabled={expired}
        onClick={handleShareWhatsApp}
        className={`w-full py-3.5 px-5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-4 ${
          expired
            ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
            : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-md shadow-emerald-600/20 focus:ring-emerald-500/30'
        }`}
      >
        <Share2 className="w-4 h-4" aria-hidden="true" />
        <span>Compartir por WhatsApp</span>
      </button>

      {toastMessage && (
        <div
          role="status"
          className="p-3 rounded-xl bg-zinc-900 text-zinc-100 text-xs font-medium text-center animate-fade-in"
        >
          {toastMessage}
        </div>
      )}

      {/* Acciones Secundarias */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={onCloseCard}
          className="py-2.5 px-3 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Nuevo pase</span>
        </button>

        <button
          type="button"
          onClick={onJumpToGuard}
          className="py-2.5 px-3 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <span>Probar en Caseta</span>
          <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* Helper sutil de demostración para forzar expiración en vivo */}
      {!expired && (
        <button
          type="button"
          onClick={() => onForceExpire(pass.id)}
          className="w-full py-2 px-3 rounded-xl border border-dashed border-zinc-300 hover:border-rose-300 hover:bg-rose-50/70 text-zinc-500 hover:text-rose-700 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          <TimerOff className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Demo: Simular expiración inmediata</span>
        </button>
      )}
    </div>
  );
});
