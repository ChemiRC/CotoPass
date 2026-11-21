import React, { useState, useMemo, useCallback, memo } from 'react';
import { HouseSelector } from './HouseSelector';
import { PassGeneratorForm } from './PassGeneratorForm';
import { AccessPassCard } from './AccessPassCard';
import { ActivePassesList } from './ActivePassesList';

export const ResidentView = memo(function ResidentView({
  activeHouse,
  onSelectHouse,
  now,
  invitationsByHouse,
  activeInvitationsByHouse,
  invitationsById,
  onCreateInvitation,
  onRevokeInvitation,
  onForceExpireInvitation,
  onSwitchToGuard,
}) {
  const [selectedPassId, setSelectedPassId] = useState(null);

  const selectedPass = selectedPassId
    ? invitationsById.get(selectedPassId) || null
    : null;

  const houseInvitations = useMemo(
    () => invitationsByHouse.get(activeHouse) || [],
    [invitationsByHouse, activeHouse]
  );

  const handleSelectHouse = useCallback(
    (houseNumber) => {
      onSelectHouse(houseNumber);
      setSelectedPassId(null);
    },
    [onSelectHouse]
  );

  const handleGeneratePass = useCallback(
    (payload) => {
      const created = onCreateInvitation(payload);
      setSelectedPassId(created.id);
    },
    [onCreateInvitation]
  );

  const handleRevokePass = useCallback(
    (passId) => {
      onRevokeInvitation(passId);
      setSelectedPassId((prev) => (prev === passId ? null : prev));
    },
    [onRevokeInvitation]
  );

  return (
    <div className="max-w-[420px] mx-auto w-full">
      <div className="bg-white rounded-3xl shadow-xl shadow-zinc-900/5 border border-zinc-200 overflow-hidden">
        <HouseSelector
          activeHouse={activeHouse}
          onSelectHouse={handleSelectHouse}
          activeInvitationsByHouse={activeInvitationsByHouse}
        />

        <div className="p-6">
          {selectedPass ? (
            <AccessPassCard
              pass={selectedPass}
              now={now}
              onCloseCard={() => setSelectedPassId(null)}
              onJumpToGuard={onSwitchToGuard}
              onForceExpire={onForceExpireInvitation}
            />
          ) : (
            <PassGeneratorForm
              activeHouse={activeHouse}
              onGeneratePass={handleGeneratePass}
            />
          )}

          <ActivePassesList
            house={activeHouse}
            invitations={houseInvitations}
            now={now}
            selectedPassId={selectedPassId}
            onInspectPass={setSelectedPassId}
            onRevokePass={handleRevokePass}
            onForceExpire={onForceExpireInvitation}
          />
        </div>
      </div>
    </div>
  );
});
