# Arquitectura del Sistema ZooMAT QR

## Visión General

El Sistema de Información Interactivo para el ZooMAT es una aplicación web full-stack que permite a los visitantes acceder a información científica detallada sobre las especies del zoológico mediante códigos QR dinámicos. La arquitectura sigue principios de desacoplamiento, reactividad y escalabilidad.

## Capas de la Arquitectura

### 1. Presentación (Frontend)

**Stack Tecnológico:**
- React 18.3 con TypeScript
- Vite 6.3 (bundler y dev server)
- Tailwind CSS 4.1 (estilos)
- Radix UI (componentes accesibles)
- React Router 7 (navegación SPA)

**Características:**
- Interfaz responsiva (mobile-first)
- Modo oscuro con next-themes
- Internacionalización (i18n) - Español/Inglés
- Componentes accesibles (WCAG 2.1 AA)
- Lazy loading de imágenes y contenido multimedia

**Estructura de Componentes:**
```
src/
├── components/
│   ├── ui/                    # Componentes Radix UI primitivos
│   ├── AudioPlayer.tsx        # Reproductor de audio accesible
│   ├── ScientificInfo.tsx     # Visualización de datos científicos
│   ├── ThreatsList.tsx        # Lista de amenazas
│   ├── AccessibilityPanel.tsx # Panel de preferencias
│   ├── AnimalInfoPanel.tsx    # Panel principal de especie (modal)
│   ├── AnimalCard.tsx         # Tarjeta de especie en grid
│   ├── Navbar.tsx             # Navegación
│   └── ...
├── pages/
│   ├── Home.tsx
│   ├── Species.tsx            # Detalle de especie
│   ├── Admin.tsx
│   └── ...
├── contexts/
│   ├── AnimalContext.tsx      # Estado global de animales
│   ├── LanguageContext.tsx    # Estado de idioma
│   ├── AccessibilityContext.tsx # Preferencias de accesibilidad
│   └── SiteContext.tsx        # Contenido del sitio
└── utils/
    └── analytics.ts           # Tracking de visitas
```

### 2. API Gateway (Backend)

**Stack Tecnológico:**
- Node.js (runtime)
- Express 5.2 (framework web)
- PostgreSQL con pg driver (base de datos)
- CORS habilitado para acceso cross-origin
- JWT para autenticación admin (opcional)

**Estructura:**
```
server/
├── app.js                  # Configuración de Express
├── index.js                # Entry point
├── config/
│   ├── db.js              # Conexión a PostgreSQL
│   └── env.js             # Variables de entorno
├── routes/
│   ├── speciesRoutes.js   # CRUD de especies
│   ├── analyticsRoutes.js # Endpoints de analytics
│   ├── siteRoutes.js      # Contenido del sitio
│   └── adminRoutes.js     # Admin
└── db/
    ├── init.sql           # Schema de BD
    └── seed.sql           # Datos de ejemplo
```

**Flujo de Solicitud:**
```
Cliente HTTP
    ↓
Express Router
    ↓
Request Middleware (CORS, JSON parser)
    ↓
Route Handler (validación, lógica)
    ↓
Query Builder (PostgreSQL)
    ↓
Database
    ↓
Response Formatter
    ↓
Response Middleware (headers, status)
    ↓
Cliente HTTP
```

### 3. Persistencia de Datos (Base de Datos)

**Stack:**
- PostgreSQL 12+
- JSONB para datos flexibles
- Índices para optimización

**Tablas Principales:**

#### species
```sql
- id SERIAL PRIMARY KEY
- name VARCHAR(100) -- Nombre común
- slug VARCHAR(100) UNIQUE -- URL-friendly
- species_name VARCHAR(100) -- Nombre científico
- description TEXT -- Descripción detallada
- image_url VARCHAR(500) -- URL de imagen principal
- audio_description_url VARCHAR(500) -- Audio descriptivo
- scientific_classification JSONB -- Taxonomía completa
- conservation_iucn VARCHAR(5) -- Código IUCN
- threats JSONB -- Array de amenazas
- ecosystem_role TEXT -- Rol en ecosistema
- habitat, diet, lifespan, size, weight, activity, distribution VARCHAR
- created_at, updated_at TIMESTAMP
```

#### species_visits
```sql
- id SERIAL PRIMARY KEY
- species_id INTEGER FK → species(id)
- visitor_id VARCHAR(100) -- ID anónimo del visitante
- visitor_language VARCHAR(5) -- 'es', 'en', etc.
- timestamp TIMESTAMP -- Cuándo visitó
- duration_seconds INTEGER -- Cuánto tiempo gastó
- accessed_via VARCHAR(50) -- 'qr', 'direct', 'link'
- ip_hash VARCHAR(64) -- IP hasheada (privacidad)
- user_agent_hash VARCHAR(64) -- User agent hasheado
```

**Índices de Performance:**
- `species(slug)` - búsqueda rápida por slug
- `species_visits(species_id)` - queries de analytics
- `species_visits(species_id, visitor_language)` - segmentación de idiomas
- `species_visits(timestamp)` - queries por rango de fecha

## Flujos Principales

### Flujo 1: Visitante escanea QR

```
Usuario                QR Code          Frontend           Backend        Base Datos
  |                      |                 |                |              |
  +---scan QR code------→|                 |                |              |
  |                      |                 |                |              |
  |                      +--redirige----→ Species.tsx      |              |
  |                                        |                |              |
  |                                        +--GET /api/species/{id}-------→|
  |                                        |                |              |
  |                                        |                ← SELECT *-----|
  |                                        |                |              |
  |                      ← render---------+                |              |
  |                      |                 |                |              |
  +--leyendo---→         |                 |                |              |
  |                      |                 +--POST /api/analytics/{id}/visit
  |                      |                 |                |              |
  |                      |                 |                +--INSERT-----→|
  |                      |                 |                |              |
```

### Flujo 2: Admin ve estadísticas

```
Admin                 Frontend          Backend           Base Datos
  |                     |                  |               |
  +--login----------→   |                  |               |
  |                     |                  |               |
  +--click stats----→   |                  |               |
  |                     +--GET /api/analytics/{id}/analytics
  |                     |                  |               |
  |                     |                  +--SELECT COUNT, AVG, etc.-----→|
  |                     |                  |               |
  |                     |                  ← aggregations-|
  |                     |                  |               |
  |                  ← render----+         |               |
  |                     |                  |               |
```

### Flujo 3: Admin crea nueva especie

```
Admin               Frontend              Backend        Base Datos
  |                   |                    |               |
  +--admin panel--→   |                    |               |
  |                   |                    |               |
  +--fill form----→   |                    |               |
  |                   |                    |               |
  +--submit-------→   |                    |               |
  |                   +--POST /api/species (with x-admin-key)
  |                   |                    |               |
  |                   |                    +--INSERT-------→|
  |                   |                    |               |
  |                   |                    ← created--------|
  |                   |                    |               |
  |                ← success message---+   |               |
  |                   |                    |               |
```

## Seguridad

### Autenticación Admin
- Header `x-admin-key` requerido para endpoints protegidos
- Comparación de strings timing-safe (en implementación futura)
- No se transmite por URL para evitar logs

### Privacidad del Visitante
- IPs hasheadas (no se almacena IP en texto plano)
- User agents hasheados
- Visitor IDs no vinculados a información personal
- No se usan cookies de seguimiento

### CORS
- Configurable por variable de entorno
- Protege contra requests desde dominios desconocidos
- Permite acceso cross-origin controlado

## Escalabilidad

### Horizontal Scaling
- Backend stateless (sin sesiones en memoria)
- Cada instancia puede servir cualquier request
- Load balancer frente a múltiples Express instances

### Base de Datos
- Índices en columnas consultadas frecuentemente
- Particionamiento de `species_visits` por rango de fechas (en el futuro)
- Read replicas para analytics queries

### Caching
- IndexedDB en cliente para datos de especies
- Caché HTTP con headers `Cache-Control`
- Redis (opcional) para caché de sessions y queries frecuentes

## Monitoreo

### Frontend
- Sentry/LogRocket (opcional) para error tracking
- Analytics custom para user behavior
- Performance monitoring (Core Web Vitals)

### Backend
- Logs estructurados (JSON format)
- Métricas de Prometheus (opcional)
- APM con New Relic/Datadog (opcional)

### Base de Datos
- Query performance logs
- Connection pool monitoring
- Backup automático

## Despliegue

### Desarrollo
```bash
npm install
npm run dev              # Inicia Vite + Express concurrentemente
```

### Producción
```bash
npm run build            # Vite empaqueta frontend
npm start                # Express sirve frontend estático + API
```

**Stack de Hosting:**
- Frontend: Vercel/Netlify (estático) o CDN
- Backend: Heroku/Railway/Fly.io (Node.js)
- Base de Datos: Managed PostgreSQL (AWS RDS, Supabase, etc.)

## Patrones Arquitectónicos

### 1. Separación de Responsabilidades
- **UI Components**: Presentación pura
- **Context Providers**: Estado global y business logic
- **API Routes**: Lógica de backend y validación
- **Database Layer**: Persistencia

### 2. Data Hydration Strategy
```
IndexedDB (offline cache)
    ↓ (fallback)
localStorage (legacy)
    ↓ (fallback)
API call (server of truth)
    ↓ (fallback)
Static JSON file (published)
```

### 3. Reactive Data Flow
- React context provee datos
- Componentes suscritos al contexto
- Cambios en BD → actualizar contexto → re-render

### 4. Async Operations
- Fire-and-forget para analytics (no bloquea UI)
- Debouncing para evitar requests duplicados
- Fallback chain para resilience

## Métricas Clave

### Performance
- **FCP (First Contentful Paint)**: < 1.5s
- **LCP (Largest Contentful Paint)**: < 2.5s
- **CLS (Cumulative Layout Shift)**: < 0.1
- **API Response Time**: < 200ms p95

### Usabilidad
- **Mobile Responsiveness**: 100% (375px - 1920px)
- **Accessibility**: WCAG 2.1 AA
- **Load Time**: < 2s en 4G

### Business
- **Visit Recording Rate**: > 95% de visitas registradas
- **Analytics Accuracy**: ±5%
- **Data Freshness**: < 5 segundos de latencia

## Roadmap Futuro

- [ ] Push notifications para actualizaciones de especies
- [ ] Integración con CONABIO API para datos actualizados
- [ ] Modo offline mejorado
- [ ] Soporte para múltiples idiomas (5+)
- [ ] Admin dashboard con gráficos interactivos
- [ ] ML-powered recomendaciones de especies
- [ ] Gamification (badges, challenges)
- [ ] Integración con redes sociales
