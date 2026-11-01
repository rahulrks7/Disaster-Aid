<<<<<<< HEAD
# DisasterAid — Disaster Management & Emergency Response System

> **MCA Academic Capstone Project**  
> A full-stack MERN (MongoDB, Express.js, React.js, Node.js) disaster management and emergency response system. DisasterAid enables citizens to report disaster incidents and request urgent SOS help, provides interactive GIS mapping of verified incidents and relief shelters, and equips administrators and volunteer taskforces with real-time response dispatch, inventory management, and incident verification tools.

---

## 🌟 Key Features

### 1. 👥 Citizen Portal
- **Interactive Disaster Reporting:** Submit geo-tagged disaster reports (Flood, Fire, Earthquake, Cyclone, Landslide, Road Accident, Structure Collapse) with multi-photo upload previews and interactive map pin selectors.
- **Emergency SOS Help Requests:** Request rapid rescue evacuation, medical supplies, food rations, drinking water, and temporary shelter with victim headcount and vulnerability details.
- **Real-Time Verification & Lifecycle Tracking:** Track whether reports have been verified by administrators, inspect field response updates, and cancel pending help requests if resolved.
- **Public Safe Havens & Hotlines:** Discover live relief shelters with real-time capacity and bed availability gauges, and access toll-free emergency hotline directories.

### 2. 🤝 Volunteer Responder Operations
- **Readiness & Availability Control:** Toggle operational dispatch status (`Available for Dispatch` vs `Off-Duty`).
- **Open Task Discovery:** Browse unassigned or open emergency tasks filtered by urgency and service region.
- **Operational Task Workflow:** Accept missions, transition tasks (`Assigned` ➔ `Accepted` ➔ `In Progress` ➔ `Completed`), and submit completion notes.
- **Skills Matrix & Certifications:** Manage verified competencies (First Aid, Search & Rescue, Water Rescue, Medical Assistance, Heavy Equipment, Logistics).

### 3. 🛡️ Administrator Command Center
- **Executive Command Dashboard:** 8 real-time summary cards, 4 Recharts visual analytics (incidents by category, severity distribution, monthly reporting vs resolution trends, help request breakdowns), and low-inventory safety alerts.
- **Disaster Verification Console:** Triage citizen reports, authenticate incident severity, publish verified markers to the public GIS map, and record administrative remarks.
- **SOS Request Triage & Direct Dispatch:** Triage emergency requests and spawn response tasks.
- **Task & Volunteer Assignment:** Dispatch response missions, match volunteers by skill, and inspect full status audit histories.
- **Relief Inventory Management:** Add relief packages, record stock additions and disaster site distributions with negative stock prevention, and inspect transaction audit logs.
- **Relief Shelter Governance:** Configure evacuation centers, adjust live occupancy headcounts with strict capacity bound validation (`0 <= occupancy <= totalCapacity`), and track facility amenities.
- **Real-Time Public Alerts:** Broadcast severe weather advisories and emergency warnings with automated expiration times and Socket.IO live notifications.
- **User Directory & RBAC:** Oversee citizen and responder credentials, configure role access permissions, and toggle account activation.
- **System Audit Trail:** Chronological transaction logs recording all state mutations, administrative actions, and IP records.

### 4. 🗺️ Interactive GIS Disaster Map (Leaflet & OpenStreetMap)
- Color-coded severity pins (Critical, High, Medium, Low) with category markers.
- Live relief shelter markers with real-time occupancy status (Open vs Full Capacity).
- Incident preview popups with photographs, affected citizen counts, address details, and verification status.

---

## 🔑 Demo Login Credentials

For quick evaluation, pre-seeded demo accounts are ready out of the box (with 1-click login buttons on the Login page):

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@disasteraid.org` | `admin123` | Full Access (Command Center, Verification, Inventory, Shelters, Users) |
| **Volunteer** | `volunteer@disasteraid.org` | `volunteer123` | Volunteer Portal (Task Discovery, Mission Lifecycle, Readiness) |
| **Citizen** | `citizen@disasteraid.org` | `citizen123` | Citizen Portal (Report Incidents, SOS Help Requests, Tracking) |

---

## 🛠️ Technology Stack

- **Frontend:**
  - React.js 18 (Vite)
  - Tailwind CSS + Custom Design System
  - React Router DOM v6
  - Axios HTTP Client
  - Lucide React Icons
  - Recharts (Data Visualizations)
  - Leaflet & React-Leaflet (Interactive GIS Mapping)
  - Socket.IO Client (Real-Time Push Notifications)
- **Backend:**
  - Node.js & Express.js
  - MongoDB & Mongoose ODM
  - MongoDB Memory Server (Zero-config embedded fallback for evaluation)
  - JSON Web Tokens (JWT) & bcrypt.js Password Hashing
  - Multer (Multipart File & Image Uploads)
  - Socket.IO (Live Event Broadcasting)
  - Helmet & Express Rate Limiter (Security & Rate Limiting)
  - Morgan (HTTP Request Logging)

---

## 🚀 Getting Started & Installation

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### 1. Install Dependencies
From the project root directory, run:
```bash
npm run install-all
```
*(Or install in `backend` and `frontend` individually:*
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```
*)*

### 2. Seed the Database
To populate the database with realistic disaster reports, help requests, shelters, relief inventory, alerts, and sample users:
```bash
# From root directory:
npm run seed

# Or from backend directory:
cd backend
npm run seed
```

### 3. Run the Applications
#### Option A: Run Independently (Recommended)
**Backend API Server (Port 5000):**
```bash
cd backend
npm run dev
# or: npm start
```

**Frontend React Client (Port 5173):**
```bash
cd frontend
npm run dev
```

#### Option B: Run Concurrently from Root
Start both backend and frontend development servers together:
```bash
npm run dev
```

The application will be accessible at:
- **Frontend Web Portal:** [http://localhost:5173](http://localhost:5173)
- **Backend REST API:** [http://localhost:5000/api/v1](http://localhost:5000/api/v1)

---

## 📡 REST API Overview (`/api/v1`)

### Authentication
- `POST /api/v1/auth/register` — Register new citizen or volunteer account
- `POST /api/v1/auth/login` — Authenticate user and issue JWT token
- `GET /api/v1/auth/me` — Retrieve current authenticated user profile
- `PATCH /api/v1/auth/profile` — Update account profile details

### Disaster Incident Reports
- `GET /api/v1/disasters/map` — Public verified reports feed for GIS map
- `POST /api/v1/disasters` — Submit new incident report (with image attachments)
- `GET /api/v1/disasters` — Get all reports with search, category, severity, and status filters
- `GET /api/v1/disasters/my-reports` — Get reports submitted by current citizen
- `PATCH /api/v1/disasters/:id/verify` — Admin verify or reject incident
- `PATCH /api/v1/disasters/:id/status` — Admin update response status

### Emergency Help Requests
- `POST /api/v1/help-requests` — Submit emergency SOS assistance request
- `GET /api/v1/help-requests` — Admin list requests with triage filters
- `GET /api/v1/help-requests/my-requests` — Citizen track their SOS requests
- `PATCH /api/v1/help-requests/:id/status` — Admin update request priority & status
- `PATCH /api/v1/help-requests/:id` — Citizen cancel or update request

### Response Tasks & Volunteers
- `GET /api/v1/tasks/available` — Volunteer browse open response missions
- `GET /api/v1/tasks/my-tasks` — Volunteer view assigned tasks
- `POST /api/v1/tasks` — Admin create and dispatch response task
- `PATCH /api/v1/tasks/:id/assign` — Admin assign volunteers
- `PATCH /api/v1/tasks/:id/accept` — Volunteer accept task
- `PATCH /api/v1/tasks/:id/status` — Update task status & submit completion notes

### Relief Inventory & Resources
- `GET /api/v1/resources` — List relief materials with low-stock warnings
- `POST /api/v1/resources` — Admin add new inventory category
- `POST /api/v1/resources/:id/transactions` — Record stock intake or emergency distribution
- `GET /api/v1/resources/:id/transactions` — Inspect transaction history

### Relief Shelters
- `GET /api/v1/shelters` — Public directory & live occupancy statistics
- `POST /api/v1/shelters` — Admin create evacuation shelter
- `PATCH /api/v1/shelters/:id` — Admin adjust headcount & operational status
- `DELETE /api/v1/shelters/:id` — Admin delete shelter

### Alerts & Analytics
- `GET /api/v1/alerts/active` — Public active emergency warning stream
- `POST /api/v1/alerts` — Admin broadcast new regional alert
- `GET /api/v1/dashboard/summary` — Admin executive summary statistics
- `GET /api/v1/dashboard/analytics` — Admin Recharts analytical aggregations
- `GET /api/v1/dashboard/citizen` — Citizen personalized overview
- `GET /api/v1/dashboard/volunteer` — Volunteer operational metrics
- `GET /api/v1/audit-logs` — Admin immutable activity trails

---

## 🔒 Security & Architecture Standards

1. **Role-Based Access Control (RBAC):** Backend Express middleware (`protect` and `authorize('admin', 'volunteer', 'citizen')`) strictly verifies permissions before allowing database access.
2. **Prevented Privilege Escalation:** Public registration endpoint strictly prohibits selecting the `admin` role. Initial administrator is seeded through a secure script.
3. **Password Security:** All passwords hashed with bcrypt (salt factor 10) before storage; excluded from serialization.
4. **Zero Negative Stock Validation:** Supply distributions undergo strict transactional validation to guarantee available inventory is never exceeded.
5. **Capacity Invariant Enforcement:** Shelter occupancy is strictly bounded between 0 and total shelter capacity.
6. **Graceful Database Fallback:** Automatic connection to local MongoDB with embedded MongoDB Memory Server fallback ensures the application runs on any machine with zero setup friction.

---

## 📜 Disclaimer
*DisasterAid is an MCA academic prototype for disaster management research and coordination demonstration. For real-life emergencies, contact official emergency services (112 / 108 / 101).*
=======
# Disaster-Aid
A full-stack MERN-based Disaster Management System designed to manage disaster reports, emergency responses, rescue operations, and real-time information through an interactive web application.
>>>>>>> bab5cfaa53d33ce0fcea8c1b53b53f8c21fd884f
