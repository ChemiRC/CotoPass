import React, { useState, useMemo, memo } from 'react';
import { Home, ChevronDown, X, Check } from 'lucide-react';
import {
  RESIDENT_HOUSES,
  TOTAL_COMMUNITY_HOUSES,
  getHouseProfile,
} from '../../data/mockData';

export const HouseSelector = memo(function HouseSelector({
  activeHouse,
  onSelectHouse,
  activeInvitationsByHouse,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [customHouseInput, setCustomHouseInput] = useState('');
  const [inputError, setInputError] = useState('');

  const currentProfile = useMemo(
    () => getHouseProfile(activeHouse),
    [activeHouse]
  );

  const activeCountForHouse = (activeInvitationsByHouse.get(activeHouse) || [])
    .length;

  const handleChooseHouse = (houseNum) => {
    onSelectHouse(Number(houseNum));
    setIsOpen(false);
    setCustomHouseInput('');
    setInputError('');
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const parsed = Number(customHouseInput.trim());
    if (
      !Number.isInteger(parsed) ||
      parsed < 1 ||
      parsed > TOTAL_COMMUNITY_HOUSES
    ) {
      setInputError(`Ingresa un número entre 1 y ${TOTAL_COMMUNITY_HOUSES}.`);
      return;
    }
    handleChooseHouse(parsed);
  };

  return (
    <div className="relative">
      <div className="bg-zinc-950 text-white p-6">
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-zinc-300 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Acceso Residente
          </span>

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-label="Cambiar casa o lote activo"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600/20 hover:bg-indigo-600/35 text-indigo-200 border border-indigo-500/30 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <span>Cambiar Lote</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-150 ${
                isOpen ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
              <Home className="w-6 h-6 text-indigo-400" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white tabular-nums truncate">
                Mi Casa: Lote {activeHouse}
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5 truncate">
                {currentProfile.familyName} • {currentProfile.street}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <span className="inline-block px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-xs font-semibold tabular-nums text-zinc-200">
              {activeCountForHouse}{' '}
              {activeCountForHouse === 1 ? 'activo' : 'activos'}
            </span>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="bg-zinc-900 text-zinc-100 border-b border-zinc-800 p-4 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Cambiar Propiedad (Lotes 1–{TOTAL_COMMUNITY_HOUSES})
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar selector de lotes"
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {RESIDENT_HOUSES.map((item) => {
              const count = (activeInvitationsByHouse.get(item.house) || [])
                .length;
              const isSelected = item.house === activeHouse;
              return (
                <button
                  key={item.house}
                  type="button"
                  onClick={() => handleChooseHouse(item.house)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-zinc-800/70 hover:bg-zinc-800 text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono font-bold tabular-nums">
                      {item.label}
                    </span>
                    <span
                      className={`truncate ${
                        isSelected ? 'text-indigo-100' : 'text-zinc-400'
                      }`}
                    >
                      {item.familyName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`font-mono text-[11px] tabular-nums px-2 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-indigo-700 text-white'
                          : 'bg-zinc-950 text-zinc-400'
                      }`}
                    >
                      {count} activos
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleCustomSubmit} className="space-y-1.5 pt-1">
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                max={TOTAL_COMMUNITY_HOUSES}
                value={customHouseInput}
                onChange={(e) => {
                  setCustomHouseInput(e.target.value);
                  if (inputError) setInputError('');
                }}
                placeholder="Otro lote (ej. 25)"
                aria-label="Escribir número de lote del 1 al 100"
                className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs font-mono tabular-nums text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Seleccionar
              </button>
            </div>
            {inputError && (
              <p className="text-[11px] text-rose-400 font-medium">
                {inputError}
              </p>
            )}
          </form>
        </div>
      )}
    </div>
  );
});
