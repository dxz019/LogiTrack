# LogiTrack - Delivery Tracking Application

## Project Structure
- `backend/` - Node.js Express server with Socket.io, BullMQ/Redis, PostgreSQL
- `frontend/` - React Vite application with PrimeReact, Zustand, Three.js

## Lint/Check Commands
- Backend test: `npm run test` (from backend directory)
- Frontend test: `npm run test` (from frontend directory)
- Frontend build: `npm run build` (from frontend directory)
- Backend start: `npm run dev` (from backend directory)
- Frontend dev: `npm run dev` (from frontend directory)

## Environment Variables (.env)
```
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/logitrack
REDIS_URL=redis://localhost:6379
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
JWT_REFRESH_SECRET=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0
CLIENT_URL=http://localhost:5173
NODE_ENV=development
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GOOGLE_MAPS_SERVER_KEY=your_google_maps_server_key
OPENAI_API_KEY=your_openai_key
FCM_SERVER_KEY=your_firebase_key
SMTP_HOST=smtp.gmail.com
SMTP_USER=your@email.com
SMTP_PASS=your_app_password
```

## Status
- Backend: All 39 tests passing
- Frontend: All 19 tests passing, build successful
- Redis: Not running (graceful degradation implemented)

## Running Tests
Since this project does not use npm workspaces, run tests in each directory:
```bash
# Sequential
cd backend && npm run test && cd ../frontend && npm run test

# Parallel
(cd backend && npm run test) & (cd frontend && npm run test) & wait
```

## Environment Details
- Current time: 2026-06-02T11:36:31+05:30
- Working directory: /home/darakhshan.zehra@tekmindz.com/Desktop/NODEJS/Delivery Tracking
- Active file: frontend/src/components/Admin/AdminMap.jsx