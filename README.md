# SecurePass Manager

SecurePass Manager is a full-stack password manager built for portfolio and demo use. It includes a Spring Boot API, Angular frontend, PostgreSQL persistence, JWT authentication, AES-GCM vault encryption, Docker setup, GitLab CI, and deployment notes for Neon, Render, Netlify, and Vercel.

## Features

- User registration and login with BCrypt password hashing
- JWT authentication for protected APIs
- Forgot-password and reset-password flow with expiring reset tokens
- Password vault CRUD with strict per-user ownership
- Search saved passwords by title, username, or website URL
- AES-GCM encryption for stored vault password values
- DTO-based API responses that avoid exposing encrypted database values
- Angular routing, guards, API service layer, validation, logout, and responsive UI
- Docker Compose local stack with PostgreSQL, backend, and frontend
- GitLab CI pipeline for backend build/test, frontend build, and Docker image build

## Tech Stack

- Backend: Java 21, Spring Boot 3, Spring Security, JWT, Spring Data JPA, Gradle
- Frontend: Angular 21, standalone components, Angular Router, reactive forms
- Database: PostgreSQL locally or Neon PostgreSQL in production
- DevOps: Docker, Docker Compose, GitHub-ready structure, GitLab CI/CD
- Deployment: Render for backend, Netlify or Vercel for frontend

## Architecture

```text
frontend/ Angular app
  -> Authorization: Bearer JWT
backend/ Spring Boot REST API
  -> PostgreSQL via Spring Data JPA
Neon PostgreSQL
```

Vault passwords are encrypted before database storage. User login passwords are never encrypted or stored directly; they are one-way hashed with BCrypt.

## Project Structure

```text
backend/              Spring Boot Gradle API
frontend/             Angular app
docker-compose.yml    Local full-stack environment
.gitlab-ci.yml        GitLab pipeline
render.yaml           Render blueprint starter
README.md             Setup and deployment guide
```

## Environment Variables

Backend:

| Variable | Description |
| --- | --- |
| `DB_URL` | PostgreSQL JDBC URL |
| `DB_USERNAME` | Database username |
| `DB_PASSWORD` | Database password |
| `JWT_SECRET` | Base64 HMAC secret, at least 32 bytes after decoding |
| `AES_KEY` | Base64 AES key, 16, 24, or 32 bytes after decoding |
| `FRONTEND_URL` | Allowed CORS origin. Use comma-separated values for multiple origins. |
| `JWT_EXPIRATION_MS` | JWT lifetime in milliseconds |
| `RESET_TOKEN_EXPIRATION_MINUTES` | Reset token lifetime |
| `JPA_DDL_AUTO` | Use `update` for demo, migrations for mature production apps |

Frontend:

| Variable | Description |
| --- | --- |
| `API_URL` | Backend API base URL, for example `https://securepass-api.onrender.com/api` |

Generate local secrets:

```bash
openssl rand -base64 64
openssl rand -base64 32
```

## Local Setup

Backend only:

```bash
cd backend
export GRADLE_USER_HOME=.gradle
export DB_URL=jdbc:postgresql://localhost:5433/securepass
export DB_USERNAME=securepass
export DB_PASSWORD=securepass
export JWT_SECRET=<base64-secret>
export AES_KEY=<base64-32-byte-key>
export FRONTEND_URL=http://localhost:4200,http://127.0.0.1:4200
./gradlew bootRun
```

Frontend only:

```bash
cd frontend
npm install
npm start
```

Open `http://localhost:4200`.

## Docker Setup

Create `.env` from `.env.example`, set `JWT_SECRET` and `AES_KEY`, then run:

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:8080`
- PostgreSQL: `localhost:5433`

## API Endpoints

Auth:

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register and receive JWT |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `POST` | `/api/auth/forgot-password` | Generate expiring reset token |
| `POST` | `/api/auth/reset-password` | Reset password with token |

Vault, requires `Authorization: Bearer <token>`:

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/vault` | Add password item |
| `GET` | `/api/vault` | List password items |
| `GET` | `/api/vault?q=github` | Search password items |
| `GET` | `/api/vault/{id}` | View metadata without password |
| `GET` | `/api/vault/{id}?reveal=true` | View item with decrypted password |
| `PUT` | `/api/vault/{id}` | Update password item |
| `DELETE` | `/api/vault/{id}` | Delete password item |

## Neon PostgreSQL

1. Create a Neon project at `https://neon.tech`.
2. Create or select a database such as `securepass`.
3. Copy the pooled JDBC connection string.
4. Set Render variables:
   - `DB_URL=jdbc:postgresql://<host>/<database>?sslmode=require`
   - `DB_USERNAME=<neon-user>`
   - `DB_PASSWORD=<neon-password>`

## Render Backend Deployment

1. Push this repository to GitHub or GitLab.
2. Create a Render Web Service from the repository.
3. Use Docker deployment with root directory `backend`.
4. Set environment variables from `backend/.env.example`.
5. Set `FRONTEND_URL` to the deployed frontend URL.
6. Use `/actuator/health` as the health check path.

## Netlify Frontend Deployment

1. Create a Netlify site from the repository.
2. Set base directory to `frontend`.
3. Set build command to `npm run build`.
4. Set publish directory to `frontend/dist/frontend/browser`.
5. Add environment variable `API_URL=https://<render-service>.onrender.com/api`.

## Vercel Frontend Deployment

1. Import the repository in Vercel.
2. Set root directory to `frontend`.
3. Set build command to `npm run build`.
4. Set output directory to `dist/frontend/browser`.
5. Add environment variable `API_URL=https://<render-service>.onrender.com/api`.

## GitHub and GitLab

The project is ready to push to GitHub as a normal repository. GitLab CI is defined in `.gitlab-ci.yml` and runs:

- backend Gradle build
- backend tests
- frontend Angular build
- backend Docker image build on `main`
- deployment instruction job on `main`

## Custom Domain Later

- Backend: add the custom domain in Render, update DNS as Render instructs, then update frontend `API_URL`.
- Frontend: add the custom domain in Netlify or Vercel, update DNS, then update backend `FRONTEND_URL` for CORS.

## Security Notes

- Never commit `.env` files or real secrets.
- Use strong random base64 values for `JWT_SECRET` and `AES_KEY`.
- Rotate `AES_KEY` carefully; existing vault passwords cannot be decrypted after changing it unless you migrate data.
- Reset tokens are random, single-use, and expiry-bound.
- Demo forgot-password returns a reset URL directly. In a production app, email the reset link instead of returning it in the API response.
- For long-term production, add database migrations with Flyway or Liquibase and rate-limit auth endpoints.

## Future Improvements

- Email delivery for password reset links
- Two-factor authentication
- Password generator and strength meter
- Vault item sharing with public-key encryption
- Flyway migrations
- Audit logging and login alerts
