import React, { useState, useCallback } from 'react';
import { useInvitations } from './hooks/useInvitations';
import { TopNavbar } from './components/TopNavbar';
import { ResidentView } from './components/resident/ResidentView';
import { GuardDashboard } from './components/guard/GuardDashboard';

export default function App() {
  const [activeView, setActiveView] = useState('residente');
  const [activeResidentHouse, setActiveResidentHouse] = useState(90);

  const {
    now,
    invitationsByHouse,
    activeInvitationsByHouse,
    invitationsByPin,
    invitationsById,
    accessLog,
    metrics,
    createInvitation,
    authorizeInvitation,
    revokeInvitation,
    forceExpireInvitation,
    resolveGuardSearch,
  } = useInvitations();

  const handleSwitchToGuard = useCallback(() => {
    setActiveView('caseta');
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 flex flex-col antialiased selection:bg-indigo-600 selection:text-white">
      <TopNavbar
        activeView={activeView}
        onSelectView={setActiveView}
        activePassesCount={metrics.activePassesCount}
        activeResidentHouse={activeResidentHouse}
      />

      <main className="flex-1 py-6 sm:py-8 px-4 sm:px-6">
        {activeView === 'residente' ? (
          <ResidentView
            activeHouse={activeResidentHouse}
            onSelectHouse={setActiveResidentHouse}
            now={now}
            invitationsByHouse={invitationsByHouse}
            activeInvitationsByHouse={activeInvitationsByHouse}
            invitationsById={invitationsById}
            onCreateInvitation={createInvitation}
            onRevokeInvitation={revokeInvitation}
            onForceExpireInvitation={forceExpireInvitation}
            onSwitchToGuard={handleSwitchToGuard}
          />
        ) : (
          <GuardDashboard
            now={now}
            invitationsByHouse={invitationsByHouse}
            activeInvitationsByHouse={activeInvitationsByHouse}
            invitationsByPin={invitationsByPin}
            invitationsById={invitationsById}
            accessLog={accessLog}
            metrics={metrics}
            onAuthorizeInvitation={authorizeInvitation}
            onRevokeInvitation={revokeInvitation}
            onForceExpireInvitation={forceExpireInvitation}
            onResolveGuardSearch={resolveGuardSearch}
          />
        )}
      </main>
    </div>
  );
}
