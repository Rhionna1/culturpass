# FunctionPass 🎭

> OUR event destination

A full-stack cultural event discovery platform that helps users find,
save, and RSVP to events in their city — from art shows and music
festivals to food markets, happy hours, and community gatherings.

Built for and by the culture.

---

## Tech Stack

**Backend**
- Java 21 + Spring Boot 3.5.14
- Spring Data JPA + Hibernate
- Spring Security (JWT Authentication)
- PostgreSQL (AWS RDS in production)
- Maven

**Frontend**
- React + Vite
- Axios
- React Router v6

**Infrastructure** *(Phase 5)*
- AWS EC2, RDS, S3, API Gateway
- GitHub Actions CI/CD
- Docker (local development)

---

## External APIs
- Google Maps API — event location and mapping
- Ticketmaster API — event discovery
- SendGrid — email notifications

---

## Project Structure
culturpass/
├── backend/    # Java Spring Boot REST API
└── frontend/   # React SPA (Phase 2)

---

## Getting Started (Local Development)

### Prerequisites
- Java 21+
- Docker Desktop
- Maven (included via mvnw)

### Run the database
```bash
docker compose up -d
```

### Run the backend
```bash
./mvnw spring-boot:run
```

### Run the frontend
```bash
cd frontend
npm run dev
```

---

## Features
- 🎭 Event discovery with category filters and search
- 🍸 Happy Hour permanent listings
- ♥ Save events to your profile
- 🎟️ Multi-step event submission with admin approval
- 👑 Admin dashboard — approve, reject, and feature events
- 🔐 JWT authentication with role-based access control
- ✉️ Contact modal for user feedback

## Development Phases

- **Phase 1** — Project setup, database schema, core entities ✅
- **Phase 2** — REST API, authentication, event submission ✅
- **Phase 3** — Community features, save events, Happy Hour ✅
- **Phase 4** — Promoter system, ratings, PWA
- **Phase 5** — AWS deployment, CI/CD, custom domain

---

*Built by Rhionna — [@Rhionna1](https://github.com/Rhionna1/culturpass)*