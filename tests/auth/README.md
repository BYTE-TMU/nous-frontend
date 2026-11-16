# tests/auth/

Tests and a manual test guide for the login and password-reset screens.

## Status

| Feature | State |
|---|---|
| Email + password login | Real: `POST /auth/login` on `nous-backend` |
| Password reset | Backend endpoints don't exist yet. Shows "isn't available yet", or runs on a mock (see below) |
| Google sign-in | Removed, not needed for now |

## Automated tests

```bash
npm test                 # all tests
npx vitest tests/auth    # just these
npm run lint && npm run typecheck
```

These mock the network. They check logic, not layout or the real backend.

## Manual testing

You need three terminals: backend, frontend, and one for one-off commands.

### 1. Backend (terminal 1)

Open Docker Desktop first, then:

```bash
cd nous-backend
git pull
uv sync                         # required after every pull (pins bcrypt 4.0.1)
docker compose up -d            # Postgres, Neo4j, Redis
uv run alembic upgrade head
uv run uvicorn app.main:app --reload
```

Check it: `curl http://localhost:8000/health` should print `{"status":"ok"}`.

### 2. Frontend (terminal 2)

```bash
cd nous-frontend
cp .env.example .env.local      # first time only
npm run dev
```

Use <http://localhost:3000>. The backend's CORS only allows port 3000.

### 3. Create a test user (terminal 3, once)

There is no register screen yet. The account is stored in Postgres and survives restarts.

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"tester@nous.dev","password":"correct-horse-battery"}'
```

Use a normal domain. The backend rejects `.local`, `.test` and `localhost`.

### Login at `/login`

| Do this | Expected |
|---|---|
| Submit with empty fields | Inline errors, no request sent |
| Valid email + wrong password | Red banner "That email and password don’t match…" and red field borders |
| Email with no account | Same banner |
| `tester@nous.dev` + the right password | Redirect to `/`. DevTools → Local Storage has `nous.access_token`. |
| Stop the backend, then log in | "Can't reach the server…" and the heading stays "Welcome back." |

`/` is the dashboard, built in a separate PR, so it may be blank or missing until that merges.

### Password reset at `/reset-password`

Without the mock, every step shows "Password reset isn't available yet." To preview the screens, add this to `.env.local` and restart `npm run dev`:

```
NEXT_PUBLIC_MOCK_PASSWORD_RESET=true
```

Mock only: the one valid code is `123456` and no password is changed. Login is never mocked.

| Step | Do this | Expected |
|---|---|---|
| 1 | Enter a valid email, Next | Step 2 |
| 2 | Wrong 6 digit code | Error, stays on step 2 |
| 2 | `123456` | Step 3 |
| 3 | Under 8 characters, or mismatched passwords | Inline errors |
| 3 | Matching passwords of 8+ characters, Reset | Redirect to `/login` |

### Troubleshooting

| Symptom | Cause |
|---|---|
| `docker compose` can't connect | Docker Desktop isn't running |
| Register or login returns 500 | `uv sync` wasn't run (old bcrypt) |
| "Can't reach the server" | Backend isn't running |
