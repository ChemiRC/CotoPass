import React, { useState, useMemo, useCallback, memo } from 'react';
import { GuardSearchBar } from './GuardSearchBar';
import { HouseGrid } from './HouseGrid';
import { HouseDetailDrawer } from './HouseDetailDrawer';
import { VerificationModal } from './VerificationModal';
import { AccessLogPanel } from './AccessLogPanel';
import { AuthorizedOverlay } from './AuthorizedOverlay';

export const GuardDashboard = memo(function GuardDashboard({
  now,
  invitationsByHouse,
  activeInvitationsByHouse,
  invitationsByPin,
  invitationsById,
  accessLog,
  metrics,
  onAuthorizeInvitation,
  onRevokeInvitation,
  onForceExpireInvitation,
  onResolveGuardSearch,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('active');
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [pendingVerificationId, setPendingVerificationId] = useState(null);
  const [expiredAlertPass, setExpiredAlertPass] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [authorizedOverlayData, setAuthorizedOverlayData] = useState(null);

  // Obtener versión en vivo del pase en verificación (reacciona si expira mientras el modal está abierto)
  const pendingVerificationPass = pendingVerificationId
    ? invitationsById.get(pendingVerificationId) || null
    : null;

  const selectedHouseInvitations = useMemo(() => {
    if (selectedHouse === null) return [];
    return invitationsByHouse.get(selectedHouse) || [];
  }, [selectedHouse, invitationsByHouse]);

  const clearAlerts = useCallback(() => {
    setSearchError('');
    setExpiredAlertPass(null);
  }, []);

  const executeAuthorization = useCallback(
    (invitation) => {
      if (!invitation) return;
      const result = onAuthorizeInvitation(invitation.id);

      if (!result.ok) {
        if (result.reason === 'expired' && result.invitation) {
          setExpiredAlertPass(result.invitation);
          setPendingVerificationId(null);
        } else {
          setSearchError('El pase ya no existe o fue revocado.');
          setPendingVerificationId(null);
        }
        return;
      }

      setAuthorizedOverlayData({
        ...result.invitation,
        overlayKey: `${result.invitation.id}-${Date.now()}`,
      });
      setPendingVerificationId(null);
      setSelectedHouse(null);
      setSearchQuery('');
      clearAlerts();
    },
    [onAuthorizeInvitation, clearAlerts]
  );

  const handleSubmitSearch = useCallback(
    (rawQuery) => {
      const resolved = onResolveGuardSearch(rawQuery);

      if (resolved.type === 'empty') {
        clearAlerts();
        return;
      }

      if (resolved.type === 'pass') {
        if (resolved.expired) {
          setExpiredAlertPass(resolved.invitation);
          setSearchError('');
          setPendingVerificationId(null);
          return;
        }
        // Paso de seguridad: abrir VerificationModal en lugar de abrir a ciegas
        setPendingVerificationId(resolved.invitation.id);
        clearAlerts();
        return;
      }

      if (resolved.type === 'house') {
        setSelectedHouse(resolved.house);
        clearAlerts();
        return;
      }

      setExpiredAlertPass(null);
      setSearchError(
        `No se encontró ningún pase o visitante coincidente con "${resolved.query}".`
      );
    },
    [onResolveGuardSearch, clearAlerts]
  );

  const handleInspectPassFromSearch = useCallback((pass) => {
    setPendingVerificationId(pass.id);
    setSearchError('');
    setExpiredAlertPass(null);
  }, []);

  const handleDismissOverlay = useCallback(() => {
    setAuthorizedOverlayData(null);
  }, []);

  const shouldFocusSearch =
    selectedHouse === null &&
    pendingVerificationPass === null &&
    authorizedOverlayData === null;

  return (
    <div className="max-w-7xl mx-auto w-full space-y-6">
      {/* Overlay full-screen 3 segundos */}
      <AuthorizedOverlay
        authorization={authorizedOverlayData}
        onDismiss={handleDismissOverlay}
      />

      {/* Modal de Verificación de Seguridad */}
      <VerificationModal
        invitation={pendingVerificationPass}
        now={now}
        onConfirm={executeAuthorization}
        onCancel={() => setPendingVerificationId(null)}
      />

      {/* Panel Superior de Comando y Telemetría */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="flex-1">
            <GuardSearchBar
              query={searchQuery}
              onQueryChange={setSearchQuery}
              onSubmitQuery={handleSubmitSearch}
              invitationsByPin={invitationsByPin}
              invitationsById={invitationsById}
              now={now}
              feedbackError={searchError}
              expiredAlertPass={expiredAlertPass}
              onInspectPass={handleInspectPassFromSearch}
              onClearAlerts={clearAlerts}
              shouldAutoFocus={shouldFocusSearch}
            />
          </div>

          {/* KPIs en Vivo */}
          <div className="grid grid-cols-3 gap-2.5 shrink-0 lg:w-auto">
            <div className="px-3.5 py-3 rounded-xl bg-zinc-50 border border-zinc-200">
              <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Pases Activos
              </p>
              <p className="text-xl font-black font-mono tabular-nums text-zinc-950 mt-0.5">
                {metrics.activePassesCount}
              </p>
            </div>

            <div className="px-3.5 py-3 rounded-xl bg-zinc-50 border border-zinc-200">
              <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Expirados
              </p>
              <p className="text-xl font-black font-mono tabular-nums text-rose-600 mt-0.5">
                {metrics.expiredPassesCount}
              </p>
            </div>

            <div className="px-3.5 py-3 rounded-xl bg-zinc-50 border border-zinc-200">
              <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Ingresos Hoy
              </p>
              <p className="text-xl font-black font-mono tabular-nums text-emerald-600 mt-0.5">
                {metrics.totalEntriesCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Matriz de Casas 1–100 con pestañas Activas (N) / Todas (100) */}
      <HouseGrid
        filterMode={filterMode}
        onFilterModeChange={setFilterMode}
        invitationsByHouse={invitationsByHouse}
        activeInvitationsByHouse={activeInvitationsByHouse}
        selectedHouse={selectedHouse}
        searchQuery={searchQuery}
        onSelectHouse={setSelectedHouse}
      />

      {/* Bitácora en Vivo */}
      <AccessLogPanel accessLog={accessLog} />

      {/* Drawer Lateral de Detalle de Casa */}
      <HouseDetailDrawer
        selectedHouse={selectedHouse}
        invitations={selectedHouseInvitations}
        now={now}
        onClose={() => setSelectedHouse(null)}
        onAuthorizePass={executeAuthorization}
        onRevokePass={onRevokeInvitation}
        onForceExpirePass={onForceExpireInvitation}
      />
    </div>
  );
});
