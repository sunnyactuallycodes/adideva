# BookMyIndia - Production Backend API

A clean, modular, and production-ready Express.js, MongoDB, and Redis backend codebase for **BookMyIndia** — a luxury holiday and travel package booking platform.

---

## 🛠️ Technology Stack
- **Framework**: Express.js (v4.21+)
- **Database**: MongoDB with Mongoose (v8.9+)
- **Caching**: Redis client (`ioredis` v5.4+) with connection listeners & automatic graceful fallback
- **Image Uploads**: Cloudinary v2 SDK + Multer
- **Authentication & Security**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `cors`, `cookie-parser`
- **Payment Processing**: Razorpay API (`razorpay` SDK) + HMAC-SHA256 signature verification

---

## ⚙️ Architecture & Folder Structure

```
backend/
├── package.json
├── .env.example
├── .env
├── src/
│   ├── config/
│   │   ├── db.js              # MongoDB Mongoose connection
│   │   ├── redis.js           # Redis client with ioredis & graceful fallback
│   │   └── cloudinary.js      # Cloudinary v2 SDK configuration
│   ├── controllers/
│   │   ├── auth.controller.js     # registerUser, loginUser, logoutUser, getCurrentUser
│   │   ├── user.controller.js     # getUserProfile, updateUserProfile, getAllUsers, updateUserStatus, getAdminDashboardStats
│   │   ├── package.controller.js  # getAllPackages (Redis cached), getPackageById, createPackage, updatePackage, deletePackage, togglePackageActive
│   │   └── order.controller.js    # createRazorpayOrder, verifyAndCreateOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus
│   ├── middlewares/
│   │   ├── auth.middleware.js     # verifyJWT, optionalAuth, authorizeRoles("admin", "user")
│   │   ├── error.middleware.js    # Centralized global errorHandler & notFound handler
│   │   └── multer.middleware.js   # Multer storage configuration for Cloudinary uploads
│   ├── models/
│   │   ├── user.model.js          # User Schema (Name, Email, Password, Role, Status) + bcrypt & JWT methods
│   │   ├── package.model.js       # Travel Package Schema (Title, Places, Duration, Pricing, Highlights, Itinerary, Active)
│   │   └── order.model.js         # Booking Schema (User, Package, OrderId, Pricing, Razorpay IDs, Status, Traveller)
│   ├── routes/
│   │   ├── auth.routes.js         # /api/v1/auth/*
│   │   ├── user.routes.js         # /api/v1/users/*
│   │   ├── package.routes.js      # /api/v1/packages/*
│   │   └── order.routes.js        # /api/v1/orders/*
│   ├── utils/
│   │   ├── asyncHandler.js       # Promise-based higher-order wrapper
│   │   ├── apiError.js           # Standardized ApiError class extending Error
│   │   ├── apiResponse.js        # Standardized ApiResponse formatter
│   │   ├── cloudinaryUpload.js   # Cloudinary file and buffer upload/destroy utilities
│   │   ├── priceCalculator.js    # Financial calculations (GST, discounts, totals)
│   │   └── seeder.js             # Initial database seeder for packages & accounts
│   ├── app.js                    # Express app configuration & middleware mounts
│   └── server.js                 # Server entry point
```

---

## 🚀 Quick Setup & Run

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Create `.env` or edit the existing file:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/bookmyindia
REDIS_URL=redis://localhost:6379
REDIS_CACHE_TTL=3600
JWT_SECRET=bookmyindia_super_secure_jwt_secret_key_2026_luxury_travel
JWT_EXPIRY=7d
COOKIE_SECRET=bookmyindia_secure_cookie_secret_key
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=demo_key
CLOUDINARY_API_SECRET=demo_secret
RAZORPAY_KEY_ID=rzp_test_placeholder_key_id
RAZORPAY_KEY_SECRET=rzp_test_placeholder_key_secret
```

### 3. Seed Initial Database (Optional)
```bash
npm run seed
```
Creates default admin (`admin@bookmyindia.com` / `adminpassword123`) and 6 premium travel packages.

### 4. Start Server
```bash
npm start
# or development with auto-reload:
npm run dev
```

---

## 📡 API Endpoints Summary

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Register new user & issue JWT | Public |
| POST | `/api/v1/auth/login` | Login user & issue JWT | Public |
| POST | `/api/v1/auth/logout` | Logout user & clear cookie | Private |
| GET | `/api/v1/auth/me` | Get current user (session persistence) | Private |

### Travel Packages (`/api/v1/packages`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/v1/packages` | List packages (cached in Redis, supports `?category=`, `?search=`) | Public |
| GET | `/api/v1/packages/:id` | Get single package details (cached in Redis) | Public |
| POST | `/api/v1/packages` | Create new package (with Multer image upload) | Admin |
| PUT | `/api/v1/packages/:id` | Update package details (invalidates Redis cache) | Admin |
| PATCH | `/api/v1/packages/:id/toggle-active` | Toggle active/inactive state | Admin |
| DELETE | `/api/v1/packages/:id` | Delete package from database & cache | Admin |

### Orders & Razorpay Payments (`/api/v1/orders`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/v1/orders/razorpay-order` | Initialize Razorpay order & receipt | Public/User |
| POST | `/api/v1/orders/verify` | Verify payment signature & create booking | Public/User |
| GET | `/api/v1/orders/my-orders` | Get bookings for logged-in user or email | User |
| GET | `/api/v1/orders/:id` | Get single order confirmation details | Public/User |
| GET | `/api/v1/orders` | List all orders with filters & pagination | Admin |
| PATCH | `/api/v1/orders/:id/status` | Update booking status (`confirmed`/`pending`/`completed`/`cancelled`) | Admin |

### Users & Admin Management (`/api/v1/users`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/v1/users/profile` | Get current user profile | Private |
| PUT | `/api/v1/users/profile` | Update profile information | Private |
| GET | `/api/v1/users/admin/stats` | Aggregate dashboard KPI analytics | Admin |
| GET | `/api/v1/users` | List all registered users | Admin |
| PATCH | `/api/v1/users/:id/status` | Toggle user status `active`/`inactive` | Admin |

---

## ⚡ Vercel Serverless Deployment

This backend is fully optimized for **Vercel Serverless Functions**:

1. **Root Directory on Vercel**: Set Root Directory to `backend` in your Vercel project settings.
2. **Entrypoint**: `api/index.js` automatically maps all incoming traffic via `vercel.json` rewrites.
3. **Environment Variables**: In Vercel Project Settings -> Environment Variables, add:
   - `MONGODB_URI`: Your MongoDB Atlas connection URI
   - `JWT_SECRET`: Random secret string (e.g. `bookmyindia_super_secure_jwt_secret_key_2026_luxury_travel`)
   - `CLIENT_URL`: Your Vercel frontend URL (e.g. `https://your-frontend.vercel.app`)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
   - *(Optional)* `REDIS_URL`: Upstash or Redis Cloud URL (if omitted, seamlessly runs in resilient direct DB mode without cold start delays).
4. **Health Check**: Test your deployment by visiting `https://your-backend.vercel.app/api/v1/health` or `https://your-backend.vercel.app/`.

