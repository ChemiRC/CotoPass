import React, { useState, memo } from 'react';
import { Car, Package, Users, Clock, KeyRound, X } from 'lucide-react';
import { VISIT_TYPES, TTL_OPTIONS } from '../../data/mockData';

const VISIT_ICONS = {
  'Uber/Didi': Car,
  Paquetería: Package,
  Visita: Users,
};

export const PassGeneratorForm = memo(function PassGeneratorForm({
  activeHouse,
  onGeneratePass,
}) {
  const [selectedType, setSelectedType] = useState('Visita');
  const [visitorName, setVisitorName] = useState('');
  const [selectedTtlId, setSelectedTtlId] = useState('1 hora');

  const handleSubmit = (e) => {
    e.preventDefault();
    onGeneratePass({
      house: activeHouse,
      visitorName,
      type: selectedType,
      ttlId: selectedTtlId,
    });
    setVisitorName('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 1. Tipo de Visita */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span
            id="visit-type-label"
            className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-500"
          >
            1. Tipo de Acceso
          </span>
          <span className="text-[11px] text-zinc-400">Lote {activeHouse}</span>
        </div>

        <div
          role="radiogroup"
          aria-labelledby="visit-type-label"
          className="grid grid-cols-3 gap-2.5"
        >
          {VISIT_TYPES.map((item) => {
            const Icon = VISIT_ICONS[item.id] || Users;
            const isChecked = selectedType === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={isChecked}
                onClick={() => setSelectedType(item.id)}
                className={`group flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all duration-150 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isChecked
                    ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 ring-1 ring-indigo-600 shadow-sm'
                    : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-100'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-colors ${
                    isChecked
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-zinc-700 border border-zinc-200 group-hover:border-zinc-300'
                  }`}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="text-xs font-bold tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Nombre del Visitante */}
      <div>
        <label
          htmlFor="resident-visitor-name"
          className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-500 mb-2"
        >
          2. Nombre del Visitante
        </label>
        <div className="relative">
          <input
            id="resident-visitor-name"
            type="text"
            value={visitorName}
            onChange={(e) => setVisitorName(e.target.value)}
            placeholder="Nombre de la visita (Opcional)"
            className="w-full px-4 py-3.5 pr-10 rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-950 placeholder:text-zinc-400 text-sm font-medium transition-all hover:border-zinc-300 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/15 focus:outline-none"
          />
          {visitorName && (
            <button
              type="button"
              onClick={() => setVisitorName('')}
              aria-label="Limpiar nombre del visitante"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Vigencia (TTL Chips) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span
            id="ttl-selector-label"
            className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-500"
          >
            3. Vigencia del Pase (TTL)
          </span>
          <Clock className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
        </div>

        <div
          role="radiogroup"
          aria-labelledby="ttl-selector-label"
          className="grid grid-cols-2 gap-2"
        >
          {TTL_OPTIONS.map((option) => {
            const isSelected = selectedTtlId === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelectedTtlId(option.id)}
                className={`px-3.5 py-2.5 rounded-xl border text-left transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isSelected
                    ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm'
                    : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{option.label}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSelected ? 'bg-indigo-400' : 'bg-zinc-300'
                    }`}
                  />
                </div>
                <p
                  className={`text-[10px] mt-0.5 ${
                    isSelected ? 'text-zinc-400' : 'text-zinc-500'
                  }`}
                >
                  {option.singleUse ? 'Un solo uso' : 'Uso múltiple (72 h)'}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. CTA Principal */}
      <button
        type="submit"
        className="w-full py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
      >
        <KeyRound className="w-4 h-4" aria-hidden="true" />
        <span>Generar Pase de Acceso</span>
      </button>
    </form>
  );
});
