# 🍽️ DineOps — Premium Restaurant Operations Platform

> A production-grade, full-stack restaurant management ecosystem built with Next.js + NestJS. Features real-time order tracking, 6 role-based staff portals, AI concierge, loyalty wallet, digital gifting, table reservations, meal subscriptions, live KDS, POS terminal, delivery management, inventory control, and a Super Admin analytics command center.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS, Framer Motion (animations), Lucide React (icons) |
| **Backend** | NestJS (Node.js), TypeScript |
| **Database** | PostgreSQL via Prisma ORM — with automatic JSON mock-DB fallback |
| **Auth** | JWT Bearer tokens (login / signup / role-based guards) |
| **Payments** | Cashfree Gateway (fully simulated — UPI, Card, Net Banking, Wallet) |
| **Design** | Dark premium metallic-carbon aesthetic with amber/gold accents |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### 1. Run the Backend
```bash
cd backend
npm install
npm run start:dev
# API running at http://localhost:5000
```

### 2. Run the Frontend
```bash
cd frontend
npm install
npx next dev -p 3001
# App running at http://localhost:3001
```

> **Offline Mode**: If PostgreSQL is not configured, the system auto-falls back to a JSON mock database (`mock-db-persistence.json` at the project root). Every feature — orders, wallets, reservations, reviews, shifts — works fully in this mode. Data persists across backend restarts.

---

## 🔐 Staff Login Credentials

| Role | Email | Password | Portal URL |
|---|---|---|---|
| Super Admin | `admin@admin` | `admin` | `/super-admin` |
| Admin / Manager | `admin@dineops.com` | `password123` | `/admin` |
| Chef (KDS) | `chef@dineops.com` | `password123` | `/kds` |
| Kitchen Staff (KDS) | `staff@dineops.com` | `password123` | `/kds` |
| Cashier (POS) | `cashier@dineops.com` | `password123` | `/pos` |
| Delivery Rider | `delivery@dineops.com` | `password123` | `/delivery` |
| Customer | `customer@dineops.com` | `password123` | `/` |

> Customers can also self-register via the **Sign Up** form on the homepage.

---

## 🌐 Portal Routes & Access Control

| URL | Portal | Who Can Access |
|---|---|---|
| `/` | Customer Portal | Public / Logged-in Customers |
| `/pos` | POS Cashier Terminal | CASHIER role |
| `/kds` | Kitchen Display System | CHEF, KITCHEN_STAFF roles |
| `/delivery` | Delivery Rider Dashboard | DELIVERY_STAFF role |
| `/admin` | Admin / Operations Panel | ADMIN role |
| `/super-admin` | Super Admin HQ | SUPER_ADMIN role only |

All staff portals are protected by `PortalAuthGuard` — unauthorized access shows a premium "Access Denied" modal instead of a redirect.

---

## 🎯 Features Built — Complete List

---

### 👤 Customer Portal (`/`)

#### 🍽️ Artisan Menu
- Full food catalog across 6 categories: **Breakfast Specials, Italian & Pastas, Gourmet Burgers & Grills, Indian Chaat, Hot Coffee & Beverages, Sweet Endings**
- Each item shows: image, price, dietary tags (Veg 🟢, Keto, Gluten-Free), calories, allergens
- **Search bar** — live filter by name/description
- **Voice search simulation** — click mic → auto-populates a random query
- **Dietary filters** — Veg Only, Keto, Gluten-Free toggles
- **Category tabs** — horizontal scrollable category selector
- **Item customization** — add-ons (portion size, extra toppings) on each item

#### 🛒 Cart & Checkout
- **Multi-item cart** with quantity controls and live price calculation
- **Coupon codes**: `BREWFIRST` (20% off, up to ₹150), `LUXURY50` (flat ₹50), `CHEFSPECIAL` (15% off)
- **Order type**: Dine-In / Pickup / Delivery selection
- **Delivery address** input for delivery orders
- **Cooking notes** field
- **5% GST** auto-calculated, ₹40 delivery fee for delivery orders

#### 💳 Payment Gateway (Cashfree Simulated)
- **UPI** — QR code scanner simulation
- **Card** — Debit/Credit card form with card preview
- **Net Banking** — Bank selection dropdown
- **Wallet** — Shows live Gift Wallet balance; deducts on order placement; blocks if insufficient

#### 📦 My Orders — Live Order Tracker
- Real-time status stepper: `Order Placed → Accepted → Cooking → Ready → Out for Delivery → Delivered`
- Live polling every 3 seconds from backend
- **OTP display** for delivery orders (shown to customer for handover verification)
- **Post-delivery Review Form** — appears once order is `DELIVERED`
  - 5-star interactive star rating
  - Text comment box
  - Submits to backend; prevents duplicate submissions via `localStorage` flag

#### 🗓️ Table Reservations
- **Interactive floor plan** — 15 tables displayed as a visual grid
- Color-coded status: Available (green), Occupied (red), Reserved (amber)
- Select table → fill date, time slot, guest count, special notes → confirm
- Table status updates in real-time on the floor plan

#### 🍱 Meal Subscriptions
- **4 plans**: Weekly Lite (₹1,999), Monthly Student (₹4,500), Premium Monthly (₹8,999), Corporate Team (₹24,999)
- Features listed per plan (calorie counts, delivery times, days)
- Subscribe with one click; stored to user account

#### 🎁 Luxury Gift Vouchers
- **3 denominations**: ₹500, ₹1,000, ₹2,000 — premium card designs
- **Recipient email input** — enter email of registered DineOps user
- On gift: recipient's **Gift Wallet is credited** immediately
- Recipient receives a **bell notification** in their dashboard
- Audit trail stored in `giftCards[]` with sender/recipient info

#### 🤖 AI Concierge Chatbot
- Floating chat bubble (bottom-right corner)
- Context-aware replies for menu recommendations, reservations, dietary questions
- Connects to backend `/api/ops/ai/chat` endpoint
- Offline fallback responses built in

#### 🔔 Notification Center
- Bell icon in the navbar with unread count badge
- Notifications for: order status changes, gift wallet credits, system messages
- Polled from backend every 3 seconds; auto-cleared after viewing

---

### 👤 My Profile Modal

Accessible from the navbar's avatar/profile button on the homepage.

#### Tab 1 — Profile Details
- **Locked fields**: Name, Email (cannot be changed)
- **Editable fields** (click Edit):
  - Date of Birth
  - Anniversary Date
  - Allergies (comma-separated)
  - Home Address (street + city)
  - Office Address (street + city)
- Save changes → persisted to backend

#### Tab 2 — My Wallets & Rewards
- **Loyalty Points** — earned through orders (Bronze → Silver → Gold → Platinum tier)
- **Gift Wallet** — shows balance credited from received gift vouchers; green card with ₹ balance
- If balance > 0: helpful tip "Use at checkout → Pay via Wallet"

#### Tab 3 — My Table Bookings
- Lists all reservations for this user
- Shows: Table number, status badge, date, time slot, guest count, notes

#### Tab 4 — Meal Subscriptions
- Lists active/expired subscription plans
- Shows: Plan name, status, start/end dates, price paid, meals used/total
- Progress bar showing meal consumption percentage

---

### 👑 Super Admin Portal (`/super-admin`)

Protected by login — only `SUPER_ADMIN` role can access.

#### 📊 Analytics Dashboard
- **Revenue KPIs**: Total revenue, today's revenue, average order value
- **Order Stats**: Total orders, pending, delivered, cancelled counts
- **Staff Performance** metrics
- **Live data** refreshed every 5 seconds from backend

#### 👥 Enterprise User Registry
- Full table of every registered user (name, email, role, join date)
- **Role assignment dropdown** per user — change any user's role:
  - Customer → Cashier, Chef, Kitchen Staff, Delivery Rider, Admin, Super Admin
- Changes saved to backend immediately; reflected at next login

#### 🔐 RBAC Permission Matrix
- Full table showing which roles can access which features
- Visual checkmarks across all portal actions

#### ⭐ Customer Reviews Panel (Confidential)
- Shows all reviews submitted post-delivery by customers
- Displays: customer name, email, order number, star rating (visual stars), review text
- **Sentiment badge**: POSITIVE (green), NEUTRAL (grey), NEGATIVE (red) — auto-detected by keyword analysis
- Submission timestamp
- Only visible to Super Admin — not shown in any other portal

#### 🚪 Sign Out
- Premium "Terminate Clearance Session" confirmation modal
- Clears JWT token and user session

---

### 🛠️ Admin / Operations Panel (`/admin`)

Protected login — ADMIN role only.

#### Tab 1 — Inventory Management
- Stock registry table: item name, SKU, current quantity, unit, min stock level, supplier
- **Low stock alerts** highlighted in red when quantity < min level
- **Quick movement form**: select item → IN (restock) or OUT (waste/usage) → enter quantity → submit
- Inventory deducted automatically when orders are placed

#### Tab 2 — Staff Attendance & Shifts
- Lists all staff members with today's shift data
- Shows: Name, role, shift start/end time, check-in/check-out time, status (SCHEDULED / ACTIVE / COMPLETED / ABSENT)
- **Clock In / Clock Out** buttons per shift
- Auto-populated daily shifts for all non-customer roles (CHEF, CASHIER, DELIVERY_STAFF, KITCHEN_STAFF, ADMIN)

#### Tab 3 — Table Reservations Manager
- Full list of all table bookings across all customers
- Shows: Table number, booking status badge, customer name, email, date, time slot, guest count, special notes
- **Inline Edit mode**: click ✏️ to edit status, date, time slot, guest count → Save
- **Cancel button** 🗑️ to permanently delete a booking
- Refresh button to reload from backend

---

### 🍳 Kitchen Display System — KDS (`/kds`)

Protected login — CHEF / KITCHEN_STAFF roles.

- **Live order queue** showing all non-delivered orders
- Each order card shows: order number, type, items list with quantities, cooking notes
- **Status progression buttons**:
  - `ACCEPTED` → `COOKING` → `READY` → `DELIVERED`
- Status updates immediately on backend; customer sees update in My Orders tracker
- Auto-refreshes every 3 seconds

---

### 💳 POS Cashier Terminal (`/pos`)

Protected login — CASHIER role only.

- Full point-of-sale interface for walk-in customers
- **Menu grid** — browse and add items to bill
- **Cart panel** — running total with quantity controls
- **Discount application**
- **Coupon support**
- **Print receipt** simulation
- Order type: Dine-In / Takeaway

---

### 🚴 Delivery Rider Portal (`/delivery`)

Protected login — DELIVERY_STAFF role only.

- Shows only orders assigned to the logged-in delivery rider
- Order cards display: customer name, address, order items, total
- **Status controls**:
  - Mark as `OUT_FOR_DELIVERY`
  - **OTP Verification** — enter customer's OTP to confirm handover
  - Mark as `DELIVERED` (only after OTP verified)
- Prevents marking delivered without OTP match

---

## 💡 Platform-Wide Systems

### 🔐 Authentication & RBAC
- JWT-based login with `email + password`
- Role stored in JWT payload — verified on every protected route
- Roles: `CUSTOMER`, `CASHIER`, `CHEF`, `KITCHEN_STAFF`, `DELIVERY_STAFF`, `ADMIN`, `SUPER_ADMIN`
- `PortalAuthGuard` component wraps every staff portal — shows premium sign-in modal if not authenticated or wrong role
- Sign-out clears localStorage token and reloads

### 💰 Gift Wallet System
- Gift vouchers bought by User A for User B's registered email
- Wallet balance (`cashbackBalance`) stored directly on the user record — reliable, isolated from table bookings
- `GET /api/auth/profile` always returns correct wallet balance
- At checkout → "Pay via Wallet" deducts from balance with insufficient-balance error guard
- Notification pushed to recipient's bell the moment voucher is sent

### 🔔 Real-Time Notification System
- Notifications stored in `user.notifications[]` array on backend
- Frontend polls `GET /api/auth/notifications` every 3 seconds
- Notifications auto-cleared from backend after delivery (one-time read)
- Triggers: order status changes, gift wallet credits

### 🗄️ Persistent Mock Database
- When PostgreSQL is unavailable, all data auto-persists to `mock-db-persistence.json` in the project root
- Saved every 2 seconds via `setInterval`
- Covers: users (with wallet/loyalty), orders, reservations, reviews, inventory, shifts, gift cards, subscriptions
- Delete the file to **reset all data** to clean seed state

### 🎨 Premium UI System
- Dark carbon/metallic theme: `#0d0a07` backgrounds, amber `#f59e0b` accents
- Glassmorphism panels with `backdrop-blur`
- Framer Motion page transitions and modal animations
- Premium center-page alert modals (zero browser `alert()` calls anywhere)
- Micro-animations: hover effects, shimmer loaders, spinning indicators
- Fully responsive — mobile through widescreen

---

## 📁 Project Structure

```
food/
├── backend/
│   └── src/
│       ├── auth/
│       │   ├── auth.controller.ts      # Login, signup, profile, notifications, user roles
│       │   └── auth.service.ts         # JWT auth, wallet read/write, profile CRUD
│       ├── orders/
│       │   ├── orders.controller.ts    # Place order, get orders, update status, OTP verify
│       │   └── orders.service.ts       # Order creation, coupon, inventory deduction, wallet deduction
│       ├── menu/
│       │   ├── menu.controller.ts      # Categories & menu items CRUD
│       │   └── menu.service.ts
│       ├── operations/
│       │   ├── operations.controller.ts # Tables, inventory, shifts, AI, payments, reservations, reviews, gifting
│       │   └── operations.service.ts   # All ops logic — gift voucher credit, review sentiment, table mgmt
│       └── prisma/
│           ├── mock-db.service.ts      # In-memory mock database with disk persistence + seeding
│           └── prisma.service.ts       # Prisma ORM (used when DB is available)
│
├── frontend/
│   └── src/app/
│       ├── page.tsx                    # Main app shell — routing, sync loop, notification polling
│       ├── components/
│       │   ├── CustomerPortal.tsx      # Full customer UI (menu, cart, checkout, gifting, reservations)
│       │   ├── MyOrdersModal.tsx       # Live order tracker + review form
│       │   ├── MyProfileModal.tsx      # Profile tabs (details, wallet, bookings, subscriptions)
│       │   ├── InventoryStaff.tsx      # Admin tabs (inventory, attendance, table reservations)
│       │   ├── AnalyticsDashboard.tsx  # Super Admin revenue and order analytics
│       │   ├── RBACMatrix.tsx          # Role permission matrix visualization
│       │   ├── PortalAuthGuard.tsx     # Auth wrapper for all staff portals
│       │   └── PremiumAlertModal.tsx   # Reusable center-page alert (replaces all browser alerts)
│       ├── super-admin/page.tsx        # Super Admin HQ (analytics + users + reviews)
│       ├── admin/page.tsx              # Admin operations panel
│       ├── kds/page.tsx                # Kitchen display system
│       ├── pos/page.tsx                # POS cashier terminal
│       └── delivery/page.tsx           # Delivery rider dashboard
│
├── mock-db-persistence.json            # Auto-generated persistent mock DB (delete to reset)
├── schema.sql                          # PostgreSQL schema reference
├── docker-compose.yml                  # Docker setup for PostgreSQL
└── README.md                           # This file
```

---

## 🧪 Key Test Flows

### End-to-End Order
1. Sign in as `customer@dineops.com`
2. Add items to cart → Apply coupon `BREWFIRST` → Choose Delivery → Pay via UPI
3. Open **My Orders** → watch status update live as KDS advances it
4. Log in as `delivery@dineops.com` → enter OTP → mark DELIVERED
5. Back as customer → **My Orders** shows review form → submit rating + comment
6. Log in as `admin@admin` → Super Admin → **Customer Reviews** panel shows the review

### Gift Wallet Flow
1. Log in as Customer A → Luxury Gifting tab → enter Customer B's email → Gift ₹500
2. Log in as Customer B → bell 🔔 shows "Gift Wallet Credit Received!"
3. Open **My Profile** → **Gift Wallet** shows ₹500
4. Add items to cart → Checkout → **Pay via Wallet** → balance deducted

### Table Reservation Flow
1. Log in as customer → Reserve a Table → pick date, time, guests
2. Open **My Profile → Tables tab** → booking appears with status
3. Log in as `admin@dineops.com` → Admin panel → **Table Reservations tab** → edit or cancel booking

### Role Assignment Flow
1. Register a new customer account
2. Log in as `admin@admin` → Super Admin → **User Registry**
3. Change their role to `CHEF`
4. That user can now log in and access `/kds`

### Attendance & Shifts
1. Log in as `admin@dineops.com` → Admin → **Staff Attendance tab**
2. All staff shifts auto-populated for today
3. Click **Clock In / Clock Out** to update shift status

---

## 🔑 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login — returns JWT token |
| GET | `/api/auth/profile` | Get current user profile (wallet, loyalty, reservations) |
| PUT | `/api/auth/profile` | Update profile (address, DOB, allergies) |
| GET | `/api/auth/users` | List all users (Super Admin) |
| PUT | `/api/auth/users/:id/role` | Assign role to user |
| GET | `/api/auth/notifications` | Fetch & clear pending notifications |
| GET | `/api/menu/categories` | Get menu categories |
| GET | `/api/menu/items` | Get all menu items |
| POST | `/api/orders/place` | Place a new order |
| GET | `/api/orders` | Get all orders |
| PUT | `/api/orders/:id/status` | Update order status (KDS / Delivery) |
| POST | `/api/orders/:id/otp-verify` | Verify OTP for delivery handover |
| GET | `/api/ops/tables` | Get all tables with status |
| POST | `/api/ops/tables/reserve` | Reserve a table |
| GET | `/api/ops/reservations` | Get all reservations (Admin) |
| PUT | `/api/ops/reservations/:id` | Edit a reservation |
| DELETE | `/api/ops/reservations/:id` | Cancel a reservation |
| GET | `/api/ops/inventory` | Get inventory items |
| POST | `/api/ops/inventory/movement` | Record stock in/out movement |
| GET | `/api/ops/shifts` | Get staff shifts |
| PUT | `/api/ops/shifts/:id/clock` | Clock in / Clock out |
| POST | `/api/ops/reviews` | Submit a customer review |
| GET | `/api/ops/reviews` | Get all reviews (Super Admin) |
| POST | `/api/ops/gift-vouchers/purchase` | Purchase & credit a gift voucher |
| POST | `/api/ops/ai/chat` | AI Concierge chatbot reply |

---

© 2026 DineOps • Premium Dining Platform • Built with ❤️ by Vishal Soni
