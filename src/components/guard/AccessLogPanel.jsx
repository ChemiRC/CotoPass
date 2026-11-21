import React, { memo } from 'react';
import { History, Repeat } from 'lucide-react';
import { formatClockTime } from '../../utils/passUtils';

export const AccessLogPanel = memo(function AccessLogPanel({ accessLog }) {
  return (
    <section
      aria-label="Bitácora de accesos recientes"
      className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between gap-2">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-2">
          <History className="w-4 h-4 text-zinc-500" aria-hidden="true" />
          <span>Bitácora de Accesos Autorizados</span>
        </h3>
        <span className="text-xs font-mono tabular-nums text-zinc-500">
          {accessLog.length}{' '}
          {accessLog.length === 1 ? 'registro' : 'registros'} en turno
        </span>
      </div>

      {accessLog.length === 0 ? (
        <div className="p-8 text-center text-xs text-zinc-500">
          Aún no se han registrado ingresos en este turno.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                <th className="py-2.5 px-4 font-semibold">Hora</th>
                <th className="py-2.5 px-4 font-semibold">Casa</th>
                <th className="py-2.5 px-4 font-semibold">Visitante</th>
                <th className="py-2.5 px-4 font-semibold">Tipo</th>
                <th className="py-2.5 px-4 font-semibold">PIN</th>
                <th className="py-2.5 px-4 font-semibold">Modalidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs">
              {accessLog.map((entry) => (
                <tr
                  key={entry.id}
                  className="hover:bg-zinc-50/80 transition-colors"
                >
                  <td className="py-3 px-4 font-mono tabular-nums text-zinc-500 whitespace-nowrap">
                    {formatClockTime(entry.timestamp)}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold tabular-nums text-zinc-950 whitespace-nowrap">
                    Casa {entry.house}
                  </td>
                  <td className="py-3 px-4 font-semibold text-zinc-900">
                    {entry.visitorName}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-700 font-semibold text-[11px]">
                      {entry.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold tabular-nums text-zinc-800 whitespace-nowrap">
                    {entry.code}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {entry.singleUse ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        Un solo uso (Consumido)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md tabular-nums">
                        <Repeat className="w-3 h-3" aria-hidden="true" />
                        Uso múltiple • Ingreso #{entry.useNumber}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
});
