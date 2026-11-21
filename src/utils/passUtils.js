import { COMMUNITY_NAME, TOTAL_COMMUNITY_HOUSES } from '../data/mockData';

const QR_PAYLOAD_REGEX =
  /^COTOPASS\|H:(\d{1,3})\|P:(\d{4})\|ID:([A-Za-z0-9_-]+)$/i;
const PIN_REGEX = /^\d{4}$/;
const HOUSE_REGEX = /^\d{1,3}$/;

/**
 * Genera un PIN numérico de 4 dígitos (1000–9999) garantizado sin colisiones
 * contra los códigos actualmente existentes.
 */
export function generateUniquePin(existingCodesSet) {
  const blocked = existingCodesSet instanceof Set ? existingCodesSet : new Set();

  const randomFourDigit = () => {
    if (
      typeof crypto !== 'undefined' &&
      typeof crypto.getRandomValues === 'function'
    ) {
      const buffer = new Uint32Array(1);
      crypto.getRandomValues(buffer);
      return String(1000 + (buffer[0] % 9000));
    }
    return String(1000 + Math.floor(Math.random() * 9000));
  };

  for (let attempt = 0; attempt < 500; attempt += 1) {
    const candidate = randomFourDigit();
    if (!blocked.has(candidate)) {
      return candidate;
    }
  }

  // Fallback lineal exhaustivo en el caso teórico de alta saturación
  for (let code = 1000; code <= 9999; code += 1) {
    const str = String(code);
    if (!blocked.has(str)) {
      return str;
    }
  }

  throw new Error('No hay códigos PIN disponibles en el rango 1000-9999.');
}

/**
 * Construye el payload estructurado que codifica el QR escaneable.
 * Ejemplo: COTOPASS|H:90|P:4920|ID:inv-90-101
 */
export function buildQrPayload(invitation) {
  if (!invitation) return '';
  return `COTOPASS|H:${invitation.house}|P:${invitation.code}|ID:${invitation.id}`;
}

/**
 * Interpreta la entrada del guardia en la barra de búsqueda:
 * - Payload QR completo desde escáner USB HID o pegado manual
 * - PIN de 4 dígitos
 * - Número de casa (1–100)
 * - Texto libre para buscar por nombre de visitante
 */
export function parseGuardInput(rawInput) {
  const value = (rawInput || '').trim();
  if (!value) {
    return { kind: 'empty', raw: '' };
  }

  const qrMatch = value.match(QR_PAYLOAD_REGEX);
  if (qrMatch) {
    return {
      kind: 'qr',
      raw: value,
      house: Number(qrMatch[1]),
      pin: qrMatch[2],
      id: qrMatch[3],
    };
  }

  if (PIN_REGEX.test(value)) {
    return {
      kind: 'pin',
      raw: value,
      pin: value,
    };
  }

  if (HOUSE_REGEX.test(value)) {
    const parsedHouse = Number(value);
    if (parsedHouse >= 1 && parsedHouse <= TOTAL_COMMUNITY_HOUSES) {
      return {
        kind: 'house',
        raw: value,
        house: parsedHouse,
      };
    }
  }

  return {
    kind: 'text',
    raw: value,
    query: value.toLowerCase(),
  };
}

export function getRemainingMs(expiresAt, now = Date.now()) {
  return Math.max(0, expiresAt - now);
}

export function isPassExpired(invitation, now = Date.now()) {
  if (!invitation) return true;
  return invitation.status === 'expired' || now >= invitation.expiresAt;
}

export function isExpiringSoon(invitation, now = Date.now()) {
  if (!invitation || isPassExpired(invitation, now)) return false;
  const remaining = getRemainingMs(invitation.expiresAt, now);
  return remaining > 0 && remaining <= 5 * 60 * 1000;
}

/**
 * Formatea milisegundos restantes en formato tabular claro:
 * - Menor a 1 hora -> mm:ss (ej. 04:58)
 * - Entre 1 y 24 horas -> hh:mm:ss (ej. 11:24:09)
 * - Mayor o igual a 24 horas -> Xd hh:mm (ej. 2d 23h 59m)
 */
export function formatCountdown(remainingMs) {
  if (remainingMs <= 0) return '00:00';

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n) => String(n).padStart(2, '0');

  if (days >= 1) {
    return `${days}d ${pad(hours)}h ${pad(minutes)}m`;
  }
  if (hours >= 1) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function formatClockTime(timestamp) {
  if (!timestamp) return '--:--';
  return new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(timestamp));
}

export function formatRelativeTime(timestamp, now = Date.now()) {
  const diffSeconds = Math.max(0, Math.floor((now - timestamp) / 1000));
  if (diffSeconds < 45) return 'Justo ahora';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Hace ${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  return `Hace ${diffDays} d`;
}

/**
 * Construye el texto oficial para compartir por Web Share API / WhatsApp,
 * sincronizado con el tipo de uso (singleUse) y vigencia real.
 */
export function buildWhatsAppMessage(invitation, now = Date.now()) {
  const usageLabel = invitation.singleUse ? 'Un solo uso' : 'Uso múltiple';
  const remaining = formatCountdown(getRemainingMs(invitation.expiresAt, now));
  const qrPayload = buildQrPayload(invitation);

  return [
    `🔐 *CotoPass — Pase de Acceso*`,
    `🏘️ ${COMMUNITY_NAME}`,
    `📍 Destino: Casa / Lote ${invitation.house}`,
    `👤 Visitante: ${invitation.visitorName} (${invitation.type})`,
    `🔢 *Código PIN: ${invitation.code}*`,
    `⏳ Vigencia: ${invitation.ttlLabel} (Restante: ${remaining})`,
    `🎟️ Modalidad: ${usageLabel}`,
    `📲 Código de lectura: ${qrPayload}`,
  ].join('\n');
}
