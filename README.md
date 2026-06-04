<div align="center">

<br/>

```
██████╗ ██╗███╗   ██╗███████╗ ██████╗ ██████╗ ███████╗
██╔══██╗██║████╗  ██║██╔════╝██╔═══██╗██╔══██╗██╔════╝
██║  ██║██║██╔██╗ ██║█████╗  ██║   ██║██████╔╝███████╗
██║  ██║██║██║╚██╗██║██╔══╝  ██║   ██║██╔═══╝ ╚════██║
██████╔╝██║██║ ╚████║███████╗╚██████╔╝██║     ███████║
╚═════╝ ╚═╝╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝     ╚══════╝
```

### ✦ &nbsp; **Where Every Meal Becomes a Memorable Experience** &nbsp; ✦

<br/>

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://prisma.io/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://framer.com/motion/)

<br/>

> **DineOps** is a production-grade, full-stack restaurant management ecosystem — a single platform that unifies the entire dining experience, from the moment a guest browses the menu to the instant a delivery rider hands over their order.

<br/>

---

</div>

<br/>

## ✦ &nbsp; Overview

DineOps is not just a restaurant app. It is a complete **operational command center** — built to the standard of enterprise SaaS products. Seven distinct role-based portals, each crafted with surgical precision, serve every stakeholder in a modern food business: customers, cashiers, chefs, delivery staff, administrators, and executive leadership.

Every decision in its architecture prioritizes **elegance, resilience, and real-world deployability** — with a zero-compromise offline fallback that keeps every feature fully alive even without a live database.

<br/>

---

<br/>

## ✦ &nbsp; Technology Architecture

<br/>

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DINEOPS ARCHITECTURE                         │
├───────────────────────┬─────────────────────────────────────────────┤
│   FRONTEND            │   BACKEND                                   │
│                       │                                             │
│  Next.js 16           │   NestJS (Node.js)                          │
│  React 18             │   RESTful API — 26 Endpoints                │
│  TypeScript           │   JWT Auth + Role Guards                    │
│  Tailwind CSS         │   Prisma ORM → PostgreSQL                   │
│  Framer Motion        │   JSON Mock DB (auto-fallback)              │
│  Lucide React Icons   │   AI Chat Endpoint                          │
│                       │   Cashfree Payment Integration              │
└───────────────────────┴─────────────────────────────────────────────┘
```

<br/>

| Layer | Technology | Purpose |
|:--|:--|:--|
| 🖥 **Frontend** | Next.js 16 · React 18 · TypeScript | App Router, SSR, component UI |
| 🎨 **Styling** | Tailwind CSS · Framer Motion | Glassmorphism UI, micro-animations |
| ⚙️ **Backend** | NestJS · TypeScript | REST API with 26 endpoints, RBAC middleware |
| 🗄 **Database** | PostgreSQL via Prisma ORM | Production data persistence |
| 🔄 **Fallback DB** | Custom JSON Mock DB | Zero-config offline mode — 100% feature parity |
| 🔐 **Auth** | JWT Bearer Tokens | Login · Signup · Role-based route guards |
| 💳 **Payments** | Cashfree Gateway (simulated) | UPI QR · Card · Net Banking · Wallet |
| 🤖 **AI** | OpenAI-compatible backend endpoint | Context-aware concierge chatbot |
| 🎭 **Design** | Premium dark metallic aesthetic | Amber/gold accents · Glassmorphism · Parallax |

<br/>

---

<br/>

## ✦ &nbsp; Quick Start

<br/>

### Prerequisites

```
Node.js ≥ 18.0.0
npm ≥ 9.0.0
PostgreSQL (optional — system works fully without it)
```

<br/>

### 1 — Clone & Install

```bash
git clone https://github.com/yourusername/dineops.git
cd dineops
```

<br/>

### 2 — Start the Backend API

```bash
cd backend
npm install
npm run start:dev

# ✓ API Server running at  →  http://localhost:5000
# ✓ Swagger Docs available →  http://localhost:5000/api/docs
```

<br/>

### 3 — Start the Frontend

```bash
cd frontend
npm install
npm run dev

# ✓ Application running at →  http://localhost:3000
```

<br/>

> **⚡ Zero-Config Offline Mode** — If PostgreSQL is not configured, the system automatically falls back to a persistent JSON mock database (`mock-db-persistence.json`). Every single feature — orders, wallets, reservations, reviews, shifts, inventory — works fully in this mode. Data persists across backend restarts. Delete the file to reset to clean seed state.

<br/>

---

<br/>

## ✦ &nbsp; Staff Login Credentials

<br/>

<div align="center">

| &nbsp; | Role | Email | Password | Portal |
|:--:|:--|:--|:--|:--|
| 👑 | **Super Admin** | `admin@admin` | `admin` | `/super-admin` |
| 🛡 | **Admin / Manager** | `admin@dineops.com` | `password123` | `/admin` |
| 🍳 | **Head Chef (KDS)** | `chef@dineops.com` | `password123` | `/kds` |
| 🧑‍🍳 | **Kitchen Staff** | `staff@dineops.com` | `password123` | `/kds` |
| 🏪 | **Cashier (POS)** | `cashier@dineops.com` | `password123` | `/pos` |
| 🛵 | **Delivery Rider** | `delivery@dineops.com` | `password123` | `/delivery` |
| 🧑‍💻 | **Customer** | `customer@dineops.com` | `password123` | `/` |

</div>

<br/>

> Customers can self-register via the **Sign Up** form on the landing page. New accounts are assigned the `CUSTOMER` role by default and can be elevated by a Super Admin.

<br/>

---

<br/>

## ✦ &nbsp; Portal Map & Role-Based Access

<br/>

```
https://dineops.app/
│
├── /                    ← Customer Portal         (Public + Authenticated Customers)
├── /pos                 ← POS Cashier Terminal    (CASHIER role)
├── /kds                 ← Kitchen Display System  (CHEF · KITCHEN_STAFF roles)
├── /delivery            ← Delivery Rider Hub      (DELIVERY_STAFF role)
├── /admin               ← Operations Dashboard    (ADMIN role)
└── /super-admin         ← Executive Command HQ    (SUPER_ADMIN role only)
```

All staff portals are protected by `PortalAuthGuard` — unauthorized access renders a premium animated **Access Denied** modal, never a raw redirect.

<br/>

---

<br/>

## ✦ &nbsp; Feature Reference

<br/>

<details>
<summary><strong>🍽 &nbsp; Customer Portal &nbsp;—&nbsp; Complete Feature Set</strong></summary>

<br/>

#### Artisan Menu Experience

- Rich food catalog spanning **8+ curated categories**: Breakfast Specials · European Classics · Gourmet Grills · Indian Meals & Thalis · Indian Chaat Corner · Indo-Chinese Fusion · Premium Beverages · Sweet Endings
- Every item displays: hero image, price, dietary badges (🟢 Veg · Keto · Gluten-Free), calorie count, macro breakdown (P / C / F)
- **Live search** with instant filter-as-you-type
- **Voice search simulation** — mic click auto-populates a contextual query
- **Dietary filter toggles** — Vegetarian Only · Keto Friendly · Gluten Free
- **Scrollable category sidebar** — pinned for quick navigation
- **Item customization modals** — portion sizes, add-ons, extras with dynamic pricing
- **Shimmer skeleton loaders** — premium lazy loading with fade-in
- **Hover zoom & parallax** — images scale on card hover with smooth easing
- **Chef's Pick badges** on popular items

#### Cart & Checkout

- **Slide-out cart panel** — accessible from any tab, persists across navigation
- Quantity controls · live subtotal · GST (5%) calculation · ₹40 delivery fee auto-applied
- **Coupon codes**: `BREWFIRST` (20% off up to ₹150 on orders ≥ ₹300) · `LUXURY50` (flat ₹50)
- **Order type selector**: Dine In · Delivery · Pickup — each with conditional fields
- Delivery address textarea · table selector · scheduled pickup time
- Cooking instructions / special notes field

#### Payment Gateway (Cashfree Simulated)

- **UPI** — live QR code generated with dynamic amount encoded in URL
- **Card** — debit/credit form with card number, expiry, CVV (pre-filled for demo)
- **Net Banking** — bank selection grid (SBI, HDFC, ICICI, Axis)
- Full animated payment processing flow: loading → success → order placed

#### Live Order Tracking

- 4-step animated progress stepper: `Order Placed → Cooking → Ready → Delivered`
- **Active Orders** tab + **Order History** tab — cleanly separated
- Live polling from backend every 3 seconds
- **OTP display** for delivery orders (secure handover verification)
- **Post-delivery Review Form** — 5-star rating + text comment, one submission per order (persisted via localStorage + backend)

#### Table Reservation System

- **Live floor plan grid** — 8 tables rendered as interactive visual cards
- Color-coded status: 🟢 Available · 🔴 Occupied · 🟡 Reserved · 🔒 Locked (Admin)
- Select date, time slot (Breakfast / Lunch / Dinner), guest count, table number → Confirm
- **Admin controls overlay** (Admin/Super Admin only) — Lock & Unlock any table directly from the floor plan

#### Meal Subscriptions

- 3 plans: Weekly Lunch (₹1,199) · Monthly Student (₹3,999) · Corporate Platinum Elite (₹9,999)
- Loyalty cashback points per plan highlighted on each card
- One-click activation with confirmation alert

#### Luxury Gift Cards

- 4 denominations: ₹500 · ₹1,000 · ₹2,500 · ₹5,000
- Gradient premium card designs with animated purchase flow
- Unique redemption code generated on purchase

#### AI Concierge Chatbot

- Floating bubble (bottom-right) — expands into a full conversational UI
- Context-aware: menu recommendations, reservation help, dietary queries
- Connects to backend `/api/ops/ai/chat` — with intelligent offline mock fallback

</details>

<br/>

<details>
<summary><strong>👑 &nbsp; Super Admin Command Center &nbsp;—&nbsp; Executive Oversight</strong></summary>

<br/>

- **Revenue & Order Analytics** — KPIs: total revenue, today's revenue, average order value, order counts by status
- **Enterprise User Registry** — full table of all registered users with live role assignment dropdown
- **RBAC Permission Matrix** — visual grid mapping every role to its permitted actions
- **Customer Reviews Panel** — all post-delivery reviews with star ratings, auto-detected sentiment badges (POSITIVE · NEUTRAL · NEGATIVE), and submission timestamps
- **Premium session management** — "Terminate Clearance Session" styled sign-out flow

</details>

<br/>

<details>
<summary><strong>🛠 &nbsp; Admin Operations Panel &nbsp;—&nbsp; Restaurant Management</strong></summary>

<br/>

- **Inventory Management** — stock registry, low-stock highlighting, quick IN/OUT movement form
- **Staff Attendance & Shifts** — all staff shifts auto-populated for today; Clock In / Clock Out per employee
- **Table Reservations Manager** — full list with inline edit (status, date, slot, guests) and cancel

</details>

<br/>

<details>
<summary><strong>🍳 &nbsp; Kitchen Display System &nbsp;—&nbsp; Live Order Queue</strong></summary>

<br/>

- Real-time order cards for all non-delivered orders
- Each card: order number · type badge · item list with quantities · cooking notes
- Status advancement: `ACCEPTED → COOKING → READY → DELIVERED`
- Auto-refreshes every 3 seconds — zero manual reload required

</details>

<br/>

<details>
<summary><strong>💳 &nbsp; POS Cashier Terminal &nbsp;—&nbsp; Walk-In Sales</strong></summary>

<br/>

- Full point-of-sale interface for walk-in and counter orders
- Menu grid with add-to-cart, running bill total, quantity controls
- Discount codes · coupon support · receipt print simulation
- Dine In / Takeaway order type selector

</details>

<br/>

<details>
<summary><strong>🛵 &nbsp; Delivery Rider Portal &nbsp;—&nbsp; Last-Mile Operations</strong></summary>

<br/>

- Assigned delivery orders list with customer address and order details
- Status flow: `OUT_FOR_DELIVERY → OTP Verified → DELIVERED`
- OTP verification gate — cannot mark delivered without customer code
- Clean mobile-first layout optimized for on-the-road use

</details>

<br/>

---

<br/>

## ✦ &nbsp; Platform-Wide Systems

<br/>

### 🔐 &nbsp; Authentication & Role-Based Access Control

JWT-based authentication with email + password. Role stored in the token payload — validated on every protected API route and frontend portal guard. Seven distinct roles form a strict access hierarchy:

```
SUPER_ADMIN  ←  Full system access
    ↓
ADMIN        ←  Operations, inventory, staff, reservations
    ↓
CHEF / KITCHEN_STAFF  ←  Kitchen queue only
CASHIER               ←  POS terminal only
DELIVERY_STAFF        ←  Delivery assignments only
    ↓
CUSTOMER     ←  Public-facing portal
```

<br/>

### 🔔 &nbsp; Real-Time Notification Engine

- Notifications stored per-user on the backend
- Frontend polls `GET /api/auth/notifications` every 3 seconds
- Bell icon in navbar shows live unread count badge
- Auto-cleared from backend after delivery — one-time read model
- Triggers: order status changes, reservation confirmations, low-stock alerts (admin only), system messages

<br/>

### 🗄 &nbsp; Dual-Mode Persistence

```
Production Mode  →  PostgreSQL via Prisma ORM
                     └─ Full schema, migrations, relational integrity

Offline Mode     →  JSON Mock Database (auto-generated)
                     └─ mock-db-persistence.json
                     └─ Saved every 2 seconds via setInterval
                     └─ Full feature parity — zero degradation
                     └─ Delete file to reset all data
```

<br/>

### 🎨 &nbsp; Premium Design System

- **Color palette**: Deep carbon `#0d0a07` · Amber gold `#f59e0b` · Slate white `#f4ece1`
- **Glassmorphism**: `backdrop-blur` panels with subtle amber border glow
- **Typography**: Outfit + Inter via Google Fonts — clean, premium, legible
- **Animations**: Framer Motion — page transitions, modal entrances, staggered list renders
- **Micro-interactions**: hover scale, shimmer loaders, spinning progress indicators
- **Zero browser alerts** — every notification uses a custom `PremiumAlertModal`
- **Fully responsive** — from 320px mobile to 4K widescreen

<br/>

---

<br/>

## ✦ &nbsp; Project Structure

<br/>

```
dineops/
│
├── 📁 backend/
│   └── src/
│       ├── auth/
│       │   ├── auth.controller.ts         # Login · Signup · Profile · Notifications · User Roles
│       │   └── auth.service.ts            # JWT auth · Wallet read/write · Profile CRUD
│       │
│       ├── orders/
│       │   ├── orders.controller.ts       # Place order · Get orders · Update status · OTP verify
│       │   └── orders.service.ts          # Order creation · Coupon · Inventory deduction · Wallet deduct
│       │
│       ├── menu/
│       │   ├── menu.controller.ts         # Categories & menu items CRUD
│       │   └── menu.service.ts
│       │
│       ├── operations/
│       │   ├── operations.controller.ts   # Tables · Inventory · Shifts · AI · Reservations · Reviews · Gifts
│       │   └── operations.service.ts      # Gift voucher credit · Review sentiment · Table management
│       │
│       └── prisma/
│           ├── mock-db.service.ts         # In-memory mock database with disk persistence & seeding
│           └── prisma.service.ts          # Prisma ORM (production database connector)
│
├── 📁 frontend/
│   └── src/app/
│       ├── page.tsx                       # App shell — routing · sync loop · notification polling
│       │
│       ├── components/
│       │   ├── CustomerPortal.tsx         # Full customer UI: menu · cart · checkout · gifting · reservations
│       │   ├── Navbar.tsx                 # Role-aware navigation · notification bell · profile dropdown
│       │   ├── MyOrdersModal.tsx          # Live order tracker · review form · status stepper
│       │   ├── MyReservationsModal.tsx    # Reservation history: Past · Today · Upcoming
│       │   ├── MyProfileModal.tsx         # Profile tabs: details · wallet · bookings · subscriptions
│       │   ├── InventoryStaff.tsx         # Admin tabs: inventory · attendance · table reservations
│       │   ├── AnalyticsDashboard.tsx     # Super Admin revenue & order analytics
│       │   ├── RBACMatrix.tsx             # Role permission matrix visualization
│       │   ├── POSTerminal.tsx            # POS cashier terminal interface
│       │   ├── KitchenKDS.tsx             # Kitchen display system
│       │   ├── DeliveryDashboard.tsx      # Delivery rider portal
│       │   ├── PortalAuthGuard.tsx        # Auth wrapper for all staff portals
│       │   ├── AccessDeniedModal.tsx      # Premium access denied overlay
│       │   └── PremiumAlertModal.tsx      # Reusable alert modal (replaces all browser alerts)
│       │
│       ├── super-admin/page.tsx           # Super Admin HQ: analytics · users · reviews
│       ├── admin/page.tsx                 # Admin operations panel
│       ├── kds/page.tsx                   # Kitchen display system
│       ├── pos/page.tsx                   # POS cashier terminal
│       └── delivery/page.tsx              # Delivery rider dashboard
│
├── 📁 public/menu/                        # 47 high-resolution food images (all menu items)
├── mock-db-persistence.json               # Auto-generated persistent mock DB (delete to reset)
├── schema.sql                             # PostgreSQL schema reference
├── docker-compose.yml                     # Docker setup for PostgreSQL
└── README.md
```

<br/>

---

<br/>

## ✦ &nbsp; API Reference

<br/>

### Auth Endpoints

| Method | Endpoint | Description |
|:--|:--|:--|
| `POST` | `/api/auth/signup` | Register a new user account |
| `POST` | `/api/auth/login` | Authenticate — returns signed JWT token |
| `GET` | `/api/auth/profile` | Fetch current user profile (wallet · loyalty · reservations) |
| `PUT` | `/api/auth/profile` | Update profile (DOB · address · allergies) |
| `GET` | `/api/auth/users` | List all registered users — Super Admin only |
| `PUT` | `/api/auth/users/:id/role` | Assign role to any user |
| `GET` | `/api/auth/notifications` | Fetch & auto-clear pending notifications |

### Menu Endpoints

| Method | Endpoint | Description |
|:--|:--|:--|
| `GET` | `/api/menu/categories` | Retrieve all menu categories |
| `GET` | `/api/menu/items` | Retrieve all menu items |

### Order Endpoints

| Method | Endpoint | Description |
|:--|:--|:--|
| `POST` | `/api/orders/place` | Place a new order with items, type, coupon |
| `GET` | `/api/orders` | Retrieve all orders |
| `PUT` | `/api/orders/:id/status` | Advance order status (KDS / Delivery rider) |
| `POST` | `/api/orders/:id/otp-verify` | Verify delivery handover OTP |

### Operations Endpoints

| Method | Endpoint | Description |
|:--|:--|:--|
| `GET` | `/api/ops/tables` | Retrieve all tables with live status |
| `POST` | `/api/ops/tables/reserve` | Create a table reservation |
| `PUT` | `/api/ops/tables/:id/status` | Lock · Unlock · Update table status (Admin) |
| `GET` | `/api/ops/reservations` | Get all reservations — Admin view |
| `PUT` | `/api/ops/reservations/:id` | Edit reservation details |
| `DELETE` | `/api/ops/reservations/:id` | Cancel a reservation |
| `GET` | `/api/ops/inventory` | Get full inventory registry |
| `POST` | `/api/ops/inventory/movement` | Record stock IN / OUT movement |
| `GET` | `/api/ops/shifts` | Get all staff shifts |
| `PUT` | `/api/ops/shifts/:id/clock` | Clock in / Clock out |
| `POST` | `/api/ops/reviews` | Submit a post-delivery customer review |
| `GET` | `/api/ops/reviews` | Get all reviews — Super Admin only |
| `POST` | `/api/ops/gift-vouchers/purchase` | Purchase and credit a gift card |
| `POST` | `/api/ops/ai/chat` | AI Concierge chatbot response |

<br/>

---

<br/>

## ✦ &nbsp; Key User Journeys

<br/>

### 🍽 &nbsp; End-to-End Order Flow

```
Customer logs in
    → Browses menu, adds items to cart
    → Applies coupon BREWFIRST
    → Selects Delivery, enters address
    → Pays via UPI QR — order placed
        ↓
Chef sees order on KDS
    → Advances: COOKING → READY
        ↓
Delivery rider picks up
    → Marks OUT_FOR_DELIVERY
    → Enters customer OTP → DELIVERED
        ↓
Customer opens My Orders
    → Review form appears → submits 5-star rating
        ↓
Super Admin sees review in Customer Reviews panel
```

<br/>

### 🎁 &nbsp; Gift Wallet Flow

```
Customer A → Gifting tab → selects ₹1,000 card → purchases
    ↓
Customer B → bell notification: "Gift Wallet Credit Received!"
    → Opens My Profile → Gift Wallet shows ₹1,000
    → Adds items to cart → Checkout → Pay via Wallet → balance deducted
```

<br/>

### 🪑 &nbsp; Admin Table Management

```
Admin logs in → Customer Portal → Reserve a Table tab
    → Clicks Table 103 (floor plan)
    → Admin Control Panel appears:
        → 🔒 Lock Table — prevents customer booking
        → 🔓 Unlock Table — restores availability
    → Status immediately reflected on all users' floor plans
```

<br/>

### 👥 &nbsp; Role Promotion Flow

```
New user self-registers as CUSTOMER
    ↓
Super Admin → User Registry → finds the user
    → Assigns role: CUSTOMER → CHEF
        ↓
User logs in again → now sees Kitchen Display System
```

<br/>

---

<br/>

## ✦ &nbsp; Docker Setup (PostgreSQL)

<br/>

```bash
# Start PostgreSQL with Docker
docker-compose up -d

# Run Prisma migrations
cd backend
npx prisma migrate dev --name init
npx prisma generate

# The system will automatically detect the database
# and switch from mock mode to production mode
```

<br/>

---

<br/>

<div align="center">

---

<br/>

```
 ✦  Built with precision. Designed with passion.  ✦
```

<br/>

**DineOps** · Premium Restaurant Operations Platform

*Crafted Flavors. Exceptional Service. Unforgettable Dining.*

<br/>

![TypeScript](https://img.shields.io/badge/TypeScript-100%25-3178C6?style=flat-square&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-amber?style=flat-square)
![Status](https://img.shields.io/badge/Status-Production_Ready-success?style=flat-square)
![Made with](https://img.shields.io/badge/Made_with-❤️_by_Vishal_Soni-ff6b6b?style=flat-square)

<br/>

© 2026 **DineOps** · All rights reserved

<br/>

</div>
