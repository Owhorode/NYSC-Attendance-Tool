# 🇳🇬 NYSC Attendance & Clearance Portal

<div align="center">

![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-10.x-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38BFF8?style=for-the-badge&logo=tailwindcss&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**An attendance management system for NYSC Local Government Inspectors (LGIs) and Corps Members.**

</div>

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Firebase Setup Guide](#firebase-setup-guide)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)

---

## About the Project

This portal replaces paper-based CDS (Community Development Service) attendance sheets with a real-time, GPS-verified digital system. It was originally built for **NYSC Lagos Island LGA** but is structured to be forked and deployed for **any LGA across Nigeria** by simply updating the `.env` file and some parts of the code.

### The Problem It Solves

- Corps members signing attendance without getting to the local government ("ghost attendance")
- LGIs manually manually screening attendance from paper sheets
- No audit trail for attendance disputes
- Final Clearance bottlenecks at end of service year

### The Solution

- GPS geofence enforces physical presence at the CDS venue
- Device binding prevents credential sharing
- Real-time Firestore snapshots give LGIs instant visibility
- All records are immutable and timestamped on Firebase servers.

---

## Features

### 👤 Corps Members
| Feature | Description |
|---|---|
| **GPS Check-in** | Uses the Haversine formula to verify you're within a configurable radius of the CDS venue |
| **Device Binding** | Account is locked to the device used on first login — prevents sharing |
| **Attendance History** | Full paginated log of every CDS session with status badges |
| **Profile View** | Complete personal, academic, and official NYSC details |
| **Birthday Easter Egg** | Balloon animation on your birthday 🎈 |

### 🏛️ LGI Officials
| Feature | Description |
|---|---|
| **Real-Time Sheet** | Live attendance table that updates as corps members check in |
| **Status Management** | Approve / reject "Pending" entries (GPS submissions start as Pending) |
| **Manual Add** | Add up to 3 corpers manually per session (for legitimate edge cases) |
| **Corper Directory** | Searchable, filterable list of all registered corps members |
| **CDS Scheduling** | Set the next CDS date and session type |

### ⚙️ Super Administrators
| Feature | Description |
|---|---|
| **User Management** | Full admin access to the corper directory |
| **Device Reset** | Clear a corper's device binding so they can log in from a new phone |
| **Account Suspension** | Suspend or re-activate any corper account |
| **President Promotion** | Assign / revoke the CDS President role |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **UI Framework** | React 18 (functional components + hooks) |
| **Styling** | Tailwind CSS v3 + `tailwindcss-animate` |
| **Icons** | Lucide React |
| **Font** | Google Sans (via Google Fonts) |
| **Backend / DB** | Firebase Firestore (real-time NoSQL) |
| **Auth** | Firebase Authentication (Email/Password) |
| **Build Tool** | Vite 5 |
| **GPS** | Native browser Geolocation API + Haversine formula |

---

## Project Structure

```
nysc-portal/
├── public/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminAttendanceSheet.jsx  # Today's live sheet
│   │   │   ├── AdminCorpers.jsx          # Corper directory + modal
│   │   │   ├── AdminOverview.jsx         # KPI dashboard panel
│   │   │   └── AdminSettings.jsx         # CDS scheduler
│   │   ├── auth/
│   │   │   ├── AuthPage.jsx              # Login/signup layout wrapper
│   │   │   ├── LoginForm.jsx             # Email + master-key login
│   │   │   └── SignupFlow/
│   │   │       ├── SignupFlow.jsx         # 5-step wizard orchestrator
│   │   │       └── SignupSteps.jsx        # Step 1–5 form components
│   │   ├── dashboard/
│   │   │   ├── Sidebar.jsx               # Role-aware nav sidebar
│   │   │   └── SkeletonDashboard.jsx     # Loading state
│   │   ├── member/
│   │   │   ├── MemberAttendance.jsx      # GPS check-in + live feed
│   │   │   ├── MemberLogs.jsx            # Personal attendance history
│   │   │   └── SuccessCard.jsx           # Post-check-in receipt
│   │   └── ui/
│   │       ├── FormControls.jsx          # InputField + InputGroup
│   │       ├── GlobalStyles.jsx          # CSS animations + Google Sans
│   │       └── Toast.jsx                 # Notification system
│   ├── constants/
│   │   └── index.js                      # CDS data, states, geofence config
│   ├── hooks/
│   │   └── useGeofence.js               # GPS geofence custom hook
│   ├── pages/
│   │   ├── Dashboard.jsx                 # Authenticated shell + routing
│   │   └── LandingPage.jsx              # Public home page
│   ├── services/
│   │   └── firebase.js                  # Firebase init (reads from .env)
│   ├── utils/
│   │   ├── device.js                    # Device token + localStorage utils
│   │   └── geo.js                       # Pure Haversine distance function
│   ├── App.jsx                          # Root — auth listener + page state
│   ├── index.css                        # Tailwind directives
│   └── main.jsx                         # Vite entry point
├── .env                                 # Your secrets (NEVER commit)
├── .env.example                         # Template for contributors
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js v18+** — [Download](https://nodejs.org/) (LTS recommended)
- **npm v9+** or **yarn** — comes with Node.js
- **VS Code** — [Download](https://code.visualstudio.com/) (recommended)
- **A Google account** — for Firebase project creation
- **Git** — [Download](https://git-scm.com/)

### Recommended VS Code Extensions

Install these for the best development experience:

| Extension | ID |
|---|---|
| ES7+ React Snippets | `dsznajder.es7-react-js-snippets` |
| Tailwind CSS IntelliSense | `bradlc.vscode-tailwindcss` |
| Prettier | `esbenp.prettier-vscode` |
| ESLint | `dbaeumer.vscode-eslint` |
| Firebase Explorer | `toba.vsfire` |

---

## Local Setup

Follow these steps exactly to run the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/nysc-attendance-portal.git
cd nysc-attendance-portal
```

### 2. Install Dependencies

```bash
npm install
```

> This installs React, Firebase SDK, Tailwind CSS, Lucide icons, and all build tools.

### 3. Configure Environment Variables

```bash
# Copy the template
cp .env.example .env
```

Then open `.env` in VS Code and fill in your values (see [Firebase Setup](#firebase-setup-guide) and [Environment Variables](#environment-variables) below).

### 4. Start the Development Server

```bash
npm run dev
```

The app will be running at **http://localhost:5173**

### 5. Build for Production

```bash
npm run build
```

This outputs a production-optimised bundle to `dist/`.

---

## Firebase Setup Guide

This section walks a beginner through creating and configuring a Firebase project from scratch. Take it one step at a time.

### Step 1 — Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"**
3. Enter a project name (e.g. `nysc-lagos-island`)
4. Disable Google Analytics if you don't need it (you can enable it later)
5. Click **"Create project"** and wait for it to provision

### Step 2 — Register a Web App

1. On your project dashboard, click the **`</>`** (Web) icon
2. Enter an app nickname (e.g. `NYSC Portal`)
3. **Check** the box that says *"Also set up Firebase Hosting"* (optional but recommended)
4. Click **"Register app"**
5. You will see a `firebaseConfig` object. **Copy these values** — you'll need them for `.env`

```js
// Example of what you'll see:
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Step 3 — Enable Authentication

1. In the left sidebar, click **Build → Authentication**
2. Click **"Get started"**
3. Under **"Sign-in method"**, click **"Email/Password"**
4. Toggle **"Email/Password"** to **Enabled**
5. Click **Save**

> Do **not** enable "Email link (passwordless sign-in)" — the portal uses standard passwords.

### Step 4 — Create Firestore Database

1. In the left sidebar, click **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in production mode"** (you'll add security rules next)
4. Select the nearest server location (e.g. `europe-west1` for Nigeria)
5. Click **"Enable"**

### Step 5 — Set Firestore Security Rules

Click **Rules** in the Firestore tab and paste these rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can only read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Admins can read all profiles
      allow read: if request.auth != null;
    }

    // Attendance logs: members write their own, admins write anything
    match /attendance_logs/{logId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null;
      allow update, delete: if request.auth != null;
    }

    // Admin schedule document
    match /admin/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

> **Note for production:** Tighten these rules using custom claims or role checks before going live with real user data.

### Step 6 — Get Your Config Keys

1. Go to **Project Settings** (gear icon near the top left)
2. Scroll to **"Your apps"** and click your web app
3. Under **"SDK setup and configuration"**, select **"Config"**
4. Copy each value into your `.env` file

### Step 7 — (Optional) Deploy Firebase Hosting

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting in the project root
firebase init hosting

# Build the project
npm run build

# Deploy
firebase deploy --only hosting
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in every value.

```env
# ─── Firebase ──────────────────────────────────────
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_firebase_app_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here

# ─── Admin Master Keys ─────────────────────────────
# Choose strong, unique values. Treat like passwords.
VITE_MASTER_KEY_LGI=LGI-YYYY-XXXX
VITE_MASTER_KEY_SUPER_ADMIN=SUP-YYYY-XXXX
VITE_SUPER_ADMIN_EMAIL=superadmin@your.domain
VITE_LGI_EMAIL=lgi@your.domain

# ─── Geofence ──────────────────────────────────────
# Use Google Maps to get the exact lat/lng of your CDS venue
VITE_GEOFENCE_LAT=6.4634390
VITE_GEOFENCE_LNG=3.3928134
VITE_GEOFENCE_RADIUS_METERS=150

# ─── Branding ──────────────────────────────────────
VITE_APP_LGA_NAME="Lagos Island"
VITE_APP_STATE_NAME="Lagos"
```

> **Security note:** Firebase API keys are safe to expose in client-side code — security is enforced by **Firestore Security Rules**, not by hiding the config. Never commit your `.env` file. It is already in `.gitignore`.

---

## Deployment

### Option A — Firebase Hosting (Recommended)

```bash
npm run build
firebase deploy --only hosting
```

### Option B — Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Add all your `.env` variables in the **Environment Variables** section
4. Click **Deploy**

### Option C — Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) and connect the repository
3. Set **Build command** to `npm run build`
4. Set **Publish directory** to `dist`
5. Add all `.env` variables in **Site settings → Environment variables**

---

<div align="center">

Built by faraday with ❤️ for Nigerian corps members.  
**Serve Nigeria. Serve well.**

</div>
