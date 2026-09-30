# API Documentation - ZooMAT QR System

## Base URL

```
https://api.zoomat.example.com/api
```

Or for local development:

```
http://localhost:4000/api
```

## Authentication

Most endpoints are public. Admin endpoints require the `x-admin-key` header:

```http
x-admin-key: your-admin-key-here
```

---

## Endpoints

### Health Check

**GET** `/api/health`

Check if the API and database are operational.

**Response (200 OK):**
```json
{
  "status": "ok",
  "database": "connected"
}
```

**Response (503 Service Unavailable):**
```json
{
  "status": "error",
  "database": "disconnected"
}
```

---

### Species

#### Get All Species

**GET** `/api/species`

Retrieve all species with full scientific data.

**Response (200 OK):**
```json
[
  {
    "id": "1",
    "slug": "leon-africano",
    "name": "León Africano",
    "species": "Panthera leo",
    "habitat": "Sabana africana",
    "imageUrl": "https://...",
    "conservation": "Vulnerable",
    "conservationIucn": "VU",
    "description": "El león africano es...",
    "diet": "Carnívoro",
    "lifespan": "10-14 años",
    "activity": "Nocturno",
    "size": "1.7-2.5 metros",
    "weight": "150-250 kg",
    "distribution": "África subsahariana",
    "audioDescriptionUrl": "https://example.com/audio/leon.mp3",
    "scientificClassification": {
      "kingdom": "Animalia",
      "phylum": "Chordata",
      "class": "Mammalia",
      "order": "Carnivora",
      "family": "Felidae",
      "genus": "Panthera",
      "species": "P. leo"
    },
    "threats": [
      {
        "threat": "Pérdida de hábitat",
        "severity": "alta"
      },
      {
        "threat": "Caza de represalia",
        "severity": "alta"
      }
    ],
    "ecosystemRole": "Depredador tope que regula...",
    "updatedAt": "2026-05-06T10:30:00Z"
  }
]
```

#### Get Species by ID or Slug

**GET** `/api/species/{idOrSlug}`

Get detailed information for a specific species. Can use numeric ID or slug.

**Parameters:**
- `idOrSlug` (string, required): Species ID or slug (e.g., `1` or `leon-africano`)

**Response (200 OK):**
```json
{
  "id": "1",
  "slug": "leon-africano",
  "name": "León Africano",
  ... (same fields as above)
}
```

**Response (404 Not Found):**
```json
{
  "message": "Species not found"
}
```

#### Create Species

**POST** `/api/species`

Create a new species record. Requires admin authentication.

**Headers:**
```http
x-admin-key: your-admin-key
Content-Type: application/json
```

**Request Body:**
```json
{
  "slug": "nueva-especie",
  "name": "Nueva Especie",
  "species": "Species scientificName",
  "habitat": "Habitat description",
  "imageUrl": "https://...",
  "conservation": "Vulnerable",
  "conservationIucn": "VU",
  "description": "Description...",
  "diet": "Carnívoro",
  "lifespan": "XX años",
  "activity": "Nocturno",
  "size": "X metros",
  "weight": "X kg",
  "distribution": "Geographic distribution",
  "audioDescriptionUrl": "https://example.com/audio.mp3",
  "scientificClassification": {
    "kingdom": "Animalia",
    "phylum": "Chordata",
    "class": "Mammalia",
    "order": "Order",
    "family": "Family",
    "genus": "Genus",
    "species": "species"
  },
  "threats": [
    {
      "threat": "Threat name",
      "severity": "alta|media|baja|crítica"
    }
  ],
  "ecosystemRole": "Description of ecosystem role"
}
```

**Response (201 Created):**
Returns the created species object with all fields.

**Response (400 Bad Request):**
```json
{
  "message": "Missing required fields: slug, name, species"
}
```

**Response (409 Conflict):**
```json
{
  "message": "Species slug already exists"
}
```

#### Update Species

**PUT** `/api/species/{id}`

Update an existing species. All fields are optional. Requires admin authentication.

**Headers:**
```http
x-admin-key: your-admin-key
Content-Type: application/json
```

**Parameters:**
- `id` (integer, required): Species ID

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "audioDescriptionUrl": "https://...",
  ... (any field can be updated)
}
```

**Response (200 OK):**
Returns the updated species object.

**Response (404 Not Found):**
```json
{
  "message": "Species not found"
}
```

#### Delete Species

**DELETE** `/api/species/{id}`

Delete a species and all associated visit records. Requires admin authentication.

**Headers:**
```http
x-admin-key: your-admin-key
```

**Parameters:**
- `id` (integer, required): Species ID

**Response (200 OK):**
```json
{
  "message": "Species deleted successfully",
  "id": "1"
}
```

**Response (404 Not Found):**
```json
{
  "message": "Species not found"
}
```

---

### Analytics

#### Record a Species Visit

**POST** `/api/analytics/{speciesId}/visit`

Record an anonymous visit to a species page. No authentication required.

**Parameters:**
- `speciesId` (integer, required): Species ID

**Request Body:**
```json
{
  "visitorId": "visitor-abc123xyz",
  "language": "es",
  "durationSeconds": 45,
  "accessedVia": "qr"
}
```

**Response (201 Created):**
```json
{
  "message": "Visit recorded successfully"
}
```

#### Get Species Analytics

**GET** `/api/analytics/{speciesId}/analytics`

Get detailed analytics for a specific species. Requires admin authentication.

**Headers:**
```http
x-admin-key: your-admin-key
```

**Parameters:**
- `speciesId` (integer, required): Species ID

**Response (200 OK):**
```json
{
  "speciesId": 1,
  "speciesName": "León Africano",
  "totalVisits": 1250,
  "uniqueVisitors": 845,
  "visitsByLanguage": {
    "es": 1050,
    "en": 200
  },
  "averageDuration": 45,
  "maxDuration": 300,
  "minDuration": 5,
  "accessMethods": {
    "qr": 900,
    "direct": 350
  },
  "hourlyData": [
    {
      "hour": "2026-05-06T18:00:00Z",
      "visits": 45
    }
  ],
  "recentVisits": [
    {
      "timestamp": "2026-05-06T19:30:00Z",
      "visitor_language": "es",
      "duration_seconds": 65,
      "accessed_via": "qr"
    }
  ],
  "generatedAt": "2026-05-06T20:00:00Z"
}
```

**Response (404 Not Found):**
```json
{
  "message": "Species not found"
}
```

#### Get All Species Analytics Summary

**GET** `/api/analytics/all/summary`

Get a summary of analytics for all species. Requires admin authentication.

**Headers:**
```http
x-admin-key: your-admin-key
```

**Response (200 OK):**
```json
{
  "summary": [
    {
      "speciesId": 1,
      "speciesName": "León Africano",
      "totalVisits": 1250,
      "uniqueVisitors": 845,
      "averageDuration": 45
    },
    {
      "speciesId": 2,
      "speciesName": "Elefante Africano",
      "totalVisits": 980,
      "uniqueVisitors": 720,
      "averageDuration": 52
    }
  ],
  "generatedAt": "2026-05-06T20:00:00Z"
}
```

---

## Error Handling

All error responses follow this format:

```json
{
  "message": "Error description"
}
```

**HTTP Status Codes:**

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

---

## IUCN Conservation Status Codes

| Code | Label | Description |
|------|-------|-------------|
| EX | Extinto | Sin poblaciones vivas conocidas |
| EW | Extinto en Estado Silvestre | Solo sobrevive en cautividad |
| CR | En Peligro Crítico | Riesgo extremo de extinción |
| EN | En Peligro | Riesgo alto de extinción |
| VU | Vulnerable | Riesgo moderado de extinción |
| NT | Casi Amenazado | Cercano a criterios de amenaza |
| LC | Preocupación Menor | Bajo riesgo de extinción |
| DD | Datos Insuficientes | Información disponible limitada |

---

## Threat Severity Levels

| Level | Meaning |
|-------|---------|
| crítica | Amenaza inmediata y extrema |
| alta | Amenaza significativa |
| media | Amenaza moderada |
| baja | Amenaza menor |

---

## Rate Limiting

- **General endpoints**: 100 requests/minute per IP
- **Analytics endpoints**: 10 requests/minute per IP (to prevent spam)
- **Admin endpoints**: 30 requests/minute per API key

---

## Example Workflows

### Workflow 1: Display Species Information with QR

1. User scans QR code
2. QR links to `/especie/{speciesId}`
3. Frontend fetches `GET /api/species/{speciesId}`
4. Frontend displays all scientific information
5. Frontend records visit with `POST /api/analytics/{speciesId}/visit`

### Workflow 2: Admin Viewing Analytics

1. Admin logs in and provides API key
2. Admin requests `GET /api/analytics/{speciesId}/analytics`
3. Frontend displays visitor statistics, popular times, language distribution
4. Admin can make decisions about content based on usage patterns

### Workflow 3: Creating New Species Record

1. Admin provides species data (name, classification, threats, etc.)
2. Frontend sends `POST /api/species` with admin key
3. Backend validates and stores in database
4. QR codes are generated for the new species
5. Physical QR codes are printed and installed in zoo

---

## Data Validation Rules

### Species Fields

- `slug`: Must be unique, lowercase, alphanumeric with hyphens
- `name`: Required, non-empty string
- `species`: Required (scientific name), non-empty string
- `conservation_iucn`: Must be one of: EX, EW, CR, EN, VU, NT, LC, DD
- `threats`: Array of objects with `threat` (string) and `severity` (string)
- `scientific_classification`: JSON object with standard taxonomy levels

### Visit Records

- `language`: ISO 639-1 code (e.g., 'es', 'en')
- `durationSeconds`: Must be non-negative integer
- `accessedVia`: Suggested values: 'qr', 'direct', 'link'

---

## Implementation Notes

- All timestamps are in ISO 8601 format (UTC)
- Visitor IDs are anonymous and derived from browser fingerprinting
- Database uses PostgreSQL with JSONB for flexible field structures
- All API responses include CORS headers for cross-origin access
