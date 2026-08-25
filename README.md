# ShopSphere — Full-Stack E-Commerce Platform

A production-style e-commerce web application built as a full-stack capstone project. Customers can browse, search, filter, and purchase products, and track their order history; admins can manage inventory and order fulfillment through a dedicated dashboard.

The entire stack — frontend, backend, and MongoDB — runs with one command via Docker, and is also fully runnable locally with Node.js.

---

## 🛠️ Tech Stack

**Frontend**

- React 19 + TypeScript + Vite
- Tailwind CSS
- React Router v7
- Axios
- lucide-react (icons)
- react-hot-toast (notifications)

**Backend**

- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT authentication with Role-Based Access Control (Customer / Admin)
- Multer (image uploads)
- bcryptjs (password hashing)

**Testing**

- Backend: Jest + Supertest + mongodb-memory-server (unit + integration)
- Frontend: Jest + React Testing Library + MSW (Mock Service Worker)

**DevOps**

- Docker + docker-compose — multi-stage builds for both services, orchestrated with MongoDB, verified end-to-end (see [Docker Setup](#-docker-setup))

---

## ✨ Features

- Product catalog with search, category filtering, price range filtering, sorting, and pagination
- Shopping cart with persistent, per-user state and atomic stock validation
- JWT-based authentication with Customer / Admin roles (no client-side role self-assignment)
- Checkout flow with shipping details, order summary, and atomic per-item stock decrement (with automatic rollback if any item in the order is out of stock)
- Customer order history (`/orders`) — view all past orders with expandable line items, shipping address, and price breakdown
- Admin dashboard: full product CRUD with multi-image upload, order management with status updates
- Responsive, modern UI with glassmorphism navbar, skeleton loaders, toast notifications, and empty states
- Automated backend test suite: unit tests (pure logic) + integration tests (real HTTP requests against an in-memory MongoDB)
- Automated frontend test suite: component tests with a fully mocked API layer (MSW), covering auth, cart, and checkout flows

---

## 📂 Project Structure

ecommerce-capstone/
├── backend/
│ ├── src/
│ │ ├── config/ # Database connection
│ │ ├── models/ # Mongoose schemas (User, Product, Cart, Order)
│ │ ├── controllers/ # Route handler logic
│ │ ├── middleware/ # Auth, upload, error handling
│ │ ├── routes/ # Express route definitions
│ │ ├── utils/ # JWT token generation
│ │ ├── scripts/ # seed.ts, clearDB.ts
│ │ ├── tests/
│ │ │ ├── unit/ # generateToken, errorMiddleware
│ │ │ └── integration/ # auth, product, cart, order (Supertest)
│ │ ├── app.ts # Express app configuration
│ │ └── server.ts # Server entry point
│ ├── uploads/ # Uploaded product images (gitignored; .gitkeep tracked)
│ ├── .env.example
│ └── Dockerfile
│
├── frontend/
│ ├── src/
│ │ ├── components/ # Layout, UI, and product components
│ │ ├── pages/ # Route-level pages (incl. pages/admin/, OrderHistory.tsx)
│ │ ├── context/ # AuthContext, CartContext
│ │ ├── services/ # API call wrappers (axios)
│ │ ├── types/ # Shared TypeScript interfaces
│ │ ├── utils/ # getImageUrl (resolves uploaded image URLs via VITE_ASSET_URL)
│ │ ├── mocks/ # MSW handlers + mock data (testing)
│ │ ├── test-utils/ # renderWithProviders test helper
│ │ ├── App.tsx
│ │ └── main.tsx
│ ├── babel.config.cjs # Transpiles MSW's ESM-only deps for Jest (see note below)
│ ├── jest.config.cjs
│ ├── jest.polyfills.ts
│ ├── jest.setup.ts
│ ├── .env.example
│ └── Dockerfile
│
├── docker-compose.yml
├── .gitignore
└── README.md

---

## ✅ Prerequisites

- Node.js v18+ and npm
- MongoDB (local install, or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster) — not needed if using Docker
- Git
- Docker + Docker Compose — only needed for the [Docker setup](#-docker-setup)

---

## 🚀 Getting Started (Local Development)

### 1. Clone the repository

```bash
git clone https://github.com/FahdHamza47/ecommerce-capstone.git
cd ecommerce-capstone
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in your own values — in particular, generate a real `JWT_SECRET` rather than using a placeholder:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=paste_the_generated_value_here
NODE_ENV=development
```

Seed the database with a demo admin, a demo customer, and sample products:

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

The API will be running at `http://localhost:5000`. Confirm it's alive:

```bash
curl http://localhost:5000/api/health
```

### 3. Frontend setup

In a new terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app will be running at `http://localhost:5173`.

---

## 🔑 Test Accounts

Created automatically by `npm run seed` in the backend:

| Role     | Email             | Password |
| -------- | ----------------- | -------- |
| Admin    | admin@example.com | admin123 |
| Customer | user@example.com  | user123  |

> ⚠️ These are intentionally simple demo credentials for local evaluation only. Never reuse this pattern in a real deployment — see [Security Notes](#-security-notes) below.

---

## 🧪 Running Tests

### Backend (Jest + Supertest)

```bash
cd backend
npm test              # run all tests once
npm run test:watch    # re-run on file changes
npm run test:coverage # generate a coverage report
```

Covers: authentication, product CRUD/search/filter/pagination, cart operations (add/update/remove/clear, stock validation), order placement (including atomic stock decrement and rollback on partial failure), admin-only access control, and error-handling middleware — 7 test suites across unit and integration layers.

Uses `mongodb-memory-server` to spin up a temporary, in-memory MongoDB instance — your real database is never touched during test runs.

### Frontend (Jest + React Testing Library + MSW)

```bash
cd frontend
npm test
```

Covers: `ProductCard` rendering, `Login` (validation, success, and failure paths), `CartPage` (quantity updates, item removal, clearing), and `Checkout` (order submission and failure handling) — 4 test suites, all exercising real user interactions against a mocked API layer, not implementation details.

> **Note on frontend test tooling:** MSW's newer versions ship some dependencies as ESM-only modules, which Jest's default CommonJS transform can't parse out of the box. `babel.config.cjs`, and the `transform`/`transformIgnorePatterns`/`testEnvironmentOptions` settings in `jest.config.cjs`, exist specifically to bridge this gap — along with a `WritableStream` polyfill in `jest.polyfills.ts` and an `import.meta.env` mock (`ts-jest-mock-import-meta`) for Vite compatibility under Jest. If you upgrade `msw` in the future and tests suddenly fail to parse, this is the first place to look.

---

## 📡 API Overview

| Method | Endpoint                   | Access        | Description                                           |
| ------ | -------------------------- | ------------- | ----------------------------------------------------- |
| POST   | `/api/auth/register`       | Public        | Register a new customer account                       |
| POST   | `/api/auth/login`          | Public        | Log in, receive a JWT                                 |
| GET    | `/api/auth/profile`        | Authenticated | Get the logged-in user's profile                      |
| GET    | `/api/products`            | Public        | List products (search/filter/sort/paginate)           |
| GET    | `/api/products/categories` | Public        | List distinct product categories                      |
| GET    | `/api/products/:id`        | Public        | Get a single product                                  |
| POST   | `/api/products`            | Admin         | Create a product (with image upload)                  |
| PUT    | `/api/products/:id`        | Admin         | Update a product                                      |
| DELETE | `/api/products/:id`        | Admin         | Delete a product                                      |
| GET    | `/api/cart`                | Authenticated | Get the current user's cart                           |
| POST   | `/api/cart`                | Authenticated | Add an item to the cart                               |
| PUT    | `/api/cart/:productId`     | Authenticated | Update an item's quantity                             |
| DELETE | `/api/cart/:productId`     | Authenticated | Remove an item from the cart                          |
| DELETE | `/api/cart`                | Authenticated | Clear the entire cart                                 |
| POST   | `/api/orders`              | Authenticated | Place an order (atomically decrements stock per item) |
| GET    | `/api/orders/myorders`     | Authenticated | Get the logged-in user's orders                       |
| GET    | `/api/orders`              | Admin         | Get all orders in the store                           |
| PUT    | `/api/orders/:id/status`   | Admin         | Update an order's fulfillment status                  |

---

## 🐳 Docker Setup

The entire stack — MongoDB, backend, and frontend — runs with a single command, verified end-to-end (no local Node.js or MongoDB installation required).

1. Create a `.env` file in the **project root** (not `backend/` or `frontend/`) containing just:

```env
   JWT_SECRET=paste_a_generated_secret_here
```

2. From the project root:

```bash
   docker compose up --build
```

3. Visit `http://localhost:5173`.

This starts three containers: `mongo` (with a healthcheck gating backend startup), `backend` (Express API on port 5000), and `frontend` (built with Vite, served via Nginx on port 5173, proxying to the backend). Both application Dockerfiles use multi-stage builds and `npm ci` for reproducible installs from the committed lockfiles. Uploaded product images persist across container restarts via a named volume (`backend-uploads`).

See `docker-compose.yml` and the `Dockerfile` in each of `backend/` and `frontend/` for full configuration details.

---

## 🔒 Security Notes

- Passwords are hashed with bcrypt before storage — plain-text passwords are never saved or logged
- JWTs are signed with a secret from environment variables, never hardcoded — `.env` files (both real and root-level) are excluded from version control via `.gitignore`; see the `.env.example` files for required variable names
- Admin-only routes are protected server-side via middleware (`protect` + `admin`) — the frontend's route guards are a UX convenience only, not the actual security boundary
- Users cannot self-assign the `admin` role via the registration endpoint
- Order placement decrements product stock atomically per line item (`findOneAndUpdate` with a `stock >= quantity` filter), closing the race condition where two simultaneous checkouts could both succeed against the last unit of inventory; a failed item triggers a rollback of any earlier items already decremented in the same order

---

## 📌 Known Limitations / Future Improvements

- No payment gateway integration (checkout captures shipping details and creates an order record, but doesn't process real payment)
- No email notifications (order confirmation, password reset)
- No product review/rating submission UI (rating/numReviews fields exist on the model but aren't user-editable yet)
- No refresh-token rotation — JWTs are long-lived (30 days) with no revocation mechanism
- Order stock decrement uses atomic per-item updates with manual rollback rather than a true multi-document database transaction, since the current single-node MongoDB container isn't running as a replica set (a requirement for Mongo transactions). This is safe for the current single-order-at-a-time flow but is a candidate for hardening — either via a replica set or a managed MongoDB (e.g. Atlas) — as part of the Project 2 cloud migration
- No CI pipeline yet running these test suites automatically on push — a natural first step for the Project 2 phase

---

## 👤 Author

Built by Fahd as a full-stack capstone project.
