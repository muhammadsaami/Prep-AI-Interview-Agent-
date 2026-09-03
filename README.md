# Orbit — Freelance Marketplace Platform

Orbit is a full-stack freelance marketplace (similar to Upwork/Fiverr) where **clients** can post work and **freelancers** can apply, get hired, collaborate, and get paid — all with milestone-based payments, real-time chat, and a transparent trust score system.

---

## 🎯 The Problem We're Solving

Traditional freelance platforms often suffer from:
- **Unclear payment terms** — freelancers do work without guaranteed, structured payment checkpoints
- **No real-time collaboration** — clients and freelancers rely on external tools (email, WhatsApp) to communicate
- **Opaque trust signals** — it's hard to know if a client or freelancer is reliable before working with them
- **Clunky application flows** — posting a gig or applying to one is often buried in unnecessary steps

Orbit solves this by combining **milestone-based payments**, **built-in real-time chat**, and a **visible trust score** into one clean workspace — so both sides of a project know exactly where things stand at every step.

---

## 🛠️ Tech Stack

### Frontend
- **React** (with Vite) — fast dev server and build tooling
- **TypeScript** — strict typing across the app
- **Tailwind CSS** — utility-first styling with a custom design system (CSS variables for full dark/light theme support)
- **React Router** — client-side routing with protected routes
- **React Hook Form** — form validation (login, signup)
- **Lucide React** — icon set
- **Axios** — API communication layer

### Backend
- **FastAPI** (Python) — REST API framework
- **PostgreSQL** — primary database
- **SQLAlchemy** — ORM
- **JWT** — authentication & authorization
- **Redis** — caching / session support
- **WebSockets** — real-time chat
- **Razorpay** — payment gateway (checkout UI integrated on the frontend)

---

## ✨ Features

### 🔐 Authentication
- Signup/login with role selection (**Client** or **Freelancer**)
- JWT-based session persistence
- Protected routes — dashboard and workspace pages are inaccessible without a valid login (auto-redirects to `/login`)
- One-click logout from the sidebar

### 📋 Gigs (Job Postings)
- **Post a Gig** — clients can create real gigs (title, description, category, budget, skills) directly from the dashboard
- **Browse Gigs** — freelancers can search, filter (by category/budget), and sort available gigs
- **Gig Details** — full scope, client info, and an **Apply** flow with a cover letter + expected delivery time

### 🧑‍💼 Applications & Hiring
- Freelancers track all their applications in **My Applications**
- Clients review applicants per gig in **Applicants Management**, and can **Hire** or **Reject** each one
- Hiring a freelancer automatically unlocks the shared **Workspace** for that gig

### 🗂️ Workspace (per hired gig)
A single control center combining:
- **Milestones** — created and tracked with approval status (pending → approved → paid)
- **Timeline** — a visual milestone progress tracker
- **Real-time Chat** — WebSocket-powered messaging between client and freelancer, with online/connecting status
- **Payments** — Razorpay checkout wired up so clients can pay approved milestones directly
- **Reviews** — once work is underway, both sides can leave a star rating + written review for each other

### ⭐ Trust & Reputation
- Every user has a **Trust Score** (visual ring + percentage)
- **Public Profile** pages show trust score, average rating, reviews received, and skill-verification status
- Reviews are pulled live from the backend — not hardcoded

### 🔔 Notifications
- Bell icon in the header shows a live unread-count badge
- Dedicated **Notifications** page with All/Unread filtering and "Mark all as read"

### ⚙️ Settings
- Update profile name
- Change password
- Toggle **Dark Mode / Light Mode** — preference is saved and applied consistently across every page, every session

### 🎨 Design System
- Fully custom Tailwind + CSS-variable-based theme (`theme.css`) supporting both light and dark mode out of the box
- Consistent component library: Cards, Buttons, Inputs, Badges, Tables, Modals, Skeletons — all theme-aware
- Custom Orbit logo/branding integrated across the sidebar, favicon, and marketing pages

### 🖥️ Landing Page
- Public marketing page explaining Orbit's value proposition, how it works, trust score system, and testimonials
- Separate signup paths for "I'm a Client" vs "I'm a Freelancer"

---

## 📁 Project Structure (Frontend)

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/        # Feature components (GigCard, ChatBubble, ReviewForm, etc.)
│   │   ├── layout/         # Page layouts (Dashboard, Auth, Marketing)
│   │   ├── navigation/      # Sidebar
│   │   ├── routing/         # ProtectedRoute (auth guard)
│   │   └── ui/               # Base design system (Button, Card, Input, Modal, etc.)
│   ├── context/             # AuthContext (login/logout/session state)
│   ├── pages/               # One folder per feature area (auth, client, freelancer, gigs, workspace, etc.)
│   ├── routes/               # App-wide route definitions
│   ├── services/             # Axios API instance
│   ├── styles/                # theme.css — dark/light CSS variables
│   ├── types/                  # Shared TypeScript types
│   └── utils/                   # Auth helpers, time formatting, etc.
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (for frontend)
- Python 3.10+ with a virtual environment (for backend)
- PostgreSQL running locally
- Redis running locally

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate      # Windows
pip install -r requirements.txt
uvicorn main:app --reload  # or your entry point
```
API docs available at `http://127.0.0.1:8000/docs`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App runs at `http://localhost:5173`

### Environment Variables
Create a `.env` file in `frontend/` (never commit this file):
```
VITE_RAZORPAY_KEY_ID=your_razorpay_test_key
```

---

## 🧪 Verified Working (as of latest build)

- ✅ Zero TypeScript / build errors (`npm run build` passes clean)
- ✅ Full auth flow: signup → login → protected dashboard access → logout
- ✅ Gig posting, browsing, applying, hiring — all wired to the real backend
- ✅ Workspace: milestones, real-time chat, payments UI, reviews
- ✅ Notifications: unread badge, mark-as-read
- ✅ Dark/light theme consistent across every page

---

## 📌 Known Scope for Future Iterations

These are intentionally deferred (non-blocking for the current version):
- Profile picture upload (currently uses auto-generated initials avatar)
- Chat enhancements: typing indicators, emoji picker, file attachments
- Trust score formula transparency panel
- Notification grouping by date/type
- Account deletion ("Danger Zone") in Settings

---

## 👤 Author

Built by **Muhammad Sami**
