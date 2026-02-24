# Plataforma de Álbumes Digitales para Proveedores (Resellers)

## 1) Objetivo
Crear una app web con **2 niveles de acceso (Admin y Proveedor/Cliente)** para controlar créditos de álbumes digitales, solicitudes por evento y entrega, con una experiencia visual moderna, responsive (móvil/laptop) y sin flujos dependientes de popups.

---

## 2) Roles y permisos

## 2.1 Admin
Puede:
- Crear, editar y desactivar proveedores.
- Sumar o restar créditos a cada proveedor.
- Ver historial de movimientos de créditos.
- Atender solicitudes de álbumes.
- Cambiar etapa de solicitudes tipo CRM: **Solicitud → En proceso → Entregado**.
- Filtrar solicitudes por proveedor, estado y rango de fechas.
- Crear links personalizados por evento para captura directa del cliente final.
- Ver credenciales/perfil de proveedor (incluye posibilidad de resetear contraseña).

## 2.2 Proveedor (Cliente reseller)
Puede:
- Ver dashboard con:
  - saludo personalizado por nombre,
  - créditos disponibles,
  - solicitudes en cada estado,
  - últimos movimientos.
- Solicitar nuevos créditos (ticket de recarga).
- Crear solicitud de álbumes (consumiendo créditos).
- Crear links personalizados para que su cliente final complete formulario.
- Cambiar su contraseña.

Restricción:
- No puede modificar créditos directamente.
- Solo ve su propia información, eventos y solicitudes.

---

## 3) Reglas de negocio clave

1. **Consumo de créditos**
   - Cada álbum solicitado descuenta 1 crédito (parametrizable en el futuro).
   - Si no hay créditos suficientes, no se permite crear solicitud.

2. **Control de disponibilidad**
   - Créditos disponibles = Créditos cargados − Créditos consumidos + Ajustes.
   - Toda alteración de crédito debe generar un movimiento auditable.

3. **Solicitudes de álbumes**
   - Estados válidos: `solicitud`, `en_proceso`, `entregado`.
   - Solo Admin puede mover a `entregado`.
   - Se debe registrar fecha/hora por cada cambio de estado.

4. **Links por evento**
   - Cada link pertenece a un proveedor y a un evento.
   - Debe permitir branding: nombre de negocio + logo.
   - El formulario del cliente final crea una solicitud asociada automáticamente.

5. **Seguridad**
   - Autenticación con email + contraseña hasheada.
   - Control por roles (RBAC).
   - Auditoría de acciones sensibles (créditos, cambios de estado, edición de links).

---

## 4) Módulos funcionales

## 4.1 Autenticación
- Login limpio y moderno.
- Recuperación/reset de contraseña (sin popup, en páginas dedicadas).
- Cierre de sesión.

## 4.2 Dashboard Admin
- KPIs: proveedores activos, créditos totales, solicitudes por estado.
- Tabla de solicitudes con filtros avanzados.
- Acciones rápidas: crear proveedor, ajustar crédito, cambiar estado.

## 4.3 Gestión de proveedores (Admin)
- Alta/edición/baja lógica.
- Vista de detalle:
  - datos de contacto,
  - créditos actuales,
  - historial de movimientos,
  - solicitudes por estado,
  - links creados.

## 4.4 Gestión de créditos
- Tipos de movimiento:
  - `recarga` (suma),
  - `ajuste_manual` (+/-),
  - `consumo` (resta automática por solicitud),
  - `devolucion` (opcional).
- Cada movimiento guarda: usuario actor, motivo, fecha.

## 4.5 Solicitudes de álbumes
- Formulario para proveedor:
  - nombre de evento,
  - cantidad de álbumes,
  - fecha requerida,
  - observaciones.
- Valida disponibilidad en tiempo real.
- Timeline de estado.

## 4.6 Links personalizados por evento
- Generación de URL única segura (`token`).
- Parametrización visual:
  - nombre comercial,
  - logo,
  - colores base (opcional).
- Form público responsive.

## 4.7 Perfil proveedor
- Cambiar contraseña.
- Ver datos de cuenta.
- Botón “Solicitar más créditos” (crea ticket interno para Admin).

---

## 5) Diseño UX/UI

Lineamientos:
- Estética moderna (cards, tipografía limpia, alto contraste).
- Navegación por sidebar en desktop + bottom/compact nav en móvil.
- Sin popups obligatorios para procesos críticos.
- Formularios en vistas dedicadas, con validaciones inline.
- Componentes responsive (breakpoints mobile/tablet/desktop).
- Modo claro por defecto (oscuro opcional).

---

## 6) Modelo de datos (alto nivel)

- `users` (admin/proveedor)
- `providers` (perfil comercial)
- `credit_movements`
- `album_requests`
- `request_status_history`
- `event_links`
- `public_form_submissions`
- `credit_recharge_requests`
- `audit_logs`

---

## 7) Flujo principal de negocio

1. Admin crea proveedor y asigna créditos iniciales.
2. Proveedor inicia sesión y visualiza sus créditos.
3. Proveedor crea solicitud de álbumes o comparte link del evento.
4. Cada solicitud válida descuenta créditos automáticamente.
5. Admin procesa solicitudes y cambia estado hasta entregado.
6. Proveedor solicita recarga si se queda sin créditos.
7. Admin aprueba y aplica recarga.

---

## 8) Roadmap sugerido (MVP)

### Fase 1 (MVP)
- Login + roles.
- Dashboard básico Admin y Proveedor.
- Gestión de proveedores.
- Motor de créditos (sumar/restar/consumir).
- Solicitudes de álbumes + estados CRM.

### Fase 2
- Links personalizados por evento.
- Formulario público de cliente final.
- Historial completo y exportación CSV.

### Fase 3
- Métricas avanzadas, notificaciones por email/WhatsApp, branding extendido.

---

## 9) Criterios de aceptación mínimos

- Admin puede crear proveedor y ajustar créditos.
- Proveedor ve créditos en tiempo real.
- No se permiten solicitudes sin créditos suficientes.
- Solicitudes recorren estados definidos con trazabilidad.
- Link de evento funciona con branding y genera solicitud asociada.
- Interfaz usable en móvil y laptop sin popups bloqueantes.
