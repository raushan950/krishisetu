# KrishiSetu (कृषिसेतु)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/raushan950/krishisetu)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/raushan950/krishisetu&root-directory=frontend)

**Problem Statement ID:** SIH26132  
**Problem Statement:** Strengthening Market Linkages and Price Discovery for Farmers  
**Domain:** Agriculture / FoodTech  
**Event:** Smart India Hackathon (SIH)  

KrishiSetu is an AI-powered agricultural market intelligence and farmer-buyer direct connect platform. It bridges the gap between agricultural producers and commercial buyers by providing real-time mandi price transparency, distance-adjusted net-return calculations, and direct, traceable marketplace linkages.

---

## Live Deployments

- **Frontend (Vercel):** [https://instant-geode-9y9nkbl.tmp.now](https://instant-geode-9y9nkbl.tmp.now)
- **Backend API (Render):** [https://krishisetu-api-70rj.onrender.com](https://krishisetu-api-70rj.onrender.com)
- **One-Click Render Backend Deployment:** [https://render.com/deploy?repo=https://github.com/raushan950/krishisetu](https://render.com/deploy?repo=https://github.com/raushan950/krishisetu)
- **GitHub Repository:** [https://github.com/raushan950/krishisetu](https://github.com/raushan950/krishisetu)

For Vercel deployments, set `VITE_API_URL` to the Render API base URL, including `/api/v1`
(currently `https://krishisetu-api-70rj.onrender.com/api/v1`). The frontend uses this URL
in production by default and supports overriding it if the Render service URL changes.
Render starts Gunicorn on its assigned `$PORT` and checks `/api/v1/health/` for service
and database readiness.

---

## Demo Accounts for Jury Evaluation

The platform comes pre-seeded with test accounts representing real agricultural personas:

| Role | Email | Password | Location / Details |
|---|---|---|---|
| **Farmer** | `ramesh.farmer@example.com` | `FarmerPassword@123` | Neemuch, Madhya Pradesh (12.5 Acres) |
| **Buyer** | `sharma.traders@example.com` | `BuyerPassword@123` | Sharma Agro Commodities, Indore, MP |
| **Admin** | `admin@krishisetu.gov.in` | `AdminPassword@123` | Platform Administrator |

*(The login screen also provides a 1-click **Hackathon Demo Quick-Fill** button for instant evaluation).*

---

## Technology Stack

- **Backend:** Python 3.12, Django 5.2, Django REST Framework
- **Authentication:** Django REST Framework SimpleJWT (Access + Refresh Rotation)
- **Database:** PostgreSQL 16/18 with native JSON and spatial indexing support
- **Production Server:** Gunicorn WSGI + WhiteNoise Static Asset Compression
- **Frontend:** React 19, Vite 8, Tailwind CSS v4, Lucide React, Axios, React Router v7
- **Deployment:** Render (Backend API + Managed PostgreSQL) & Vercel (Frontend SPA)

---

## Architecture Overview

```
                               ┌────────────────────────────────────────┐
                               │           REACT FRONTEND (Vercel)      │
                               │  - Public Landing & Market Preview     │
                               │  - Farmer & Buyer Dashboards           │
                               │  - Responsive Mobile-First Design      │
                               └──────────────────┬─────────────────────┘
                                                  │ HTTPS / JWT Bearer
                                                  ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               DJANGO REST BACKEND (Render)                              │
│                                                                                         │
│  ┌───────────────────────────────── DJANGO APPS ────────────────────────────────────┐   │
│  │ accounts    │ farmers    │ buyers   │ crops     │ mandi                          │   │
│  │ marketplace │ orders     │ recommendations (AI & Net Return Engine)              │   │
│  └──────────────────────────────────────┬───────────────────────────────────────────┘   │
└─────────────────────────────────────────┼───────────────────────────────────────────────┘
                                          │
                                          ▼
                               ┌────────────────────────────────────────┐
                               │       MANAGED POSTGRESQL (Render)      │
                               │  CustomUser, FarmerProfile, Buyer      │
                               │  Mandis, Prices, Listings, Orders      │
                               └────────────────────────────────────────┘
```

---

## Local Development Setup

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo_users
python manage.py runserver 127.0.0.1:8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

For local builds that need a non-default API URL, copy `.env.example` to `.env.local` and
set `VITE_API_URL` to the API base URL ending in `/api/v1`.
