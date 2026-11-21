import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  TTL_OPTIONS,
  VISIT_TYPES,
  createInitialInvitations,
  createInitialAccessLog,
} from '../data/mockData';
import {
  generateUniquePin,
  isPassExpired,
  parseGuardInput,
} from '../utils/passUtils';

/**
 * Hook principal de estado en tiempo real para CotoPass.
 * Simula la sincronización reactiva Laravel API + Firebase Realtime DB/Firestore
 * con expiración automática segundo a segundo.
 */
export function useInvitations() {
  const [invitations, setInvitations] = useState(() =>
    createInitialInvitations()
  );
  const [accessLog, setAccessLog] = useState(() => createInitialAccessLog());
  const [now, setNow] = useState(() => Date.now());

  // Ref para operaciones atómicas libres de closures obsoletos
  const invitationsRef = useRef(invitations);
  invitationsRef.current = invitations;

  // Reloj en tiempo real (1s) que actualiza contadores y expira pases vencidos
  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentNow = Date.now();
      setNow(currentNow);

      setInvitations((prev) => {
        let hasTransition = false;
        const next = prev.map((item) => {
          if (item.status === 'active' && currentNow >= item.expiresAt) {
            hasTransition = true;
            return { ...item, status: 'expired' };
          }
          return item;
        });
        return hasTransition ? next : prev;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Índices memoizados O(1) para evitar cálculos repetitivos en renders
  const {
    activeInvitations,
    expiredInvitations,
    invitationsByHouse,
    activeInvitationsByHouse,
    invitationsByPin,
    invitationsById,
  } = useMemo(() => {
    const active = [];
    const expired = [];
    const byHouse = new Map();
    const activeByHouse = new Map();
    const byPin = new Map();
    const byId = new Map();

    for (const inv of invitations) {
      const expiredFlag = isPassExpired(inv, now);
      const normalized =
        expiredFlag && inv.status !== 'expired'
          ? { ...inv, status: 'expired' }
          : inv;

      byId.set(normalized.id, normalized);

      if (expiredFlag) {
        expired.push(normalized);
      } else {
        active.push(normalized);
        const houseActives = activeByHouse.get(normalized.house);
        if (houseActives) {
          houseActives.push(normalized);
        } else {
          activeByHouse.set(normalized.house, [normalized]);
        }
      }

      const houseList = byHouse.get(normalized.house);
      if (houseList) {
        houseList.push(normalized);
      } else {
        byHouse.set(normalized.house, [normalized]);
      }

      // Priorizar pase activo si existiera coincidencia histórica por PIN
      const existingPin = byPin.get(normalized.code);
      if (!existingPin || (existingPin.status === 'expired' && !expiredFlag)) {
        byPin.set(normalized.code, normalized);
      }
    }

    // Ordenar pases por casa: activos primero (más próximos a expirar arriba), luego expirados
    for (const [house, list] of byHouse.entries()) {
      list.sort((a, b) => {
        if (a.status !== b.status) {
          return a.status === 'active' ? -1 : 1;
        }
        return a.expiresAt - b.expiresAt;
      });
      byHouse.set(house, list);
    }

    return {
      activeInvitations: active,
      expiredInvitations: expired,
      invitationsByHouse: byHouse,
      activeInvitationsByHouse: activeByHouse,
      invitationsByPin: byPin,
      invitationsById: byId,
    };
  }, [invitations, now]);

  const metrics = useMemo(
    () => ({
      activePassesCount: activeInvitations.length,
      activeHousesCount: activeInvitationsByHouse.size,
      expiredPassesCount: expiredInvitations.length,
      totalEntriesCount: accessLog.length,
    }),
    [
      activeInvitations.length,
      activeInvitationsByHouse.size,
      expiredInvitations.length,
      accessLog.length,
    ]
  );

  // Crear nueva invitación garantizando PIN único sin colisiones
  const createInvitation = useCallback(({ house, visitorName, type, ttlId }) => {
    const currentNow = Date.now();
    const visitTypeConfig =
      VISIT_TYPES.find((item) => item.id === type) || VISIT_TYPES[2];
    const ttlConfig =
      TTL_OPTIONS.find((item) => item.id === ttlId) || TTL_OPTIONS[1];

    const usedCodes = new Set(invitationsRef.current.map((item) => item.code));
    const pinCode = generateUniquePin(usedCodes);

    const trimmedVisitor = (visitorName || '').trim();
    const resolvedVisitor = trimmedVisitor || visitTypeConfig.defaultVisitorName;

    const newPass = {
      id: `inv-${house}-${currentNow}-${pinCode}`,
      house: Number(house),
      visitorName: resolvedVisitor,
      code: pinCode,
      type: visitTypeConfig.id,
      ttlLabel: ttlConfig.label,
      singleUse: ttlConfig.singleUse,
      usesCount: 0,
      status: 'active',
      createdAt: currentNow,
      expiresAt: currentNow + ttlConfig.durationMs,
      lastUsedAt: null,
    };

    setInvitations((prev) => [newPass, ...prev]);
    return newPass;
  }, []);

  /**
   * Autorizar pase en caseta:
   * - Si el pase está expirado: rechaza con error explícito.
   * - Si es `singleUse: true`: lo consume (elimina de activos) y registra en bitácora.
   * - Si es `singleUse: false` (Múltiples días): se mantiene activo, incrementa `usesCount` y registra en bitácora.
   */
  const authorizeInvitation = useCallback((invitationId) => {
    const currentNow = Date.now();
    const target = invitationsRef.current.find(
      (item) => item.id === invitationId
    );

    if (!target) {
      return { ok: false, reason: 'not_found' };
    }

    if (isPassExpired(target, currentNow)) {
      setInvitations((prev) =>
        prev.map((item) =>
          item.id === target.id ? { ...item, status: 'expired' } : item
        )
      );
      return { ok: false, reason: 'expired', invitation: { ...target, status: 'expired' } };
    }

    const nextUsesCount = (target.usesCount || 0) + 1;

    if (target.singleUse) {
      setInvitations((prev) => prev.filter((item) => item.id !== target.id));
    } else {
      setInvitations((prev) =>
        prev.map((item) =>
          item.id === target.id
            ? {
                ...item,
                usesCount: nextUsesCount,
                lastUsedAt: currentNow,
              }
            : item
        )
      );
    }

    const logEntry = {
      id: `log-${currentNow}-${target.code}`,
      house: target.house,
      visitorName: target.visitorName,
      type: target.type,
      code: target.code,
      singleUse: target.singleUse,
      useNumber: nextUsesCount,
      timestamp: currentNow,
    };

    setAccessLog((prev) => [logEntry, ...prev]);

    return {
      ok: true,
      invitation: {
        ...target,
        usesCount: nextUsesCount,
        lastUsedAt: currentNow,
      },
      entry: logEntry,
    };
  }, []);

  // Revocar manualmente un pase (Residente o limpieza de expirados)
  const revokeInvitation = useCallback((invitationId) => {
    setInvitations((prev) => prev.filter((item) => item.id !== invitationId));
  }, []);

  // Helper de demostración: forzar expiración inmediata de un pase activo
  const forceExpireInvitation = useCallback((invitationId) => {
    const expiredTimestamp = Date.now() - 1000;
    setInvitations((prev) =>
      prev.map((item) =>
        item.id === invitationId
          ? { ...item, status: 'expired', expiresAt: expiredTimestamp }
          : item
      )
    );
  }, []);

  // Resolución inteligente de búsqueda en Caseta (QR / PIN / Lote / Visitante)
  const resolveGuardSearch = useCallback(
    (rawQuery) => {
      const parsed = parseGuardInput(rawQuery);
      if (parsed.kind === 'empty') {
        return { type: 'empty' };
      }

      if (parsed.kind === 'qr') {
        const match =
          invitationsById.get(parsed.id) || invitationsByPin.get(parsed.pin);
        if (!match) {
          return {
            type: 'not_found',
            query: `QR (PIN ${parsed.pin})`,
          };
        }
        return {
          type: 'pass',
          invitation: match,
          expired: isPassExpired(match, now),
          source: 'qr',
        };
      }

      if (parsed.kind === 'pin') {
        const match = invitationsByPin.get(parsed.pin);
        if (!match) {
          return {
            type: 'not_found',
            query: `PIN ${parsed.pin}`,
          };
        }
        return {
          type: 'pass',
          invitation: match,
          expired: isPassExpired(match, now),
          source: 'pin',
        };
      }

      if (parsed.kind === 'house') {
        return {
          type: 'house',
          house: parsed.house,
        };
      }

      const activeTextMatch = activeInvitations.find((item) =>
        item.visitorName.toLowerCase().includes(parsed.query)
      );
      if (activeTextMatch) {
        return {
          type: 'house',
          house: activeTextMatch.house,
        };
      }

      const expiredTextMatch = expiredInvitations.find((item) =>
        item.visitorName.toLowerCase().includes(parsed.query)
      );
      if (expiredTextMatch) {
        return {
          type: 'pass',
          invitation: expiredTextMatch,
          expired: true,
          source: 'text',
        };
      }

      return {
        type: 'not_found',
        query: parsed.raw,
      };
    },
    [
      invitationsById,
      invitationsByPin,
      activeInvitations,
      expiredInvitations,
      now,
    ]
  );

  return {
    now,
    invitations,
    activeInvitations,
    expiredInvitations,
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
  };
}
