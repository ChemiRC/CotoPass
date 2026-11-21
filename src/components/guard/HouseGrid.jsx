import React, { useMemo, useCallback, memo } from 'react';
import { Building2 } from 'lucide-react';
import { HOUSES_NUMBERS, TOTAL_COMMUNITY_HOUSES } from '../../data/mockData';

const HouseGridCell = memo(function HouseGridCell({
  houseNumber,
  activeCount,
  expiredCount,
  isSelected,
  isDimmed,
  onSelectHouse,
}) {
  const hasActive = activeCount > 0;
  const hasOnlyExpired = !hasActive && expiredCount > 0;

  const handleClick = useCallback(() => {
    onSelectHouse(houseNumber);
  }, [houseNumber, onSelectHouse]);

  let cellClasses =
    'bg-zinc-50 border border-zinc-200 text-zinc-400 hover:bg-zinc-100 hover:border-zinc-300 hover:text-zinc-700';

  if (hasActive) {
    cellClasses =
      'bg-zinc-950 text-white border-2 border-indigo-500 shadow-md shadow-indigo-500/10 hover:bg-zinc-900 hover:scale-[1.02]';
  } else if (hasOnlyExpired) {
    cellClasses =
      'bg-rose-50/80 text-rose-700 border border-rose-300 hover:bg-rose-100';
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={
        hasActive
          ? `Casa ${houseNumber}, ${activeCount} pases activos`
          : hasOnlyExpired
          ? `Casa ${houseNumber}, ${expiredCount} pases expirados`
          : `Casa ${houseNumber}, sin invitaciones`
      }
      className={`relative h-14 rounded-xl font-mono transition-all duration-150 flex flex-col items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500 ${cellClasses} ${
        isSelected ? 'ring-4 ring-indigo-500/30' : ''
      } ${isDimmed ? 'opacity-25' : ''}`}
    >
      <span className="text-sm font-bold tabular-nums">{houseNumber}</span>

      {hasActive && (
        <span className="text-[9px] font-sans font-semibold uppercase tracking-wider text-indigo-300 leading-none mt-0.5">
          Activa
        </span>
      )}

      {hasOnlyExpired && (
        <span className="text-[9px] font-sans font-semibold uppercase tracking-wider text-rose-600 leading-none mt-0.5">
          Expirado
        </span>
      )}

      {hasActive && (
        <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1.5 rounded-full bg-emerald-600 text-white font-mono text-[11px] font-bold tabular-nums flex items-center justify-center shadow-sm border-2 border-white">
          {activeCount}
        </span>
      )}

      {hasOnlyExpired && (
        <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-rose-600 border-2 border-white" />
      )}
    </button>
  );
});

export const HouseGrid = memo(function HouseGrid({
  filterMode,
  onFilterModeChange,
  invitationsByHouse,
  activeInvitationsByHouse,
  selectedHouse,
  searchQuery,
  onSelectHouse,
}) {
  const activeHousesCount = activeInvitationsByHouse.size;

  const visibleHouses = useMemo(() => {
    if (filterMode === 'all') {
      return HOUSES_NUMBERS;
    }
    return HOUSES_NUMBERS.filter(
      (houseNum) => (activeInvitationsByHouse.get(houseNum) || []).length > 0
    );
  }, [filterMode, activeInvitationsByHouse]);

  const trimmedQuery = searchQuery.trim().toLowerCase();

  return (
    <section
      aria-label="Matriz de lotes residenciales"
      className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-5 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-base font-bold text-zinc-950 flex items-center gap-2 tracking-tight">
            <Building2 className="w-4 h-4 text-zinc-500" aria-hidden="true" />
            <span>Panel de Lotes Residenciales</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Selecciona un lote para revisar sus pases vigentes o expirados y autorizar el acceso.
          </p>
        </div>

        {/* Pestañas de filtro: Activas (N) / Todas (100) */}
        <div
          role="tablist"
          aria-label="Filtrar cuadrícula de lotes"
          className="inline-flex items-center p-1 rounded-xl bg-zinc-100 border border-zinc-200 self-start sm:self-auto"
        >
          <button
            type="button"
            role="tab"
            aria-selected={filterMode === 'active'}
            onClick={() => onFilterModeChange('active')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tabular-nums transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              filterMode === 'active'
                ? 'bg-zinc-950 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            Activas ({activeHousesCount})
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filterMode === 'all'}
            onClick={() => onFilterModeChange('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tabular-nums transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              filterMode === 'all'
                ? 'bg-zinc-950 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            Todas ({TOTAL_COMMUNITY_HOUSES})
          </button>
        </div>
      </div>

      {visibleHouses.length === 0 ? (
        <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50">
          <p className="text-sm font-semibold text-zinc-700">
            No hay lotes con pases activos en este momento.
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Cambia a la pestaña &quot;Todas (100)&quot; o genera un nuevo pase desde Vista Residente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2.5">
          {visibleHouses.map((houseNumber) => {
            const allForHouse = invitationsByHouse.get(houseNumber) || [];
            const activeCount = (activeInvitationsByHouse.get(houseNumber) || [])
              .length;
            const expiredCount = allForHouse.length - activeCount;

            const matchesSearch =
              !trimmedQuery ||
              String(houseNumber) === trimmedQuery ||
              allForHouse.some(
                (inv) =>
                  inv.code.includes(trimmedQuery) ||
                  inv.visitorName.toLowerCase().includes(trimmedQuery)
              );

            return (
              <HouseGridCell
                key={houseNumber}
                houseNumber={houseNumber}
                activeCount={activeCount}
                expiredCount={expiredCount}
                isSelected={selectedHouse === houseNumber}
                isDimmed={!matchesSearch}
                onSelectHouse={onSelectHouse}
              />
            );
          })}
        </div>
      )}

      {/* Leyenda Compacta */}
      <div className="mt-5 pt-4 border-t border-zinc-100 flex flex-wrap items-center gap-4 text-[11px] font-medium text-zinc-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-zinc-950 border border-indigo-500 inline-block" />
          Lote con pase activo
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-rose-50 border border-rose-300 inline-block" />
          Solo pases expirados
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-zinc-50 border border-zinc-200 inline-block" />
          Sin invitaciones
        </span>
      </div>
    </section>
  );
});
