"# TeamBoard"

# Booking App

A full-stack app for booking one-hour slots. Users register, pick a date and an hour, and an admin approves the booking. Built with React, Node.js, Express and MongoDB.

## Features

- Register, log in and log out, with sessions that stay alive across page reloads
- Book a one-hour slot between 6 AM and 9 PM (Nepal time), up to 30 days ahead
- Hours that are already booked are greyed out before you pick them
- Cancel or reschedule a booking while it is pending
- Edit your profile, change your password or delete your account
- Admins can approve, cancel and restore bookings, mark them as paid, and manage users and roles

## Tech

- Frontend: React, React Router, Tailwind CSS, Vite
- Backend: Node.js, Express, Mongoose, MongoDB
- Auth: JWT access and refresh tokens in httpOnly cookies, bcrypt for passwords

## Running locally

You need Node 20 or newer and a MongoDB database.

Backend:

```
cd backend
npm install
node server.js
```

Create `backend/.env`:

```
MONGOOSE_URI=your mongodb connection string
PORT=3000
ACCESS_TOKEN=a long random string
REFRESH_TOKEN=a different long random string
REFRESH_COOKIE_PATH=/api/auth
CLIENT_URL=http://localhost:5173
```

Frontend:

```
cd frontend
npm install
npm run dev
```

Create `frontend/.env`:

```
VITE_API_URL=/api
```

The Vite dev server proxies `/api` to the backend on port 3000, so the browser only talks to one origin.

## Design notes

- Tokens live in httpOnly cookies, not localStorage, so scripts on the page can't read them.
- Refresh tokens are stored hashed, can only be used once, and expire after 7 days. A single shared refresh request stops parallel requests from invalidating each other.
- A partial unique index on the start time stops two active bookings from taking the same slot. Cancelled bookings free the slot again.
- Times are stored in UTC and shown in Nepal time (UTC+5:45).
- Only start times are exposed for availability, never who booked.
- The frontend calls `/api` and a proxy forwards to the backend (Vite in development, a Vercel rewrite in production), which keeps cookies first-party.
- Shared state uses Context with `useReducer`.
