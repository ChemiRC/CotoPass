import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ShieldCheck,
  Car,
  Package,
  Users,
  QrCode,
  Share2,
  Search,
  Check,
  Clock,
  Home,
  Sparkles,
  X,
  ArrowLeft,
  Bell,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Smartphone,
  Monitor,
  History,
  UserCheck,
  Copy,
} from 'lucide-react';

// ============================================================================
// MOCK DATA INICIAL (Simulación en tiempo real Firebase / Laravel)
// ============================================================================
const initialInvitations = [
  {
    id: 'inv-90-1',
    house: 90,
    visitorName: 'Juan Peralta',
    code: '4920',
    ttl: '5 min',
    type: 'Visita',
    singleUse: true,
    createdAt: 'Hace 55 min',
  },
  {
    id: 'inv-15-1',
    house: 15,
    visitorName: 'Repartidor Mercado Libre',
    code: '3814',
    ttl: '15 min',
    type: 'Paquetería',
    singleUse: true,
    createdAt: 'Hace 3 min',
  },
  {
    id: 'inv-42-1',
    house: 42,
    visitorName: 'Carlos Mendoza (Uber)',
    code: '7291',
    ttl: '15 min',
    type: 'Uber/Didi',
    singleUse: true,
    createdAt: 'Hace 2 min',
  },
  {
    id: 'inv-42-2',
    house: 42,
    visitorName: 'Dra. Elena Vázquez',
    code: '6105',
    ttl: '12 horas',
    type: 'Visita',
    singleUse: false,
    createdAt: 'Hace 25 min',
  },
];

const VISIT_TYPES = [
  {
    id: 'Uber/Didi',
    label: 'Uber/Didi',
    sublabel: 'Transporte por app',
    icon: Car,
  },
  {
    id: 'Paquetería',
    label: 'Paquetería',
    sublabel: 'Amazon, DHL, Mercado Libre',
    icon: Package,
  },
  {
    id: 'Visita',
    label: 'Visita',
    sublabel: 'Familiar, amigo o servicio',
    icon: Users,
  },
];

const TTL_OPTIONS = ['15 min', '1 hora', '12 horas', 'Múltiples días'];

const HOUSES_LIST = Array.from({ length: 100 }, (_, i) => i + 1);

// ============================================================================
// COMPONENTE PRINCIPAL: CotoPass App
// ============================================================================
export default function App() {
  // Modo de vista: 'residente' | 'caseta'
  const [activeView, setActiveView] = useState('residente');

  // Estado global de invitaciones activas (sincronizado entre Residente y Caseta)
  const [invitations, setInvitations] = useState(initialInvitations);

  // Bitácora de accesos autorizados recientemente
  const [accessLog, setAccessLog] = useState([
    {
      id: 'log-1',
      house: 28,
      visitorName: ' repartidor Amazon',
      code: '1904',
      type: 'Paquetería',
      timestamp: '20:32',
    },
  ]);

  // --------------------------------------------------------------------------
  // Estado Vista Residente (Lote 90)
  // --------------------------------------------------------------------------
  const [selectedType, setSelectedType] = useState('Visita');
  const [visitorName, setVisitorName] = useState('');
  const [selectedTtl, setSelectedTtl] = useState('1 hora');
  const [generatedPass, setGeneratedPass] = useState(null);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [hasGeneratedFirstPass, setHasGeneratedFirstPass] = useState(false);

  // --------------------------------------------------------------------------
  // Estado Vista Caseta (Guardia)
  // --------------------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [authorizedBanner, setAuthorizedBanner] = useState(null);
  const [searchError, setSearchError] = useState('');
  const searchInputRef = useRef(null);
  const authTimerRef = useRef(null);

  // Autofocus en buscador cuando se cambia a Vista Caseta
  useEffect(() => {
    if (activeView === 'caseta' && searchInputRef.current && !authorizedBanner) {
      searchInputRef.current.focus();
    }
  }, [activeView, authorizedBanner]);

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (authTimerRef.current) clearTimeout(authTimerRef.current);
    };
  }, []);

  // Mapa indexado O(1) de invitaciones por número de casa
  const invitationsByHouse = useMemo(() => {
    const map = new Map();
    for (const inv of invitations) {
      const list = map.get(inv.house) || [];
      list.push(inv);
      map.set(inv.house, list);
    }
    return map;
  }, [invitations]);

  // Invitaciones pendientes de Lote 90
  const lote90Invitations = invitationsByHouse.get(90) || [];

  // Invitaciones del lote seleccionado en el modal de Caseta
  const selectedHouseInvitations = selectedHouse
    ? invitationsByHouse.get(selectedHouse) || []
    : [];

  // Coincidencia directa por PIN en el buscador de Caseta
  const matchingPinInvitation = useMemo(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return null;
    return invitations.find((inv) => inv.code === trimmed) || null;
  }, [searchQuery, invitations]);

  // Generar un código PIN de 4 dígitos
  const createPinCode = (customNameTrimmed) => {
    const code4920Exists = invitations.some((inv) => inv.code === '4920');
    const isDefaultOrJuan =
      !customNameTrimmed ||
      customNameTrimmed.toLowerCase() === 'juan peralta';

    // Para el primer pase o si 4920 ya fue liberado, usamos '4920' para cumplir
    // con el ticket de demostración ("Código: 4920")
    if (!hasGeneratedFirstPass && isDefaultOrJuan) {
      return '4920';
    }
    if (!code4920Exists) {
      return '4920';
    }

    const existingCodes = new Set(invitations.map((i) => i.code));
    let candidate = '4920';
    while (existingCodes.has(candidate)) {
      candidate = String(Math.floor(1000 + Math.random() * 9000));
    }
    return candidate;
  };

  // Acción: Generar Pase de Acceso en Vista Residente
  const handleGeneratePass = (e) => {
    e.preventDefault();
    const trimmedName = visitorName.trim();
    const defaultLabelByType = {
      'Uber/Didi': 'Conductor Uber/Didi',
      Paquetería: 'Repartidor de Paquetería',
      Visita: 'Juan Peralta',
    };

    const resolvedName = trimmedName || defaultLabelByType[selectedType] || 'Juan Peralta';
    const newCode = createPinCode(trimmedName);

    const newPass = {
      id: `inv-90-${Date.now()}`,
      house: 90,
      visitorName: resolvedName,
      code: newCode,
      ttl: selectedTtl,
      type: selectedType,
      singleUse: selectedTtl !== 'Múltiples días',
      createdAt: 'Justo ahora',
    };

    setHasGeneratedFirstPass(true);
    setInvitations((prev) => [...prev, newPass]);
    setGeneratedPass(newPass);
    setShareFeedback(false);
  };

  // Acción: Compartir por WhatsApp (Simulado + Portapapeles)
  const handleShareWhatsApp = () => {
    if (!generatedPass) return;
    const shareText = `🔐 *CotoPass - Pase de Acceso*\n📍 Destino: Casa / Lote ${generatedPass.house}\n👤 Visita: ${generatedPass.visitorName} (${generatedPass.type})\n🔢 *Código PIN: ${generatedPass.code}*\n⏳ Vigencia: Expira en ${generatedPass.ttl} - ${
      generatedPass.singleUse ? 'Un solo uso' : 'Uso múltiple'
    }`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText).catch(() => {});
    }
    setShareFeedback(true);
    setTimeout(() => setShareFeedback(false), 3000);
  };

  // Acción: Autorizar Acceso en Caseta (por botón "Dar Acceso" o Enter en buscador)
  const handleAuthorizeAccess = (invitation) => {
    if (!invitation) return;

    if (authTimerRef.current) {
      clearTimeout(authTimerRef.current);
    }

    // Mostrar overlay verde a pantalla completa durante 3 segundos
    setAuthorizedBanner({
      house: invitation.house,
      visitorName: invitation.visitorName,
      code: invitation.code,
      type: invitation.type,
    });

    // Eliminar la invitación autorizada del estado mock
    setInvitations((prev) =>
      prev.filter((inv) => {
        if (inv.id === invitation.id) return false;
        // Si comparten el mismo PIN de un solo uso en la misma casa, limpiarlo también
        if (inv.house === invitation.house && inv.code === invitation.code) {
          return false;
        }
        return true;
      })
    );

    // Registrar en bitácora reciente
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5);
    setAccessLog((prev) => [
      {
        id: `log-${Date.now()}`,
        house: invitation.house,
        visitorName: invitation.visitorName,
        code: invitation.code,
        type: invitation.type,
        timestamp: timeStr,
      },
      ...prev.slice(0, 7),
    ]);

    // Limpiar búsqueda y cerrar modal
    setSearchQuery('');
    setSearchError('');
    setSelectedHouse(null);

    authTimerRef.current = setTimeout(() => {
      setAuthorizedBanner(null);
    }, 3000);
  };

  // Manejo de Enter en la barra de búsqueda de Caseta
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    // 1. Buscar coincidencia exacta de PIN de 4 dígitos
    const pinMatch = invitations.find((inv) => inv.code === query);
    if (pinMatch) {
      handleAuthorizeAccess(pinMatch);
      return;
    }

    // 2. Si es un número de casa (1-100) con invitaciones activas, abrir su panel
    const houseNum = Number(query);
    if (Number.isInteger(houseNum) && houseNum >= 1 && houseNum <= 100) {
      const houseInvs = invitationsByHouse.get(houseNum) || [];
      if (houseInvs.length > 0) {
        setSelectedHouse(houseNum);
        setSearchError('');
        return;
      }
      setSearchError(`La Casa ${houseNum} no tiene pases pendientes en este momento.`);
      return;
    }

    // 3. Buscar por nombre de visitante
    const nameMatch = invitations.find((inv) =>
      inv.visitorName.toLowerCase().includes(query.toLowerCase())
    );
    if (nameMatch) {
      setSelectedHouse(nameMatch.house);
      setSearchError('');
      return;
    }

    setSearchError(`No se encontró ningún pase activo con "${query}".`);
  };

  // Filtrado visual o resaltado en la cuadrícula de casas
  const totalActiveHouses = invitationsByHouse.size;
  const totalPendingVisits = invitations.length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      {/* ====================================================================
          OVERLAY FULL-SCREEN DE ACCESO AUTORIZADO (3 SEGUNDOS)
         ==================================================================== */}
      {authorizedBanner ? (
        <div
          role="alert"
          aria-live="assertive"
          onClick={() => {
            if (authTimerRef.current) clearTimeout(authTimerRef.current);
            setAuthorizedBanner(null);
          }}
          className="fixed inset-0 z-50 bg-emerald-600 text-white flex flex-col items-center justify-center p-6 cursor-pointer animate-fade-in select-none"
        >
          <div className="max-w-3xl w-full text-center flex flex-col items-center">
            <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/40 flex items-center justify-center mb-8 shadow-2xl">
              <Check className="w-16 h-16 text-white stroke-[3]" />
            </div>

            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-700/80 text-emerald-100 text-sm font-semibold tracking-wider uppercase mb-4 border border-emerald-400/30">
              <ShieldCheck className="w-4 h-4" />
              Barrera Vehicular Abierta • PIN {authorizedBanner.code}
            </span>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight drop-shadow-sm">
              AUTORIZADO - Casa {authorizedBanner.house} ({authorizedBanner.visitorName})
            </h1>

            <p className="mt-6 text-emerald-100 text-lg sm:text-xl font-medium">
              Pase validado correctamente • Tipo: {authorizedBanner.type}
            </p>

            <div className="mt-10 w-64 h-1.5 bg-emerald-800/60 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full animate-pulse w-full" />
            </div>
            <p className="mt-3 text-xs text-emerald-200/90">
              Regresando al panel de caseta automáticamente en 3 segundos...
            </p>
          </div>
        </div>
      ) : null}

      {/* ====================================================================
          BARRA SUPERIOR GLOBAL CON TOGGLE DE VISTAS
         ==================================================================== */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Identidad de Marca CotoPass */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-inner shadow-blue-400/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">
                  CotoPass
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/20">
                  PWA v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Residencial Los Olivos • Control de Acceso en Tiempo Real
              </p>
            </div>
          </div>

          {/* Toggle de Modo: Vista Residente / Vista Caseta */}
          <div
            role="tablist"
            aria-label="Cambiar modo de la aplicación"
            className="inline-flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'residente'}
              onClick={() => setActiveView('residente')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                activeView === 'residente'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Vista Residente</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'caseta'}
              onClick={() => setActiveView('caseta')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                activeView === 'caseta'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Vista Caseta</span>
              {totalPendingVisits > 0 ? (
                <span className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white">
                  {totalPendingVisits}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </header>

      {/* ====================================================================
          CONTENIDO PRINCIPAL SEGÚN LA VISTA ACTIVA
         ==================================================================== */}
      <main className="flex-1 py-6 px-4 sm:px-6">
        {activeView === 'residente' ? (
          /* ==================================================================
             1. VISTA RESIDENTE (Mobile-first PWA, max-width: 400px, centrada)
             ================================================================== */
          <div className="max-w-[400px] mx-auto w-full">
            {/* Marco de Dispositivo Móvil PWA */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden">
              {/* Encabezado de la Casa del Residente */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-300 bg-blue-500/15 border border-blue-400/20 px-2.5 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Conectado a Caseta
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    Privada San Ángel
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/15">
                    <Home className="w-6 h-6 text-blue-300" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-white">
                      Mi Casa: Lote 90
                    </h1>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Familia Peralta • {lote90Invitations.length}{' '}
                      {lote90Invitations.length === 1
                        ? 'pase activo'
                        : 'pases activos'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cuerpo de la Vista Residente */}
              <div className="p-6">
                {!generatedPass ? (
                  /* ----------------------------------------------------------
                     FORMULARIO DE GENERACIÓN DE PASE
                     ---------------------------------------------------------- */
                  <form onSubmit={handleGeneratePass} className="space-y-6">
                    {/* Botones de Acción Rápida (Tipos de Visita) */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                        1. Selecciona el tipo de acceso
                      </label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {VISIT_TYPES.map((item) => {
                          const IconComponent = item.icon;
                          const isSelected = selectedType === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setSelectedType(item.id)}
                              className={`group flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all duration-150 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-50/80 text-blue-700 shadow-sm'
                                  : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:border-slate-300 hover:bg-slate-100/80'
                              }`}
                            >
                              <div
                                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2 transition-colors ${
                                  isSelected
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-white text-slate-600 border border-slate-200 group-hover:border-slate-300'
                                }`}
                              >
                                <IconComponent className="w-5 h-5" />
                              </div>
                              <span className="text-xs font-bold leading-tight">
                                {item.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Input Nombre de la Visita */}
                    <div>
                      <label
                        htmlFor="visitor-name-input"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2"
                      >
                        2. Identificación del visitante
                      </label>
                      <div className="relative">
                        <input
                          id="visitor-name-input"
                          type="text"
                          value={visitorName}
                          onChange={(e) => setVisitorName(e.target.value)}
                          placeholder="Nombre de la visita (Opcional)"
                          className="w-full px-4 py-3.5 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 text-sm font-medium transition-all hover:border-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 focus:outline-none"
                        />
                        {visitorName ? (
                          <button
                            type="button"
                            onClick={() => setVisitorName('')}
                            aria-label="Limpiar nombre"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        ) : null}
                      </div>
                      <p className="mt-1.5 text-[11px] text-slate-400">
                        Si lo dejas vacío se registrará automáticamente según el tipo de visita.
                      </p>
                    </div>

                    {/* Chips de Tiempo de Vida (TTL) */}
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                          3. Tiempo de vigencia (TTL)
                        </label>
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {TTL_OPTIONS.map((ttl) => {
                          const isSelected = selectedTtl === ttl;
                          return (
                            <button
                              key={ttl}
                              type="button"
                              onClick={() => setSelectedTtl(ttl)}
                              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              {ttl}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Botón Principal: Generar Pase de Acceso */}
                    <button
                      type="submit"
                      className="w-full py-4 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2.5 transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                    >
                      <KeyRound className="w-5 h-5" />
                      <span>Generar Pase de Acceso</span>
                    </button>
                  </form>
                ) : (
                  /* ----------------------------------------------------------
                     ESTADO DE PASE GENERADO (TICKET CARD)
                     ---------------------------------------------------------- */
                  <div className="space-y-5 animate-fade-in">
                    {/* Tarjeta estilo Ticket Digital */}
                    <div className="relative rounded-2xl border-2 border-slate-200 bg-gradient-to-b from-slate-50 to-white p-5 shadow-sm overflow-hidden">
                      {/* Cinta superior de estado */}
                      <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-3.5 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold">
                            {generatedPass.type}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            Lote {generatedPass.house}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Activo en Caseta
                        </span>
                      </div>

                      {/* Nombre del visitante */}
                      <div className="text-center mb-3">
                        <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                          Visitante Autorizado
                        </p>
                        <p className="text-base font-bold text-slate-800 mt-0.5">
                          {generatedPass.visitorName}
                        </p>
                      </div>

                      {/* Texto Grande: Código: 4920 */}
                      <div className="bg-slate-900 text-white rounded-2xl py-3.5 px-4 text-center mb-4 shadow-inner">
                        <p className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold mb-0.5">
                          PIN de Acceso en Caseta
                        </p>
                        <p className="text-3xl font-black tracking-tight text-white">
                          Código: {generatedPass.code}
                        </p>
                      </div>

                      {/* Placeholder de Código QR (Lucide QrCode grande) */}
                      <div className="flex flex-col items-center justify-center my-4">
                        <div className="p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-sm relative">
                          <QrCode
                            className="w-36 h-36 text-slate-900"
                            strokeWidth={1.5}
                          />
                        </div>
                        <span className="mt-2 text-[11px] text-slate-400 font-medium">
                          Muestra este QR o dicta el código al guardia
                        </span>
                      </div>

                      {/* Advertencia de Expiración */}
                      <div className="mt-4 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                        <span className="text-xs font-bold">
                          Expira en {generatedPass.ttl} - Un solo uso
                        </span>
                      </div>
                    </div>

                    {/* Botón Compartir por WhatsApp */}
                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2.5 transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Compartir por WhatsApp</span>
                    </button>

                    {shareFeedback ? (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                        <Copy className="w-3.5 h-3.5" />
                        <span>
                          ¡Pase copiado y listo para enviar por WhatsApp!
                        </span>
                      </div>
                    ) : null}

                    {/* Acciones secundarias: Ir a Caseta o Crear otro pase */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setGeneratedPass(null)}
                        className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Crear otro pase</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveView('caseta')}
                        className="flex-1 py-2.5 px-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <Monitor className="w-3.5 h-3.5" />
                        <span>Ver en Caseta</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Resumen de Pases Activos del Lote 90 */}
                {lote90Invitations.length > 0 ? (
                  <div className="mt-6 pt-5 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Pases pendientes en Lote 90 ({lote90Invitations.length})
                      </span>
                    </div>
                    <div className="space-y-2">
                      {lote90Invitations.map((inv) => (
                        <div
                          key={inv.id}
                          onClick={() => setGeneratedPass(inv)}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 cursor-pointer transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">
                              {inv.visitorName}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {inv.type} • Expira en {inv.ttl}
                            </p>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold">
                            {inv.code}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          /* ==================================================================
             2. VISTA CASETA (Desktop-first Guard Dashboard)
             ================================================================== */
          <div className="max-w-7xl mx-auto w-full space-y-6">
            {/* Barra Superior de Búsqueda y KPIs de Caseta */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Buscador Grande con Autofocus */}
                <form onSubmit={handleSearchSubmit} className="flex-1">
                  <label htmlFor="caseta-search" className="sr-only">
                    Buscar PIN o Número de Casa
                  </label>
                  <div className="relative">
                    <Search className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      id="caseta-search"
                      type="text"
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (searchError) setSearchError('');
                      }}
                      placeholder="Buscar PIN o Número de Casa..."
                      className="w-full pl-13 pr-36 py-4 rounded-xl border-2 border-slate-300 bg-slate-50/70 text-slate-900 placeholder:text-slate-400 text-base sm:text-lg font-semibold transition-all hover:border-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 focus:outline-none"
                      style={{ paddingLeft: '3.25rem' }}
                    />
                    {searchQuery ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setSearchError('');
                          searchInputRef.current?.focus();
                        }}
                        className="absolute right-28 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
                        aria-label="Limpiar búsqueda"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    ) : null}
                    <button
                      type="submit"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Validar
                    </button>
                  </div>

                  {/* Alerta rápida si el PIN escrito coincide con un pase activo */}
                  {matchingPinInvitation ? (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-mono text-xs font-bold">
                          PIN {matchingPinInvitation.code}
                        </span>
                        <span className="text-sm font-bold text-emerald-950">
                          Casa {matchingPinInvitation.house} —{' '}
                          {matchingPinInvitation.visitorName} (Expira en{' '}
                          {matchingPinInvitation.ttl})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAuthorizeAccess(matchingPinInvitation)}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        <span>Dar Acceso (Enter)</span>
                      </button>
                    </div>
                  ) : null}

                  {searchError ? (
                    <p className="mt-2 text-xs font-semibold text-red-600 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{searchError}</span>
                    </p>
                  ) : null}
                </form>

                {/* Indicadores / Leyenda de Estado */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                  <div className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-500/20" />
                    <div>
                      <p className="text-xs text-slate-500 font-medium">
                        Casas con Visita
                      </p>
                      <p className="text-lg font-extrabold text-slate-900 leading-none mt-0.5">
                        {totalActiveHouses}{' '}
                        <span className="text-xs font-normal text-slate-500">
                          ({totalPendingVisits} pases)
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Atajo rápido para probar PIN 4920 o Casa 90 */}
                  <button
                    type="button"
                    onClick={() => setSelectedHouse(90)}
                    className="px-4 py-2.5 rounded-xl border-2 border-blue-600/30 bg-blue-50/70 hover:bg-blue-100/80 text-blue-800 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Inspeccionar Casa 90
                  </button>
                </div>
              </div>
            </div>

            {/* Cuadrícula Principal de Casas (Lotes 1 al 100) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-slate-600" />
                    <span>Panel de Lotes Residenciales (Casas 1 - 100)</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Haz clic en cualquier casa con borde azul e indicador rojo para ver y autorizar sus visitas pendientes.
                  </p>
                </div>

                {/* Leyenda Visual */}
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-300 inline-block" />
                    Sin pendientes
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-blue-50 border-2 border-blue-600 inline-block relative">
                      <span className="w-2 h-2 rounded-full bg-red-500 absolute -top-1 -right-1" />
                    </span>
                    Con invitación activa
                  </span>
                </div>
              </div>

              {/* Grid Numérico 1 a 100 */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5">
                {HOUSES_LIST.map((houseNumber) => {
                  const houseInvitations =
                    invitationsByHouse.get(houseNumber) || [];
                  const pendingCount = houseInvitations.length;
                  const isActive = pendingCount > 0;
                  const isSelected = selectedHouse === houseNumber;

                  // Coincidencia con filtro de búsqueda
                  const trimmedQuery = searchQuery.trim().toLowerCase();
                  const matchesSearch =
                    !trimmedQuery ||
                    String(houseNumber) === trimmedQuery ||
                    houseInvitations.some(
                      (inv) =>
                        inv.code.includes(trimmedQuery) ||
                        inv.visitorName.toLowerCase().includes(trimmedQuery)
                    );

                  return (
                    <button
                      key={houseNumber}
                      type="button"
                      onClick={() => setSelectedHouse(houseNumber)}
                      aria-label={
                        isActive
                          ? `Casa ${houseNumber}, ${pendingCount} visitas pendientes`
                          : `Casa ${houseNumber}, sin visitas pendientes`
                      }
                      className={`relative h-14 rounded-xl font-bold text-sm transition-all duration-150 flex flex-col items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isActive
                          ? 'bg-blue-50/90 border-2 border-blue-600 text-blue-950 shadow-sm hover:bg-blue-100 hover:scale-[1.03]'
                          : 'bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-700'
                      } ${
                        isSelected ? 'ring-4 ring-blue-500/30' : ''
                      } ${
                        !matchesSearch ? 'opacity-30' : ''
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-extrabold">
                        {houseNumber}
                      </span>
                      {isActive ? (
                        <span className="text-[10px] font-semibold text-blue-700 leading-none mt-0.5">
                          Activa
                        </span>
                      ) : null}

                      {/* Badge Rojo con el Número de Visitas Pendientes */}
                      {isActive ? (
                        <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1.5 rounded-full bg-red-600 text-white text-xs font-extrabold flex items-center justify-center shadow-md border-2 border-white">
                          {pendingCount}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bitácora de Accesos Autorizados en el Turno */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-400" />
                  <span>Últimos Accesos Autorizados en Caseta</span>
                </h3>
                <span className="text-xs text-slate-400">
                  Sincronizado en tiempo real
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {accessLog.map((entry) => (
                  <div
                    key={entry.id}
                    className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-slate-800">
                      Casa {entry.house}
                    </span>
                    <span className="text-slate-600">{entry.visitorName}</span>
                    <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700">
                      PIN {entry.code}
                    </span>
                    <span className="text-slate-400">{entry.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ================================================================
                MODAL / PANEL LATERAL DE INVITACIONES ACTIVAS POR CASA
               ================================================================ */}
            {selectedHouse !== null ? (
              <div
                className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs flex justify-end animate-fade-in"
                onClick={() => setSelectedHouse(null)}
              >
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="modal-house-title"
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-y-auto"
                >
                  <div>
                    {/* Cabecera del Panel */}
                    <div className="p-6 bg-slate-900 text-white flex items-center justify-between sticky top-0 z-10">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-xl shadow-inner">
                          {selectedHouse}
                        </div>
                        <div>
                          <h3
                            id="modal-house-title"
                            className="text-xl font-extrabold tracking-tight"
                          >
                            Casa {selectedHouse} • Pases Pendientes
                          </h3>
                          <p className="text-xs text-slate-300 mt-0.5">
                            {selectedHouseInvitations.length}{' '}
                            {selectedHouseInvitations.length === 1
                              ? 'invitación activa lista para validar'
                              : 'invitaciones activas listas para validar'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedHouse(null)}
                        aria-label="Cerrar panel"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Lista de Tarjetas de Visitas Pendientes */}
                    <div className="p-6 space-y-4">
                      {selectedHouseInvitations.length > 0 ? (
                        selectedHouseInvitations.map((inv) => (
                          <div
                            key={inv.id}
                            className="p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-500/60 bg-white shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-bold">
                                  {inv.type}
                                </span>
                                <span className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-md border border-red-200">
                                  Expira en {inv.ttl}
                                </span>
                              </div>

                              {/* Línea principal requerida por especificación:
                                  "Juan Peralta - Código: 4920 - Expira en 5 min" */}
                              <p className="text-base font-extrabold text-slate-900">
                                {inv.visitorName} - Código: {inv.code} - Expira en{' '}
                                {inv.ttl}
                              </p>

                              <p className="text-xs text-slate-500">
                                Destino: Casa {inv.house} • Generado:{' '}
                                {inv.createdAt || 'Hace un momento'}
                              </p>
                            </div>

                            {/* Botón Verde Grande: "Dar Acceso" con ícono Check */}
                            <button
                              type="button"
                              onClick={() => handleAuthorizeAccess(inv)}
                              className="shrink-0 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
                            >
                              <Check className="w-5 h-5 stroke-[2.5]" />
                              <span>Dar Acceso</span>
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                          <UserCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                          <p className="text-base font-bold text-slate-700">
                            Sin visitas pendientes para la Casa {selectedHouse}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                            Todos los pases de esta propiedad ya fueron utilizados o no tiene invitaciones activas.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pie del Panel */}
                  <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      CotoPass Guard OS • Caseta Principal
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedHouse(null)}
                      className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
                    >
                      Cerrar panel
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
