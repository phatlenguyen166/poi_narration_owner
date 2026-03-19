# POI Narration Owner

React + Vite owner console for the current owner slice.

## What Works Today

- Login with seeded owner credentials or register a new owner
- Dashboard summary
- Stall CRUD
- POI CRUD
- Save multilingual POI content
- Upload images and audio assets
- Submit stalls for approval
- View QR data
- View stall and global analytics

The app talks to the backend through `VITE_API_BASE_URL` and defaults to `http://localhost:8080`.

## Seeded Login

- `owner@poi.local`
- `Owner@123`

## Run Locally

Use Node 20.19+ or 22.12+ for Vite 7.

```bash
npm install
VITE_API_BASE_URL=http://localhost:8080 npm run dev -- --host 0.0.0.0 --port 5173
```

Open `http://localhost:5173`.

## Build

```bash
npm run build
```

## Backend APIs Used

- `POST /api/v1/auth/owner/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/auth/me`
- `GET /api/v1/owner/dashboard`
- `GET /api/v1/owner/stalls`
- `POST /api/v1/owner/stalls`
- `PUT /api/v1/owner/stalls/{stallId}`
- `DELETE /api/v1/owner/stalls/{stallId}`
- `POST /api/v1/owner/stalls/{stallId}/pois`
- `GET /api/v1/owner/pois/{poiId}`
- `PUT /api/v1/owner/pois/{poiId}`
- `DELETE /api/v1/owner/pois/{poiId}`
- `PUT /api/v1/owner/pois/{poiId}/contents`
- `POST /api/v1/uploads/images`
- `POST /api/v1/uploads/audio/pois/{poiId}`
- `POST /api/v1/owner/stalls/{stallId}/submit-approval`
- `GET /api/v1/owner/stalls/{stallId}/qr`
- `GET /api/v1/owner/stalls/{stallId}/analytics`
