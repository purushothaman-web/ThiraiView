# Backend (ThiraiView)

Express 5 API with Prisma (PostgreSQL), JWT auth, email verification, reviews with likes, and watchlists.

## Setup
```
npm install
npx prisma migrate dev
npx prisma generate
npm start
```

## Env (.env)
```
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/postgres
JWT_SECRET=dev_jwt
REFRESH_TOKEN_SECRET=dev_refresh
JWT_EXPIRY=1h
REFRESH_TOKEN_EXPIRY=30d
FRONTEND_URL=http://localhost:5173
APP_BASE_URL=http://localhost:3000
ASSETS_BASE_URL=http://localhost:3000
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=587
MAIL_USER=your_user
MAIL_PASS=your_pass
EMAIL_FROM=no-reply@thiraiview.com
```

## Endpoints (high-level)
- Auth: POST /login, POST /register, GET /verify/:token, POST /resend-verification
- Movies: GET /movies/search, GET /movies/:id, POST /movies, PUT /movies/:id, DELETE /movies/:id, POST /movies/:id/poster
- Reviews: POST/GET movie reviews, PUT/DELETE review, POST like, DELETE unlike
- Watchlist: POST add, GET list, DELETE item, PATCH item watched
- Profile: GET profile, GET movies, GET watchlist, GET reviews, PUT (edit + picture)

## Notes
- Static uploads served under /uploads
- CORS allow-list enforced; set FRONTEND_URL(S)
- Helmet enabled with cross-origin resource policy for images


