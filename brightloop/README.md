# Brightloop Subscription Management System

## Stage 1 setup

Requirements: Node.js 20 or newer.

```bash
cd brightloop
npm install
cp .env.example .env
npm run prisma -- generate
npm run prisma -- migrate dev --name init
npm run seed
npm run dev
```

Stage 2 auth API:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET|POST /api/users/staff` and staff deactivate/reset endpoints

For the optional 5,000-subscription performance dataset:

```bash
npm run seed:large
```

The API runs on `http://localhost:4000`; the client runs on `http://localhost:5173`.
