# 🧠 Node.js + Express Backend (PostgreSQL)

A production-ready Node.js + Express backend using PostgreSQL, JWT authentication, Google OAuth, email verification, password reset, cart & orders system, admin panel, and Dockerized setup.

---

## 📦 Tech Stack

* Node.js 20
* Express (ESM)
* PostgreSQL
* JWT Authentication (Cookies)
* Google OAuth 2.0
* Nodemailer (Email)
* Docker & Docker Compose
* ESLint + Prettier
* Husky (Git Hooks)

---

## 📁 Project Structure

```
src/
├── app.js              # Express app configuration
├── server.js           # App entry point
├── routes/             # API routes (auth, cart, orders, categories, products, admin)
├── controllers/        # Request handlers
├── services/           # Business logic
├── models/             # Database queries
├── middlewares/        # Authentication, error handling
├── utils/              # Email, authentication helpers
├── constants/          # Static data (products, categories)
├── validators/         # Request validation
├── db/
│   ├── index.js        # DB initialization
│   └── db-init/        # SQL schema files
└── config/             # Environment & DB configuration
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root:

```
# App
PORT=5000
CLIENT_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

# JWT
JWT_SECRET=your_super_secret_key
JWT_ACCESS_SECRET=access_secret_here
JWT_REFRESH_SECRET=refresh_secret_here
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d

# Email (Gmail SMTP)
SMTP_HOST=<YOUR_SMTP_HOST>
SMTP_PORT=<YOUR_SMTP_PORT>
SMTP_USER=<YOUR_SMTP_USER>
SMTP_PASS=<YOUR_SMTP_PASS>

# Google OAuth
GOOGLE_CLIENT_ID=<YOUR_CLIENT_ID>
GOOGLE_CLIENT_SECRET=<YOUR_CLIENT_SECRET>


# Database (Docker)
# DB_USER=postgres
# DB_PASSWORD=tahsiein
# DB_NAME=myappdb
# DB_HOST=db
# POSTGRES_USER=postgres
# POSTGRES_PASSWORD=tahsiein
# POSTGRES_DB=myappdb
```

> ⚠️ Never commit `.env` to GitHub

---

## 🐳 Running with Docker (Recommended)

```bash
docker compose up --build -d
```

* Backend → [http://localhost:5000](http://localhost:5000)
* PostgreSQL → localhost:5432

> Database tables are auto-initialized from `src/db/db-init/*.sql`.

### Seed Initial Data

```bash
# Seed categories
docker exec -it myapp-backend npm run seed:categories

# Seed products
docker exec -it myapp-backend npm run seed:products
```

---

## 👤 Promote a User to Admin

Use `psql` inside the PostgreSQL container:

```bash
docker exec -it myapp-postgres psql -U postgres -d myappdb
```

```sql
SELECT id, email, role FROM users WHERE email = 'user@example.com';
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
SELECT id, email, role FROM users WHERE email = 'user@example.com';
\q
```

---

## 🧪 Running Locally (Without Docker)

```bash
npm install
npm start
```

---

## 🔥 API Health Check

**GET /api/health**

```json
{
  "success": true,
  "message": "API is running!",
  "data": {}
}
```

---

## 🔐 Authentication API

**Base URL:** `/api/auth`

* Signup: `POST /signup`
* Verify Email: `GET /verify-email?token=TOKEN`
* Resend Verification: `POST /send-verify-email`
* Login: `POST /login`
* Current User: `GET /me`
* Logout: `POST /logout`
* Request Password Reset: `POST /request-password-set`
* Reset Password: `POST /reset-password`
* Google OAuth: `GET /google` → `GET /google/callback`

> JWT stored in HTTP-only cookie

---

## 🛒 Cart API (Authenticated)

**Base URL:** `/api/cart`

* Get Cart: `GET /`
* Update Cart: `PUT /`
* Clear Cart: `DELETE /`

---

## 📦 Orders API

**Base URL:** `/api/orders`

* Place Order: `POST /place-order`
* Track Order: `GET /track-order/:trackingId`

> Guest checkout supported

---

## 🛍 Products API

* Get Categories: `GET /api/categories`
* Products by Category: `GET /api/products/category/:category`
* Product by ID: `GET /api/products/:productId`

---

## 👑 Admin Routes (Authenticated + Admin)

**Base URL:** `/api/admin`

* Dashboard Stats: `GET /dashboard/stats`
* Products: `GET /products`, `POST /products`, `PUT /products/:id`, `DELETE /products/:id`
* Categories: `GET /categories`, `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id`
* Orders: `GET /orders`, `GET /orders/:trackingId`
* Users: `GET /users`, `GET /users/:userId`

> Generic request & response placeholders added for further customization.

---

## 🗂 Seeding Data

```bash
npm run seed:categories
npm run seed:products
```

---

## ❗ Error Handling

```json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

---

## 🧹 Code Quality

```bash
npm run lint
npm run lint-fix
npm run format
```

---

## ✅ Features Summary

* JWT Auth (Cookies)
* Email Verification
* Password Reset
* Google OAuth
* Cart System
* Orders & Tracking
* Guest Checkout
* Product & Category CRUD
* Product Filtering, Sorting, Pagination
* Product BuyTogether & Related Products
* Admin Dashboard & Routes
* Dockerized PostgreSQL
* Seeding Scripts
* Clean MVC Architecture

---

## 🔧 Developer Instructions

1. Configure `.env`
2. Seed categories: `npm run seed:categories`
3. Seed products: `npm run seed:products`
4. Start backend (Docker): `docker compose up --build`
5. Start backend (local): `npm start`
6. Test API using Postman or similar tools.

---

## 👨‍💻 Author

**Tahsin Haider**
