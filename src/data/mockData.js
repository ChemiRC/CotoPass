export const TOTAL_COMMUNITY_HOUSES = 100;

export const HOUSES_NUMBERS = Array.from(
  { length: TOTAL_COMMUNITY_HOUSES },
  (_, index) => index + 1
);

export const COMMUNITY_NAME = 'Residencial Los Olivos';

export const RESIDENT_HOUSES = [
  {
    house: 90,
    label: 'Lote 90',
    street: 'Privada San Ángel #90',
    familyName: 'Familia Herrera Delgado',
  },
  {
    house: 42,
    label: 'Lote 42',
    street: 'Circuito Central #42',
    familyName: 'Familia Vázquez Morales',
  },
  {
    house: 15,
    label: 'Lote 15',
    street: 'Paseo de los Olivos #15',
    familyName: 'Familia Navarro Ortiz',
  },
  {
    house: 7,
    label: 'Lote 7',
    street: 'Cerrada del Bosque #7',
    familyName: 'Familia Castellanos Ruiz',
  },
  {
    house: 63,
    label: 'Lote 63',
    street: 'Av. Mirador Norte #63',
    familyName: 'Familia Esquivel Luna',
  },
];

export const RESIDENT_HOUSES_MAP = new Map(
  RESIDENT_HOUSES.map((item) => [item.house, item])
);

export function getHouseProfile(houseNumber) {
  const num = Number(houseNumber);
  return (
    RESIDENT_HOUSES_MAP.get(num) || {
      house: num,
      label: `Lote ${num}`,
      street: `Circuito Residencial #${num}`,
      familyName: `Residente Lote ${num}`,
    }
  );
}

export const VISIT_TYPES = [
  {
    id: 'Uber/Didi',
    label: 'Uber/Didi',
    description: 'Transporte por app',
    defaultVisitorName: 'Conductor Uber/Didi',
  },
  {
    id: 'Paquetería',
    label: 'Paquetería',
    description: 'Amazon, DHL, ML',
    defaultVisitorName: 'Repartidor de Paquetería',
  },
  {
    id: 'Visita',
    label: 'Visita',
    description: 'Familiar o proveedor',
    defaultVisitorName: 'Visitante General',
  },
];

export const TTL_OPTIONS = [
  {
    id: '15 min',
    label: '15 min',
    durationMs: 15 * 60 * 1000,
    singleUse: true,
  },
  {
    id: '1 hora',
    label: '1 hora',
    durationMs: 60 * 60 * 1000,
    singleUse: true,
  },
  {
    id: '12 horas',
    label: '12 horas',
    durationMs: 12 * 60 * 60 * 1000,
    singleUse: true,
  },
  {
    id: 'Múltiples días',
    label: 'Múltiples días',
    durationMs: 72 * 60 * 60 * 1000,
    singleUse: false,
  },
];

export function createInitialInvitations(now = Date.now()) {
  const MINUTE = 60 * 1000;
  const HOUR = 60 * MINUTE;

  return [
    {
      id: 'inv-90-101',
      house: 90,
      visitorName: 'Juan Peralta',
      code: '4920',
      type: 'Visita',
      ttlLabel: '1 hora',
      singleUse: true,
      usesCount: 0,
      status: 'active',
      createdAt: now - 56 * MINUTE,
      expiresAt: now + 4 * MINUTE,
      lastUsedAt: null,
    },
    {
      id: 'inv-90-102',
      house: 90,
      visitorName: 'Arq. Mariana Salgado',
      code: '8142',
      type: 'Visita',
      ttlLabel: 'Múltiples días',
      singleUse: false,
      usesCount: 1,
      status: 'active',
      createdAt: now - 24 * HOUR,
      expiresAt: now + 48 * HOUR,
      lastUsedAt: now - 3 * HOUR,
    },
    {
      id: 'inv-15-201',
      house: 15,
      visitorName: 'Repartidor Mercado Libre',
      code: '3814',
      type: 'Paquetería',
      ttlLabel: '15 min',
      singleUse: true,
      usesCount: 0,
      status: 'active',
      createdAt: now - 4 * MINUTE,
      expiresAt: now + 11 * MINUTE,
      lastUsedAt: null,
    },
    {
      id: 'inv-42-301',
      house: 42,
      visitorName: 'Carlos Mendoza (Didi)',
      code: '7291',
      type: 'Uber/Didi',
      ttlLabel: '15 min',
      singleUse: true,
      usesCount: 0,
      status: 'active',
      createdAt: now - 2 * MINUTE,
      expiresAt: now + 13 * MINUTE,
      lastUsedAt: null,
    },
    {
      id: 'inv-42-302',
      house: 42,
      visitorName: 'Dra. Sofía Domínguez',
      code: '6105',
      type: 'Visita',
      ttlLabel: '12 horas',
      singleUse: true,
      usesCount: 0,
      status: 'active',
      createdAt: now - 35 * MINUTE,
      expiresAt: now + 11 * HOUR + 25 * MINUTE,
      lastUsedAt: null,
    },
    {
      id: 'inv-63-401',
      house: 63,
      visitorName: 'Ing. Alejandro Reyes',
      code: '2485',
      type: 'Visita',
      ttlLabel: '1 hora',
      singleUse: true,
      usesCount: 0,
      status: 'active',
      createdAt: now - 15 * MINUTE,
      expiresAt: now + 45 * MINUTE,
      lastUsedAt: null,
    },
    {
      id: 'inv-07-501',
      house: 7,
      visitorName: 'Mensajería Estafeta',
      code: '9031',
      type: 'Paquetería',
      ttlLabel: '15 min',
      singleUse: true,
      usesCount: 0,
      status: 'expired',
      createdAt: now - 27 * MINUTE,
      expiresAt: now - 12 * MINUTE,
      lastUsedAt: null,
    },
    {
      id: 'inv-63-402',
      house: 63,
      visitorName: 'Técnico Totalplay',
      code: '5510',
      type: 'Visita',
      ttlLabel: '1 hora',
      singleUse: true,
      usesCount: 0,
      status: 'expired',
      createdAt: now - 85 * MINUTE,
      expiresAt: now - 25 * MINUTE,
      lastUsedAt: null,
    },
  ];
}

export function createInitialAccessLog(now = Date.now()) {
  const MINUTE = 60 * 1000;
  return [
    {
      id: 'log-seed-1',
      house: 28,
      visitorName: 'Logística Amazon Prime',
      type: 'Paquetería',
      code: '1904',
      singleUse: true,
      useNumber: 1,
      timestamp: now - 14 * MINUTE,
    },
    {
      id: 'log-seed-2',
      house: 90,
      visitorName: 'Arq. Mariana Salgado',
      type: 'Visita',
      code: '8142',
      singleUse: false,
      useNumber: 1,
      timestamp: now - 180 * MINUTE,
    },
    {
      id: 'log-seed-3',
      house: 64,
      visitorName: 'Lic. Roberto Solís',
      type: 'Visita',
      code: '5512',
      singleUse: true,
      useNumber: 1,
      timestamp: now - 230 * MINUTE,
    },
  ];
}
