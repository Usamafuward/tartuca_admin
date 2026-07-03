# Tartuca Admin Portal (`tartuca_admin`)

This is the secure, back-office administration dashboard where restaurant managers and employees can oversee and complete orders, view dining-table reservations, modify active menu items and pricing, schedule special offers, and edit restaurant properties.

## 🚀 Features

* **Real-time Order Fulfillment**: View current customer order details, transition orders through states (Pending, Preparing, Out for Delivery, Completed), and view driver paths.
* **Reservation Organizers**: Manage customer-booked tables with full search and filtering controls.
* **Menu Operations**: Comprehensive CRUD panel to add new dishes, update prices, upload image routes, and group menu items by category.
* **Special Offer Scheduler**: Create, publish, and delete discount codes or promotions directly from the admin dashboard.
* **Secure Access**: Role-guarded Auth0 authentication to prevent unauthorized users from accessing backend admin APIs.

---

## 🛠️ Setup Instructions

### 1. Prerequisites
Make sure you have **Node.js (v18+)** and **pnpm** installed:
```bash
corepack enable pnpm # If pnpm is not already installed globally
```

### 2. Environment Configuration
Create an `.env` file in this directory (`tartuca_admin/`):
```env
VITE_AUTH0_DOMAIN=<your-auth0-domain>.auth0.com
VITE_AUTH0_CLIENT_ID=<your-admin-client-id>
VITE_AUTH0_AUDIENCE=https://api.tartuca.com
```

### 3. Installation
Install all dependencies:
```bash
pnpm install
```

### 4. Running the Development Server
```bash
pnpm run dev
```

The application will launch at `http://localhost:5173` (or the fallback local host indicated in your terminal).

---

## 📂 Project Structure

```
tartuca_admin/
├── src/
│   ├── main.jsx          # Entry point
│   ├── App.jsx           # App layout and route mapping
│   ├── index.css         # Tailwind & global styles
│   ├── components/       # Custom reusable components
│   │   ├── admin/        # Sidebar, TopBar, and admin layout structures
│   │   ├── common/       # Toast notification UI
│   │   └── layout/       # Standard back-office layout template
│   ├── context/          # State management (Toast message handlers)
│   ├── pages/            # Dashboard view interfaces
│   │   ├── Dashboard.jsx     # Sales metrics and charts overview
│   │   ├── Gallery.jsx       # Public photo manager
│   │   ├── LoginPage.jsx
│   │   ├── Menu.jsx          # Category items CRUD
│   │   ├── Orders.jsx        # Real-time order coordinator
│   │   ├── Reservations.jsx  # Dining reservation logs
│   │   ├── Reviews.jsx       # Customer review manager
│   │   ├── Settings.jsx      # Operation variables and opening hours
│   │   └── SpecialOffers.jsx # Active promo/discounts control
│   └── services/
│       └── api.js        # Configured Axios layer with JWT headers
```

