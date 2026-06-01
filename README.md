# LogiTrack - Real-Time Logistics Delivery Tracking System

A modern delivery tracking platform with real-time GPS, order management, and multi-role dashboards (customer, driver, admin).

## Features

### Backend (Node.js + Express)
- **Authentication**: JWT-based auth with refresh tokens, role-based access control
- **Orders**: Full CRUD with PostgreSQL + PostGIS for geospatial data
- **Driver Assignment**: Smart algorithm using proximity, rating, and acceptance rate
- **Real-time Tracking**: Socket.io for live GPS updates
- **Notifications**: BullMQ queue-based push notifications via Firebase
- **Maps Integration**: Google Maps API for geocoding, directions, and routes

### Frontend (React + PrimeReact)
- **Customer Portal**: Place orders, track in real-time, view history
- **Driver Dashboard**: Accept/reject orders, live map, earnings tracking
- **Admin Panel**: Manage orders, users, analytics, settings
- **Modern UI**: Glassmorphism, animations with Framer Motion, dark theme

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Node.js, Express, PostgreSQL, PostGIS |
| Realtime | Socket.io, Redis (BullMQ) |
| Frontend | React, PrimeReact, Framer Motion, Zustand |
| Maps | Google Maps API |
| Testing | Jest, Supertest |

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ with PostGIS extension
- Redis 6+

## Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run db:init  # Initialize database schema
npm run dev      # Development server
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev      # Development server on http://localhost:5173
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders (admin: all orders)
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/cancel` - Cancel order

### Drivers
- `GET /api/drivers/me/orders` - Get assigned orders
- `PUT /api/drivers/me/status` - Update online/available status
- `PUT /api/drivers/me/location` - Update GPS location
- `PUT /api/orders/:id/accept` - Accept order
- `PUT /api/orders/:id/pickup` - Mark picked up
- `PUT /api/orders/:id/deliver` - Mark delivered

## Testing

```bash
# Backend tests
cd backend
npm test
```

## Environment Variables

### Backend (.env)
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - JWT signing secret (32+ chars)
- `JWT_REFRESH_SECRET` - Refresh token secret (32+ chars)
- `GOOGLE_MAPS_SERVER_KEY` - Google Maps API key
- `CLIENT_URL` - Frontend URL for CORS

### Frontend (.env)
- `VITE_API_URL` - Backend API URL
- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API key

## License

MIT