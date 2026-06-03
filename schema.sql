-- BrewHub Enterprise PostgreSQL Schema Migration Script
-- Copy and paste this directly into your Supabase SQL Editor.

-- Drop existing tables if they exist (clean setup)
DROP TABLE IF EXISTS "AuditLog" CASCADE;
DROP TABLE IF EXISTS "Review" CASCADE;
DROP TABLE IF EXISTS "MealSubscription" CASCADE;
DROP TABLE IF EXISTS "GiftCard" CASCADE;
DROP TABLE IF EXISTS "Coupon" CASCADE;
DROP TABLE IF EXISTS "StaffShift" CASCADE;
DROP TABLE IF EXISTS "InventoryMovement" CASCADE;
DROP TABLE IF EXISTS "InventoryItem" CASCADE;
DROP TABLE IF EXISTS "OrderItem" CASCADE;
DROP TABLE IF EXISTS "Order" CASCADE;
DROP TABLE IF EXISTS "TableReservation" CASCADE;
DROP TABLE IF EXISTS "Table" CASCADE;
DROP TABLE IF EXISTS "CustomizationOption" CASCADE;
DROP TABLE IF EXISTS "CustomizationGroup" CASCADE;
DROP TABLE IF EXISTS "MenuItem" CASCADE;
DROP TABLE IF EXISTS "MenuCategory" CASCADE;
DROP TABLE IF EXISTS "Branch" CASCADE;
DROP TABLE IF EXISTS "Profile" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

DROP TYPE IF EXISTS "Role" CASCADE;
DROP TYPE IF EXISTS "OrderStatus" CASCADE;
DROP TYPE IF EXISTS "OrderType" CASCADE;
DROP TYPE IF EXISTS "TableStatus" CASCADE;
DROP TYPE IF EXISTS "MovementType" CASCADE;
DROP TYPE IF EXISTS "ShiftStatus" CASCADE;
DROP TYPE IF EXISTS "DiscountType" CASCADE;
DROP TYPE IF EXISTS "LoyaltyTier" CASCADE;

-- Create Enums
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'CHEF', 'KITCHEN_STAFF', 'CASHIER', 'DELIVERY_STAFF', 'SUPPORT_STAFF', 'CUSTOMER');
CREATE TYPE "OrderStatus" AS ENUM ('ORDER_PLACED', 'PAYMENT_PENDING', 'PAYMENT_CONFIRMED', 'ACCEPTED', 'PREPARING', 'COOKING', 'PACKED', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUNDED');
CREATE TYPE "OrderType" AS ENUM ('PICKUP', 'DELIVERY', 'DINE_IN');
CREATE TYPE "TableStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'RESERVED');
CREATE TYPE "MovementType" AS ENUM ('IN', 'OUT', 'WASTE');
CREATE TYPE "ShiftStatus" AS ENUM ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'ABSENT');
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');
CREATE TYPE "LoyaltyTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM');

-- Create Tables

CREATE TABLE "User" (
  "id" VARCHAR(255) PRIMARY KEY,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(50),
  "role" "Role" DEFAULT 'CUSTOMER'::"Role" NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE "Profile" (
  "id" VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "addresses" JSONB,
  "allergies" VARCHAR(255)[],
  "loyaltyPoints" INTEGER DEFAULT 0 NOT NULL,
  "loyaltyTier" "LoyaltyTier" DEFAULT 'BRONZE'::"LoyaltyTier" NOT NULL,
  "cashbackBalance" DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
  "birthDate" TIMESTAMP,
  "anniversaryDate" TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE "Branch" (
  "id" VARCHAR(255) PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "address" VARCHAR(255) NOT NULL,
  "city" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(50) NOT NULL,
  "active" VARCHAR(50) DEFAULT 'true' NOT NULL,
  "managerId" VARCHAR(255) UNIQUE REFERENCES "User"("id") ON DELETE SET NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE "MenuCategory" (
  "id" VARCHAR(255) PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "image" TEXT,
  "sortOrder" INTEGER DEFAULT 0 NOT NULL
);

CREATE TABLE "MenuItem" (
  "id" VARCHAR(255) PRIMARY KEY,
  "categoryId" VARCHAR(255) NOT NULL REFERENCES "MenuCategory"("id") ON DELETE CASCADE,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "price" DECIMAL(10, 2) NOT NULL,
  "image" TEXT,
  "isVeg" BOOLEAN DEFAULT true NOT NULL,
  "isVegan" BOOLEAN DEFAULT false NOT NULL,
  "isGlutenFree" BOOLEAN DEFAULT false NOT NULL,
  "isKeto" BOOLEAN DEFAULT false NOT NULL,
  "calories" INTEGER,
  "protein" INTEGER,
  "carbohydrates" INTEGER,
  "fat" INTEGER,
  "allergens" VARCHAR(255)[],
  "isPopular" BOOLEAN DEFAULT false NOT NULL,
  "isTrending" BOOLEAN DEFAULT false NOT NULL,
  "active" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE "CustomizationGroup" (
  "id" VARCHAR(255) PRIMARY KEY,
  "menuItemId" VARCHAR(255) NOT NULL REFERENCES "MenuItem"("id") ON DELETE CASCADE,
  "name" VARCHAR(255) NOT NULL,
  "minSelect" INTEGER DEFAULT 0 NOT NULL,
  "maxSelect" INTEGER DEFAULT 1 NOT NULL
);

CREATE TABLE "CustomizationOption" (
  "id" VARCHAR(255) PRIMARY KEY,
  "groupId" VARCHAR(255) NOT NULL REFERENCES "CustomizationGroup"("id") ON DELETE CASCADE,
  "name" VARCHAR(255) NOT NULL,
  "price" DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
  "isDefault" BOOLEAN DEFAULT false NOT NULL
);

CREATE TABLE "Table" (
  "id" VARCHAR(255) PRIMARY KEY,
  "branchId" VARCHAR(255) NOT NULL REFERENCES "Branch"("id") ON DELETE CASCADE,
  "tableNumber" VARCHAR(50) NOT NULL,
  "capacity" INTEGER NOT NULL,
  "status" "TableStatus" DEFAULT 'AVAILABLE'::"TableStatus" NOT NULL,
  "waiterNeeded" BOOLEAN DEFAULT false NOT NULL,
  "billRequested" BOOLEAN DEFAULT false NOT NULL,
  "qrCode" TEXT
);

CREATE TABLE "TableReservation" (
  "id" VARCHAR(255) PRIMARY KEY,
  "tableId" VARCHAR(255) REFERENCES "Table"("id") ON DELETE SET NULL,
  "userId" VARCHAR(255) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "guestCount" INTEGER NOT NULL,
  "reservationDate" TIMESTAMP NOT NULL,
  "timeSlot" VARCHAR(100) NOT NULL,
  "status" VARCHAR(50) DEFAULT 'PENDING' NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE "Order" (
  "id" VARCHAR(255) PRIMARY KEY,
  "branchId" VARCHAR(255) NOT NULL REFERENCES "Branch"("id") ON DELETE RESTRICT,
  "customerId" VARCHAR(255) REFERENCES "User"("id") ON DELETE SET NULL,
  "deliveryStaffId" VARCHAR(255) REFERENCES "User"("id") ON DELETE SET NULL,
  "tableId" VARCHAR(255) REFERENCES "Table"("id") ON DELETE SET NULL,
  "orderNumber" VARCHAR(255) UNIQUE NOT NULL,
  "status" "OrderStatus" DEFAULT 'ORDER_PLACED'::"OrderStatus" NOT NULL,
  "type" "OrderType" DEFAULT 'DELIVERY'::"OrderType" NOT NULL,
  "subtotal" DECIMAL(10, 2) NOT NULL,
  "tax" DECIMAL(10, 2) NOT NULL,
  "deliveryFee" DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
  "discount" DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
  "total" DECIMAL(10, 2) NOT NULL,
  "paymentMethod" VARCHAR(100) DEFAULT 'CARD' NOT NULL,
  "paymentStatus" VARCHAR(100) DEFAULT 'PENDING' NOT NULL,
  "paymentTransactionId" VARCHAR(255),
  "cookingNotes" TEXT,
  "deliveryNotes" TEXT,
  "deliveryAddress" TEXT,
  "otp" VARCHAR(50),
  "otpVerified" BOOLEAN DEFAULT false NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE "OrderItem" (
  "id" VARCHAR(255) PRIMARY KEY,
  "orderId" VARCHAR(255) NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
  "menuItemId" VARCHAR(255) NOT NULL REFERENCES "MenuItem"("id") ON DELETE RESTRICT,
  "quantity" INTEGER NOT NULL,
  "price" DECIMAL(10, 2) NOT NULL,
  "customizations" JSONB,
  "subtotal" DECIMAL(10, 2) NOT NULL
);

CREATE TABLE "InventoryItem" (
  "id" VARCHAR(255) PRIMARY KEY,
  "branchId" VARCHAR(255) NOT NULL REFERENCES "Branch"("id") ON DELETE CASCADE,
  "name" VARCHAR(255) NOT NULL,
  "sku" VARCHAR(255) UNIQUE NOT NULL,
  "quantity" DECIMAL(10, 2) NOT NULL,
  "unit" VARCHAR(50) NOT NULL,
  "minStockLevel" DECIMAL(10, 2) NOT NULL,
  "supplierName" VARCHAR(255),
  "supplierEmail" VARCHAR(255),
  "expiryDate" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE "InventoryMovement" (
  "id" VARCHAR(255) PRIMARY KEY,
  "inventoryItemId" VARCHAR(255) NOT NULL REFERENCES "InventoryItem"("id") ON DELETE CASCADE,
  "type" "MovementType" NOT NULL,
  "quantity" DECIMAL(10, 2) NOT NULL,
  "reason" VARCHAR(255),
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE "StaffShift" (
  "id" VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "branchId" VARCHAR(255) NOT NULL REFERENCES "Branch"("id") ON DELETE CASCADE,
  "startTime" TIMESTAMP NOT NULL,
  "endTime" TIMESTAMP NOT NULL,
  "checkIn" TIMESTAMP,
  "checkOut" TIMESTAMP,
  "status" "ShiftStatus" DEFAULT 'SCHEDULED'::"ShiftStatus" NOT NULL,
  "hourlyRate" DECIMAL(10, 2) DEFAULT 15.00 NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE "Coupon" (
  "id" VARCHAR(255) PRIMARY KEY,
  "code" VARCHAR(255) UNIQUE NOT NULL,
  "discountType" "DiscountType" NOT NULL,
  "value" DECIMAL(10, 2) NOT NULL,
  "minOrderValue" DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
  "maxDiscount" DECIMAL(10, 2),
  "expiresAt" TIMESTAMP NOT NULL,
  "active" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE "GiftCard" (
  "id" VARCHAR(255) PRIMARY KEY,
  "code" VARCHAR(255) UNIQUE NOT NULL,
  "userId" VARCHAR(255) REFERENCES "User"("id") ON DELETE SET NULL,
  "initialBalance" DECIMAL(10, 2) NOT NULL,
  "currentBalance" DECIMAL(10, 2) NOT NULL,
  "active" BOOLEAN DEFAULT true NOT NULL,
  "message" TEXT,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE "MealSubscription" (
  "id" VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "planName" VARCHAR(255) NOT NULL,
  "active" BOOLEAN DEFAULT true NOT NULL,
  "startDate" TIMESTAMP DEFAULT NOW() NOT NULL,
  "endDate" TIMESTAMP NOT NULL,
  "mealsTotal" INTEGER NOT NULL,
  "mealsUsed" INTEGER DEFAULT 0 NOT NULL,
  "pricePaid" DECIMAL(10, 2) NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE "Review" (
  "id" VARCHAR(255) PRIMARY KEY,
  "menuItemId" VARCHAR(255) NOT NULL REFERENCES "MenuItem"("id") ON DELETE CASCADE,
  "userId" VARCHAR(255) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "rating" INTEGER NOT NULL,
  "comment" TEXT,
  "sentiment" VARCHAR(50),
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE "AuditLog" (
  "id" VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) REFERENCES "User"("id") ON DELETE SET NULL,
  "action" VARCHAR(255) NOT NULL,
  "resource" VARCHAR(255) NOT NULL,
  "ipAddress" VARCHAR(100),
  "details" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Seed initial test accounts (Passwords are pre-hashed 'password123')
INSERT INTO "User" ("id", "email", "password", "name", "role")
VALUES 
('user-superadmin', 'admin@admin', 'admin', 'Vikram Aditya (Super Admin)', 'SUPER_ADMIN')
ON CONFLICT DO NOTHING;

INSERT INTO "User" ("id", "email", "password", "name", "role")
VALUES 
('user-customer', 'customer@brewhub.com', '$2b$10$tZ2K5H91a457491024823u347209428238', 'Vishaal Kumar', 'CUSTOMER')
ON CONFLICT DO NOTHING;
