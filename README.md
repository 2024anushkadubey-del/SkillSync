# SkillSync

A peer-to-peer skill exchange platform for students.

## About

SkillSync is a peer-to-peer skill exchange platform designed for students. It allows students to showcase skills they can teach, discover skills they want to learn, and eventually connect with other students for skill exchanges.

## Current Progress

### Experiment 1 — Completed

Responsive and interactive frontend using React, Vite and Tailwind CSS.

**Implemented Pages:**
* **Home**
* **Login**
* **Register**
* **Dashboard**

*Note: The current data is mock/static data. Authentication and backend functionality have not yet been implemented.*

## Planned Technology Stack

Technologies planned for the complete semester project:

* React
* Vite
* Tailwind CSS
* Node.js
* Express
* MongoDB
* Mongoose
* Context API
* JWT
* Socket.IO
* Docker
* Docker Compose
* GitHub Actions

## Running the Project

To run the current frontend:

```bash
cd client
npm install
npm run dev
```

The Vite development server normally runs on `http://localhost:5173`.

## Semester Roadmap

1. Responsive UI — Completed
2. React Hooks — Completed
3. Context API Global State — Completed
4. REST API + MongoDB + RBAC Data Security — Completed
5. Secure REST APIs — Completed
6. JWT Authentication & Role Authorization — Completed
7. Docker & Containerization — Completed
8. WebSockets Real-Time Communication (Socket.IO) — Completed
9. Docker Compose Multi-Container Orchestration — Completed
10. CI/CD — Planned

---

## Experiment 8 — Real-Time Communication Using Socket.IO

### Aim
To implement real-time communication between clients and a server using WebSockets in a full-stack web application.

### Architecture & Features
* **Backend WebSocket Server**: Node.js HTTP server wrapping the Express 5 application with `socket.io` attached.
* **Socket.IO Room**: Connected clients automatically join the `"announcements"` room upon emitting `join-announcements`.
* **Authenticated Announcement API**: `POST /api/announcements` protected with JWT authentication (`authenticate`) and role authorization (`requireRole(['admin'])`).
* **Input Validation**: Rejects empty announcement messages with HTTP 400 Bad Request.
* **Real-Time Broadcast**: Server broadcasts valid announcements to the `"announcements"` room via `io.to("announcements").emit("new-announcement", announcement)`.
* **Live UI Component**: `LiveAnnouncements.jsx` provides:
  * Admin publishing form with controlled textarea and feedback messages.
  * Live announcements feed displaying announcement text and readable timestamp (`DD/MM/YYYY, HH:MM:SS am/pm`).
  * Live Socket.IO connection status indicator (`Connected`, `Connecting...`, `Disconnected`, `Connection error`).
  * Proper cleanup of event listeners and socket disconnect on unmount.
* **Networking & Reverse Proxy**:
  * Local development: Vite dev proxy on `localhost:5173` forwards `/socket.io` to `http://localhost:5001` with `ws: true`.
  * Docker deployment: Nginx reverse proxy on host port `8080` proxies both `/api/` and `/socket.io/` with WebSocket upgrade headers (`Upgrade $http_upgrade`, `Connection "upgrade"`).

### How to Run Locally
1. **Start MongoDB**:
   ```bash
   brew services start mongodb-community
   ```
2. **Start Backend**:
   ```bash
   cd server
   npm install
   npm run dev
   ```
   *Runs on `http://localhost:5001`.*
3. **Start Frontend**:
   ```bash
   cd client
   npm install
   npm run dev
   ```
   *Runs on `http://localhost:5173`.*

### How to Run via Docker Compose
```bash
docker compose up -d --build
```
Access the application at `http://localhost:8080`.

---

## Experiment 9 — Containerizing the Full-Stack Application with Docker

### Aim
To containerize a full-stack web application using Docker by creating production Dockerfiles for frontend and backend services and orchestrating them with Docker Compose.

### Container Architecture & Components
* **Backend Image (`skillsync-backend`)**:
  * Base: `node:20-alpine`.
  * Dependencies installed with `npm ci --omit=dev`.
  * Exposes and publishes port `5001`.
  * Built-in health check polling `http://127.0.0.1:5001/api/health`.
  * Connected to host MongoDB via `host.docker.internal:27017` using Docker's `host-gateway`.
* **Frontend Image (`skillsync-frontend`)**:
  * Multi-stage build:
    1. Builder stage (`node:20-alpine`): Compiles React 19 + Tailwind CSS + Vite into `/app/dist`.
    2. Runtime stage (`nginx:alpine`): Serves compiled static assets on port `80` (mapped to host port `8080`).
  * Reverse proxy rules in `nginx.conf`:
    * `/api/` requests forwarded to `http://backend:5001`.
    * `/socket.io/` WebSocket connections forwarded to `http://backend:5001` with HTTP 101 Upgrade headers.
    * SPA routing fallback via `try_files $uri $uri/ /index.html`.
* **Docker Compose Orchestration (`compose.yaml`)**:
  * Services: `backend` and `frontend`.
  * Bridge network: `skillsync-network`.
  * Dependency: Frontend starts only after backend reaches `healthy` state.
  * Ports: Frontend on `8080`, Backend on `5001`.

### Verification Commands
```bash
# Check container status
docker compose ps

# Check backend health directly
curl -i http://localhost:5001/api/health

# Check frontend proxy health
curl -i http://localhost:8080/api/health

# Check frontend page load
curl -i http://localhost:8080/

# Check WebSocket endpoint
curl -i "http://localhost:8080/socket.io/?EIO=4&transport=polling"
```

---

## Experiment 4 — Postman CRUD & RBAC Demonstration

Import the Postman collection located at:
`docs/SkillSync_Experiment4_Postman.json`

### Demonstration Workflow:
1. **Start MongoDB & Backend:**
   ```bash
   brew services start mongodb-community
   cd server && npm start
   ```
2. **Execute Requests in Order in Postman:**
   * **1. Login – Staff (`POST /api/auth/login`)**: Returns HTTP 200 with JWT token (auto-saved to `{{token}}`).
   * **2. Create Skill (`POST /api/skills`)**: Creates a skill in MongoDB (HTTP 201 Created; auto-saves `{{skillId}}`).
   * **3. Get All Skills (`GET /api/skills`)**: Retrieves skills list from MongoDB (HTTP 200 OK).
   * **4. Get Single Skill (`GET /api/skills/{{skillId}}`)**: Retrieves the created skill (HTTP 200 OK).
   * **5. Update Skill (`PATCH /api/skills/{{skillId}}`)**: Modifies skill level/description in MongoDB (HTTP 200 OK).
   * **6. Login – Auditor (`POST /api/auth/login`)**: Authenticates as `auditor@university.edu` (HTTP 200 OK).
   * **7. Auditor GET Skills (`GET /api/skills`)**: Reads skills catalog (HTTP 200 OK — Allowed).
   * **8. Auditor Create Skill (`POST /api/skills`)**: Rejection proof (HTTP 403 Forbidden — Denied by RBAC).
   * **9. Delete Skill (`DELETE /api/skills/{{skillId}}`)**: Removes skill from MongoDB using Staff token (HTTP 200 OK).
