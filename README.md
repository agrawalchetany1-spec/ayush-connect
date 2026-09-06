# 🌿 Ayush Connect — Academia × Industry Platform

> A modern full-stack web platform bridging AYUSH (Ayurveda, Yoga, Unani, Siddha, and Homoeopathy) students with industry internships, domain mentors, certified courses, and competency-based job matching.

![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61dafb?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Backend-Express.js%20REST%20API-339933?style=for-the-badge&logo=node.js)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8?style=for-the-badge&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## ✨ Key Features

### 🎓 Student Portal & Competency Evaluation
- **Profile Onboarding**: Enter college name, year of study, contact information, and choice of AYUSH discipline.
- **Industry Keyword Profiling**: Select from 10 high-impact industry keywords (*GMP & Schedule T, Pharmacognosy, Formulation R&D, Clinical Diagnosis, QC Testing, API Standards, Regulatory Documentation, Pharmacovigilance, GCP Clinical Trials, Health Informatics*). Minimum 3 keywords selection enforced.
- **Dual Diagnostic Assessments**:
  - **AYUSH Foundation Test**: Tests clinical ethics, laboratory safety, and documentation standards.
  - **Specialization Assessment**: Domain tracks covering Pharmacognosy & QC, Formulations & R&D, Clinical & Patient Care, and Standardization & Regulatory.
- **Diagnostic Competency Report Card**:
  - SVG Circular Gauge displaying overall Industry Readiness Score.
  - Multi-bar graph comparing Foundation vs. Domain Specialization.
  - Itemized question review with correct answers and explanations.

### 🌉 Skill Bridge™ Learning Hub
- Automatically identifies keywords not selected by the student and provides 3 targeted avenues:
  1. **Bridge Internships**: Specialized training roles at companies (Dabur, Baidyanath, Emami, Charak, etc.) specifically targeting unselected keywords.
  2. **1-on-1 Assigned Mentors**: 10 dedicated senior industry experts and Vaidyas with interactive session booking.
  3. **Certified Courses**: Fast-track certified training modules recognized across AYUSH institutions.

### 💼 Apply for Companies
- Real-time job matching algorithm matching student skills and keywords with industry requirements.
- Overlap badge analysis and instant application submission tracking.

### 🏢 Company Dashboard
- Post new internship opportunities with custom required industry keywords.
- Review applicant submissions, match scores, and competency radar metrics.

---

## 🛠️ Architecture & Backend API

The project uses a clean full-stack architecture with dual-layer storage:

```
┌───────────────────────────────────────┐
│         React Frontend (Vite)         │
│  - App.jsx (Dedicated Page Views)     │
│  - UIComponents.jsx (Shared UI)       │
│  - data.js (AYUSH Datasets)           │
└──────────────────┬────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────┐
│     src/api.js (API Client Layer)     │
│  - Syncs with localStorage (offline)  │
│  - Calls Express API endpoints        │
└──────────────────┬────────────────────┘
                   │ (Proxy: /api -> :5001)
                   ▼
┌───────────────────────────────────────┐
│      Express REST Backend (server/)   │
│  - server/index.js (Express server)   │
│  - server/routes/api.js               │
│  - server/controllers/dataController  │
│  - server/data/db.json (JSON Database)│
└───────────────────────────────────────┘
```

### 📡 REST API Endpoints
- `GET /api/health` — API status check
- `GET /api/user-data` — Retrieve student & company state
- `POST /api/user-data` — Save full state
- `POST /api/keywords` — Save student keywords (min 3 validation)
- `POST /api/assessments` — Record Foundation & Specialization scores
- `POST /api/applications` — Submit internship applications
- `POST /api/mentor-bookings` — Schedule mentor guidance sessions
- `POST /api/reset` — Reset database to seed data

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd ayush-connect
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Frontend & Backend Simultaneously
```bash
npm run dev:all
```
- **Frontend**: [http://localhost:5173/](http://localhost:5173/) (or active Vite port)
- **Backend API**: [http://localhost:5001/](http://localhost:5001/)
- **API Health**: [http://localhost:5001/api/health](http://localhost:5001/api/health)

### Running Services Separately
```bash
# Start backend server only:
npm run server

# Start frontend dev server only:
npm run dev
```

---

## 📁 Project Directory Structure

```
ayush-connect/
├── public/                 # Static assets & icons
├── src/                    # React frontend application
│   ├── assets/             # Images & static media
│   ├── api.js              # Frontend API client & localStorage sync
│   ├── App.jsx             # Main Application & Dedicated Pages
│   ├── data.js             # 10 Keywords, Mentors, Courses, Question Banks
│   ├── UIComponents.jsx    # Logo, Shell, Quiz, ResponseList components
│   ├── main.jsx            # React root mount
│   └── index.css           # Styling
├── server/                 # Dedicated Express REST API Backend
│   ├── data/
│   │   └── db.json         # Local persistent JSON database
│   ├── controllers/
│   │   └── dataController.js # API Controller & Storage logic
│   ├── routes/
│   │   └── api.js          # Express Router definition
│   ├── index.js            # Express server entrypoint
│   ├── package.json        # Backend standalone configuration
│   └── README.md           # Backend documentation
├── index.html              # HTML entrypoint with Tailwind CSS
├── vite.config.js          # Vite configuration with /api proxy
├── package.json            # Root configuration & scripts
└── README.md               # Project documentation
```

---

## 👤 Author
**Chetan Agrawal**  
📧 Email: [agrawalchetany1@gmail.com](mailto:agrawalchetany1@gmail.com)
