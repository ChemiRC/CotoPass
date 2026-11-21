# CotoPass — Control de Acceso Residencial (PWA)

Mockup interactivo de alta fidelidad para el control de acceso de fraccionamientos y comunidades privadas, diseñado con **React 18**, **Vite**, **Tailwind CSS v3**, **Lucide React** y códigos QR escaneables mediante **qrcode.react**.

## Funcionalidades Principales

- **Vista Residente (Mobile-First / Estilo Apple Wallet)**
  - Selector interactivo de casa/lote (`Lote 90`, `Lote 42`, `Lote 15`, `Lote 7`, `Lote 63` o cualquier lote `1–100`).
  - Generación de pases por categoría (`Uber/Didi`, `Paquetería`, `Visita`) y vigencia real (`15 min`, `1 hora`, `12 horas`, `Múltiples días`).
  - Códigos PIN numéricos de 4 dígitos garantizados sin colisiones y **QR real escaneable** (`COTOPASS|H:<casa>|P:<pin>|ID:<id>`).
  - Contadores regresivos en vivo segundo a segundo, modalidad dinámica (`Un solo uso` vs. `Uso múltiple`) y envío vía Web Share API / WhatsApp.
  - Lista persistente de pases activos y expirados del lote seleccionado con opción de ver QR, simular expiración o revocar.

- **Vista Caseta (Desktop Command Center / Estilo Linear & Verkada)**
  - Buscador con `autoFocus` compatible con PIN, número de lote, nombre de visitante o lectura directa de QR desde escáner USB HID.
  - Modal de **Verificación de Seguridad** antes de abrir la barrera (`Enter` confirma, `Esc` cancela) y bloqueo estricto ante códigos expirados.
  - Matriz de lotes `1–100` con pestañas **`Activas (N)`** y **`Todas (100)`**.
  - Soporte real de pases multi-uso (`Múltiples días` permanece activo e incrementa `usesCount`) y bitácora cronológica de accesos en vivo.
  - Alerta de autorización a pantalla completa de 3 segundos con barra de progreso animada y cierre inmediato por clic, `Enter` o `Esc`.

## Arquitectura del Proyecto

```text
public/
  icon.svg
  manifest.json
src/
  data/mockData.js
  utils/passUtils.js
  hooks/useInvitations.js
  components/
    TopNavbar.jsx
    resident/
      ResidentView.jsx
      HouseSelector.jsx
      PassGeneratorForm.jsx
      AccessPassCard.jsx
      ActivePassesList.jsx
    guard/
      GuardDashboard.jsx
      GuardSearchBar.jsx
      HouseGrid.jsx
      HouseDetailDrawer.jsx
      VerificationModal.jsx
      AccessLogPanel.jsx
      AuthorizedOverlay.jsx
  App.jsx
  index.css
  main.jsx
```

## Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```
