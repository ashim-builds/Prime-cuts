# Prime Cuts — Artisanal Butcher House

Prime Cuts is an artisanal butcher house e-commerce platform and management system for premium, fresh meats (goat, chicken, buff, pork, artisanal sausages, and prime steaks) with live order tracking, admin dashboard, and integrated Web Push Notifications.

---

## Architecture & Structure

The repository is organized into distinct, modular services:

```
Prime-cuts/
├── web/                   # Frontend Application (React 19 + Vite + Tailwind CSS)
├── services/              # Backend Application (Express + Node.js + MySQL 8)
├── docker/                # Dockerfiles (web & services), Nginx config, init.sql
├── scripts/               # Seeding, automation, and synchronization scripts
├── docs/                  # System architecture and API documentation
├── docker-compose.yml     # Multi-container orchestration
├── package.json           # Root monorepo orchestration scripts
└── README.md
```

For full directory breakdown and architecture details, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Quick Start

### 1. Prerequisites
- **Node.js**: v18+ or v20+
- **MySQL**: 8.0 (running locally or via Docker)

### 2. Install Dependencies
Install all workspace packages with a single command:
```bash
npm run install:all
```

### 3. Setup Database
If using Docker for MySQL:
```bash
npm run docker:up
```

### 4. Run in Development
Start both backend API (`services` on `http://localhost:5001`) and frontend (`web` on `http://localhost:3000`):
```bash
npm run dev
```

Or run them individually:
```bash
# Run only backend services
npm run dev:services

# Run only web frontend
npm run dev:web
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs both `services` and `web` concurrently |
| `npm run dev:services` | Starts Express API with hot-reload (`services/`) |
| `npm run dev:web` | Starts Vite React frontend (`web/`) |
| `npm run build` | Builds both `services` and `web` for production |
| `npm run start` | Runs the compiled production backend server |
| `npm run docker:up` | Starts MySQL and containerized services via Docker Compose |
| `npm run docker:down` | Stops all Docker Compose containers |

---

## 📖 Documentation
- [Architecture & Folder Guide](docs/ARCHITECTURE.md)
- [REST API Reference](docs/API.md)
