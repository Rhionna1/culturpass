# CulturPass 🎭

A full-stack cultural event discovery platform that helps users find,
save, and RSVP to cultural events in their city — from art shows and
music festivals to food markets and community gatherings.

---

## Tech Stack

**Backend**
- Java 21 + Spring Boot 3.5.14
- Spring Data JPA + Hibernate
- Spring Security (JWT + OAuth 2.0)
- PostgreSQL (AWS RDS in production)
- Maven

**Frontend** *(Phase 2)*
- React + Vite
- Axios
- React Router v6

**Infrastructure** *(Phase 4)*
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

---

## Development Phases

- **Phase 1** — Project setup, database schema, core entities ✅
- **Phase 2** — REST API endpoints, authentication, external APIs
- **Phase 3** — Community features, UX polish, notifications
- **Phase 4** — AWS deployment, CI/CD, testing

---

*Built by Rhionna — [@Rhionna1](https://github.com/Rhionna1/culturpass.git)*