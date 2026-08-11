# Ghana Garrison Schools SMS - Frontend Documentation

## 1. Project Overview
The **Ghana Garrison Schools Management System (SMS)** is a high-performance, enterprise-grade administrative portal designed for the Ghana Armed Forces educational directorate. It follows an "Executive Intelligence" design language, prioritizing clarity, security, and tactical data oversight.

### Tech Stack
- **Framework**: Next.js 15.3 (App Router)
- **Runtime**: React 19 (RC)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI (Radix UI Primitives)
- **State Management**: React Context API & Hooks
- **Data Fetching**: Axios with custom interceptors for Auth
- **Forms**: React Hook Form + Zod Validation
- **Charts**: Recharts

---

## 2. Architecture & Directory Structure

### `/src/app` (Routing)
- **`(auth)`**: Authentication layer (Login, Registration, Change Password).
- **`(dashboard)`**: The core authenticated application.
    - **`admin`**: System configuration (Schools, Classes, User Management).
    - **`assessments`**: Entrance exams, results, and shortlisting.
    - **`fees`**: Treasury Registry, POS Store, Expense Tracking, Ledger.
    - **`students`**: Student directory, ID card generation, Exeat/Leave logs.
    - **`super-admin`**: High-level governance, Garrison management, System-wide settings.
- **`print`**: Dedicated lightweight routes for PDF receipt and report generation.

### `/src/components` (UI)
- **`layout`**: Persistent elements (Sidebar, Page Headers, Global Header).
- **`ui`**: Atomic Shadcn components (Buttons, Inputs, Dialogs, Tables).
- **`chart-blocks`**: Complex dashboard visualization widgets.

### `/src/services` (API Layer)
Centralized API communication logic using Axios. Key services include:
- `auth.ts`: Session management and JWT handling.
- `dashboard.ts`: Complex financial and operational metric aggregation.
- `registrations.ts`: Applicant induction logic.
- `receipt.ts`: Treasury transaction processing.

---

## 3. Core Functional Modules

### 🏛️ Command Hub (Dashboard)
- **Overview**: Real-time monitor for Total Collections, Arrears, and Expenditure.
- **Treasury Intel**: Detailed revenue breakdown by category (Levy, Books, Uniforms).
- **Operations**: Capacity oversight showing classroom slot utilization across Garrison units.

### 💳 Treasury & Finance
- **Registry**: Comprehensive log of all institutional payments.
- **POS Store**: Inventory management system for uniforms and books with direct "Debit/Credit" sales capability.
- **Debt Ledger**: Tactical tracking of student arrears with automated balance calculation.

### 💂 Personnel & Enrollment
- **Induction Registry**: Workflow for managing new applicants from registration to admission.
- **Student Directory**: Full lifecycle management of active personnel, including Exeat (Leave) protocols and promotion logic.

### ⚙️ Institutional Governance
- **Garrison Management**: Super Admin control over Battalion nodes (1BN - 6BN).
- **Access Management**: Granular Role-Based Access Control (RBAC) for Commanders, Admins, and Staff.
- **Branding**: Dynamic logo and header configuration that synchronizes across all generated documents.

---

## 4. Visual Standards (Executive Intelligence)

The frontend adheres to a strict professional aesthetic:
- **Typography**: Clean Sans-Serif (Inter/Geist) with semantic weights (`font-bold` for titles, `font-medium` for UI labels).
- **Cards**: Minimalist `shadow-sm` borders with `rounded-xl` to `rounded-[2rem]` corners for a modern feel.
- **Tables**: High-density data grids with professional pagination and integrated filtering.
- **Theme**: Dark-mode optimized with high-contrast "Command" accents (Indigo, Emerald, Rose).

---

## 5. Security & Authentication

- **JWT Strategy**: Tokens are stored in secure storage and attached via Axios interceptors.
- **Role Normalization**: Unified role checking (e.g., `garrisondirector`) ensures consistent access control across the frontend and backend.
- **Protected Routes**: Middleware and Layout-level guards prevent unauthorized access to sensitive Command sectors.

---

## 6. Developer Workflow

### Development Commands
```bash
npm run dev          # Start development server (Webpack)
npm run dev -- --turbo # Start development server (Turbopack - Recommended)
npm run build        # Production build
```

### Key Configurations
- `tailwind.config.ts`: Defines the project's tactical color palette and custom border radius.
- `next.config.ts`: Handles API rewrites and optimized package imports for icons.
