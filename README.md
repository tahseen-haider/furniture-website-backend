# 🧠 Node.js + Express Backend (PostgreSQL)

A production-ready Node.js + Express backend using PostgreSQL, JWT authentication, Google OAuth, email verification, password reset, cart & orders system, and Dockerized setup.

---

## 📦 Tech Stack

- Node.js 20
- Express (ESM)
- PostgreSQL
- JWT Authentication (Cookies)
- Google OAuth 2.0
- Nodemailer (Email)
- Docker & Docker Compose
- ESLint + Prettier
- Husky (Git Hooks)

---

## 📁 Project Structure

```
src/
├── app.js              # Express app configuration
├── server.js           # App entry point
├── routes/             # API routes
├── controllers/        # Request handlers
├── services/           # Business logic
├── models/             # Database queries
├── middlewares/        # Authentication, error handling
├── utils/              # Email, authentication helpers
├── constants/          # Static data (products, categories)
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
JWT_SECRET=supersecretjwtkey

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Google OAuth
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx

# Database (Docker)
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=myappdb
DB_HOST=db

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=myappdb
```

> ⚠️ Never commit `.env` to GitHub

---

## 🐳 Running with Docker (Recommended)

### 1️⃣ Build & Start Containers

> ⚠️ **Windows Users Warning:**
> Some scripts (like `wait-for-it.sh` or entrypoint scripts) may have **Windows-style line endings (`CRLF`)**.
> Linux containers require **Unix-style line endings (`LF`)**.
> Open the script in VS Code, check the bottom-right corner, and change `CRLF → LF`, then save.

```bash
docker compose up --build -d
```

Services started:

- Backend → [http://localhost:5000](http://localhost:5000)
- PostgreSQL → localhost:5432

> Database tables are auto-initialized from `src/db/db-init/*.sql`.

### 2️⃣ Seed Initial Data

After the containers are running, you can seed the database with categories and products:

```bash
# Seed categories
docker exec -it myapp-backend npm run seed:categories

# Seed products
docker exec -it myapp-backend npm run seed:products
```

> ✅ This ensures that your database has the initial data required for the backend to function properly.

---

## 🧪 Running Locally (Without Docker)

```bash
npm install
npm start
```

Ensure PostgreSQL is running and `.env` values are correct.

---

## 🔥 API Health Check

**GET /api/health**

Response:

```json
{
  "success": true,
  "message": "API is running!"
}
```

---

## 🔐 Authentication API

**Base URL:** `/api/auth`

### ➕ Signup

**POST /api/auth/signup**

Body:

```json
{
  "email": "user@email.com",
  "password": "password123",
  "username": "tahsin"
}
```

Response:

```json
{
  "message": "User created. Verify your email.",
  "user": {
    "id": 1,
    "email": "user@email.com",
    "username": "tahsin"
  }
}
```

### 📧 Verify Email

**GET /api/auth/verify-email?token=TOKEN**

➡ Redirects to frontend login page

### 🔁 Resend Verification Email

**POST /api/auth/send-verify-email**

Body:

```json
{ "email": "user@email.com" }
```

### 🔑 Login

**POST /api/auth/login**

Body:

```json
{
  "email": "user@email.com",
  "password": "password123"
}
```

Response:

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@email.com",
    "username": "tahsin"
  }
}
```

✅ JWT stored in HTTP-only cookie

### 👤 Current User

**GET /api/auth/me**

Response:

```json
{
  "user": {
    "id": 1,
    "email": "user@email.com",
    "username": "tahsin"
  }
}
```

### 🚪 Logout

**POST /api/auth/logout**

### 🔐 Password Reset (Email)

**POST /api/auth/request-password-set**

Body:

```json
{ "email": "user@email.com" }
```

### 🔄 Reset Password

**POST /api/auth/reset-password**

Body:

```json
{
  "email": "user@email.com",
  "token": "RESET_TOKEN",
  "password": "newpassword123"
}
```

### 🔵 Google OAuth

**GET /api/auth/google**

Callback:
**GET /api/auth/google/callback**

✔ Automatically logs in & verifies user

---

## 🛒 Cart API (Authenticated)

**Base URL:** `/api/cart`

🔒 Requires login

### 📥 Get Cart

**GET /api/cart**

Response:

```json
{
  "cart": { "productId": { "quantity": 2 } }
}
```

### ✏️ Update Cart

**PUT /api/cart**

Body:

```json
{
  "cart": {
    "1": { "quantity": 2 }
  }
}
```

### 🧹 Clear Cart

**DELETE /api/cart**

---

## 📦 Orders API

**Base URL:** `/api/orders`

Authentication: Optional (Guest checkout supported)

### 🛍 Place Order

**POST /api/orders/place-order**

Body:

```json
{
  "region": "PK",
  "billingSameAsShipping": true,
  "shippingAddress": {
    "firstName": "Ali",
    "lastName": "Khan",
    "address": "Street 1",
    "city": "Lahore",
    "postalCode": "54000",
    "phone": "03001234567",
    "email": "ali@email.com"
  },
  "products": {
    "1": {
      "productId": 1,
      "variantId": 2,
      "title": "Chair",
      "variantTitle": "Black",
      "price": 5000,
      "quantity": 1
    }
  }
}
```

Response:

```json
{
  "message": "Order placed! Check your email for Tracking ID.",
  "order": {
    "orderId": 10,
    "trackingId": 181925941864448
  }
}
```

📧 Sends tracking email automatically

### 🔎 Track Order

**GET /api/orders/track-order/:trackingId**

Response:

```json
{
  "trackingId": "181925941864448",
  "status": "Pending",
  "estimatedDelivery": "2025-01-01",
  "shippingAddress": {},
  "billingAddress": {},
  "products": [],
  "timeline": []
}
```

---

## 🛍 Products API

### 📂 Categories

**GET /api/categories**

### 📦 Products by Category

**GET /api/products/category/:category**

Optional query params: `price_min`, `price_max`, `sort`, `page`, `pageSize`

### 🧾 Product by ID

**GET /api/products/:productId**

> Loads data from database including variants, images, features, buyTogether, relatedProducts

### ➕ Product CRUD (Admin only)

| Method | Endpoint            | Description    |
| ------ | ------------------- | -------------- |
| POST   | `/api/products`     | Create product |
| PUT    | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

### ➕ Category CRUD (Admin only)

| Method | Endpoint              | Description          |
| ------ | --------------------- | -------------------- |
| POST   | `/api/categories`     | Create category      |
| PUT    | `/api/categories/:id` | Update category      |
| DELETE | `/api/categories/:id` | Soft-delete category |

---

## 🗂 Seeding Data

### Categories Seed

```bash
npm run seed:categories
```

### Products Seed

```bash
npm run seed:products
```

> Categories must be seeded first.

---

## ❗ Error Handling

Standard JSON error format:

```json
{
  "success": false,
  "message": "Error message"
}
```

Handled globally via `errorMiddleware`.

---

## 🧹 Code Quality

```bash
npm run lint
npm run lint-fix
npm run format
```

---

## ✅ Features Summary

- JWT Auth (Cookies)
- Email Verification
- Password Reset
- Google OAuth
- Cart System
- Orders & Tracking
- Guest Checkout
- Product & Category CRUD
- Product Filtering, Sorting, Pagination
- Product BuyTogether & Related Products
- Dockerized PostgreSQL
- Seeding Scripts
- Clean MVC Architecture

---

## 🔧 Developer Instructions

1. Seed categories: `npm run seed:categories`
2. Seed products: `npm run seed:products`
3. Start backend (Docker): `docker compose up --build`
4. Start backend (local): `npm start`
5. Configure `.env` properly before running.
6. Test API using Postman or similar tools.

---

## 👨‍💻 Author

**Tahsin Haider**
