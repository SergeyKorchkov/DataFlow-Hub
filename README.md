# InfoPortal Pro

Portfolio-grade fullstack starter project with a modular React frontend and scalable Express backend.

## Stack

- Frontend: React, Vite, Tailwind CSS, shadcn/ui foundation, react-router-dom, axios, Chart.js (ready for integration)
- Backend: Node.js, Express.js, MySQL, JWT, bcrypt, cookie-parser, cors, dotenv

## Project Structure

```text
InfoPortal-pro/
  client/
    src/
      app/
      pages/
      components/
        layout/
        ui/
      services/
      hooks/
      context/
      router/
      utils/
      styles/
  server/
    src/
      config/
      controllers/
      services/
      repositories/
      routes/
      models/
      middlewares/
      utils/
      modules/
        auth/
        users/
        crypto/
      db/
      constants/
```

## Architecture

- MVC with modular route mounting
- OOP service and repository classes
- SOLID-oriented separation of responsibilities
- Centralized error handling and not found handling
- Clear layers for easy feature-by-feature expansion

## Frontend Notes

- Router includes placeholders for:
  - Login
  - Register
  - Dashboard
  - Weather
  - Currency
  - Movies
  - News
  - Crypto
  - Settings
- Shared shell layout includes sidebar and header placeholders
- API client is configured in `client/src/services/apiClient.js`
- Auth request methods are scaffolded in `client/src/services/authService.js`

## Backend Notes

- Express app setup: `server/src/app.js`
- Server entrypoint: `server/src/server.js`
- API route mount: `server/src/routes/index.js`
- Auth skeleton (register/login/logout/refresh): `server/src/modules/auth/`
- User repository skeleton: `server/src/repositories/UserRepository.js`
- Token utility skeleton: `server/src/utils/token.util.js`
- Password hashing utility skeleton: `server/src/utils/password.util.js`
- MySQL pool config: `server/src/db/mysql.js`
- SQL init schema: `server/src/db/schema.sql`

## Quick Start

### 1. Install dependencies

```bash
cd client && npm install
cd ../server && npm install
```

### 2. Configure environment variables

- Copy `client/.env.example` to `client/.env`
- Copy `server/.env.example` to `server/.env`

### 3. Run development servers

```bash
# terminal 1
cd server && npm run dev

# terminal 2
cd client && npm run dev
```

### 4. Build frontend

```bash
cd client && npm run build
```

## Next Milestones

1. Implement auth business logic with refresh token rotation and DB persistence.
2. Add repositories for preferences and favorites modules.
3. Build feature modules for weather, currency, movies, news, and crypto.
4. Introduce validation layer, logging, and test setup.
