# 🌿 Ayush Connect Backend API

Dedicated REST API server for the Ayush Connect Academia × Industry platform.

## 🚀 Getting Started

### 1. Installation
Run inside the `server/` directory:
```bash
npm install
```
Or from the root directory:
```bash
npm install
```

### 2. Running the Server
```bash
# Start server on http://localhost:5001
node index.js

# Or using hot reload (Node 18+)
node --watch index.js
```

---

## 📡 API Endpoints

### Health Check
- **`GET /api/health`**
  - Response: `{ status: "ok", message: "Ayush Connect API is active and running", timestamp: "..." }`

### User Data
- **`GET /api/user-data`**
  - Fetches the saved state (student profile, test results, selected keywords, applications, mentor bookings).
- **`POST /api/user-data`**
  - Updates full user profile and states.

### Student Actions
- **`POST /api/keywords`**
  - Body: `{ "keywords": ["GMP & Schedule T Compliance", "Pharmacognosy & Raw Material Testing", "Formulation R&D & Pharmaceutics"] }`
  - Saves student-selected industry keywords (min 3 validation).
- **`POST /api/assessments`**
  - Body: `{ "type": "foundation" | "specialization", "result": { "percent": 100, "answers": [...] } }`
  - Persists competency test diagnostics.
- **`POST /api/applications`**
  - Body: `{ "jobId": "...", "role": "...", "company": "..." }`
  - Submits internship application.
- **`POST /api/mentor-bookings`**
  - Body: `{ "mentorId": "...", "mentorName": "...", "keyword": "...", "note": "...", "date": "..." }`
  - Schedules 1-on-1 guidance with the assigned domain mentor.
- **`POST /api/reset`**
  - Resets `server/data/db.json` back to default seed data.

---

## 💾 Storage Architecture
Data is persisted in `server/data/db.json`. The frontend API client automatically synchronizes between this backend REST API and the browser's `localStorage` for offline resilience.
