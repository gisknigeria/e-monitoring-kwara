# Election Monitoring Command Center
## Code Review and Handover Guide

This document explains the project in simple terms and gives you a way to describe it during a code review. The application is an election monitoring command center for Kwara State. It combines a map, incident reporting, field coordination, election results, chat, notifications, GPS and camera features.

## 1. One-minute explanation

You can explain the project like this:

> This is a Vite and React frontend connected to an Express backend. React displays the command-center interface and manages user interaction. The Express server exposes REST API endpoints for login, incidents, personnel, results, chat, cameras and map data. Socket.IO provides real-time updates such as new incidents, GPS positions, notifications, chat messages and camera signaling. PostgreSQL is used when `DATABASE_URL` is configured; otherwise the server uses a JSON file for local or demonstration use. The frontend is normally hosted on Vercel and the backend on Render.

The main design principle is that the browser handles presentation and interaction, while the server handles authentication, authorization, validation, persistence and communication with external services.

## 2. How the application starts

### Browser startup

1. `index.html` provides the HTML page and a `root` element.
2. `src/main.jsx` imports the global styles and renders `<App />`.
3. `src/App.jsx` checks browser storage for an existing session.
4. If there is no session, it shows `Login`.
5. After login, it lazy-loads and shows `Dashboard`.
6. The service worker is registered for PWA behavior.

### Server startup

1. `server/index.js` creates the Express application and HTTP server.
2. It creates a Socket.IO server on the same HTTP server.
3. It loads environment variables and validates important production settings.
4. It chooses PostgreSQL when `DATABASE_URL` exists, otherwise JSON storage.
5. It configures authentication, rate limits, routes and Socket.IO events.
6. In production it can serve the built frontend as well as `/api`.

## 3. Frontend files

### Entry and configuration

- `index.html`
  - The HTML shell for the app.
  - Contains metadata, the PWA manifest reference and the React mount element.

- `src/main.jsx`
  - React entry point.
  - Imports Leaflet CSS and the application stylesheets.
  - Renders `App` into the `root` element.
  - Registers `public/service-worker.js` when the browser supports service workers.

- `src/App.jsx`
  - Application-level session switch.
  - Restores the session from `localStorage` or `sessionStorage`.
  - Shows login when the user is not authenticated.
  - Shows the dashboard after authentication.
  - Handles logout and updates stored session information.
  - Uses lazy loading so the large dashboard bundle is loaded after login.

- `src/config.js`
  - Builds the API URL from `VITE_API_URL`.
  - The frontend calls `${API}/...`, so production points to the Render backend.

- `vite.config.js`
  - Configures Vite and the React plugin.
  - Provides the local development proxy for `/api` and `/socket.io`.
  - This allows the frontend and backend to run locally on separate ports.

### Authentication and main dashboard

- `src/components/auth/Login.jsx`
  - Login form and error display.
  - Sends credentials to the backend.
  - Passes the returned session to `App`.
  - Also contains the PWA installation action.

- `src/components/dashboard/Dashboard.jsx`
  - The main dashboard controller and the largest frontend file.
  - Owns dashboard state and coordinates child components.
  - Makes authenticated API requests.
  - Opens and closes panels and modals.
  - Starts and cleans up the Socket.IO connection.
  - Handles incidents, assignments, notifications, GPS, emergency alerts, chat, cameras and result views.
  - Connects map actions to the correct business workflow.

A useful review comment is:

> Dashboard is the orchestration layer. It should coordinate state and workflows, while specialized components render individual panels. It is currently a complexity hotspot and could be split further as the product grows.

- `src/components/dashboard/MapCanvas.jsx`
  - Renders the Leaflet map.
  - Displays incidents, personnel, cameras, boundaries and custom layers.
  - Handles map clicks, drawing, measurements, routes and map interactions.
  - Receives data and callbacks from `Dashboard` rather than owning the full application state.

### Dashboard feature components

- `CameraPanel.jsx`
  - Displays CCTV/HLS streams and field camera WebRTC feeds.

- `ChatPanel.jsx`
  - Selects and creates chat rooms.
  - Manages room members.
  - Displays and sends messages.
  - Supports image, video and document attachments.

- `EmergencyPanel.jsx`
  - Collects emergency-alert information and submits it to the backend.

- `MapDataPanel.jsx`
  - Creates, edits, displays and deletes custom map layers.
  - Controls layer visibility, opacity, styling and labels.

- `ToolsPanel.jsx`
  - Provides map tools such as search, coordinates, routes, measurements, saved areas and layer controls.

- `ResultsDashboard.jsx`
  - Shows incident KPIs, polling-unit totals, party breakdowns and operational analysis.

- `PreElectionAnalysis.jsx`
  - Displays historical election datasets and pre-election analysis controls.
  - Calculates party percentages from loaded historical values.
  - Sends historical LGA data to the map view.
  - Calls the backend AI analysis endpoint when the user generates an operations brief.

- `FieldModals.jsx`
  - Contains forms and modal workflows for incidents, polling-unit results, parties and personnel.
  - It is lazy-loaded because it is a large group of less frequently used workflows.

- `AssignIncidentModal.jsx`
  - Assigns incidents to field personnel and starts the related notification workflow.

- `SupervisorIncidentListModal.jsx`
  - Shows incidents within the supervisor's permitted scope.

- `IncidentNotificationModal.jsx`
  - Shows assignment and incident notifications.

- `NotificationCenter.jsx`
  - Lists notifications and supports read/delete actions.

- `ProfileModal.jsx`
  - Allows profile and password updates.

- `src/components/ui/Toast.jsx`
  - Displays short-lived success, error and information messages.

### Shared data and styles

- `shared/electionData.js`
  - Shared role, rank, command and registration-location logic.
  - Imported by both frontend and backend so authorization-related concepts stay consistent.

- `shared/nigeriaPollingData.js`
  - Generated state, LGA, ward and polling-unit hierarchy.

- `shared/historicalElectionData.js`
  - Historical election datasets, results and coverage information.

- `src/styles.css`
  - Main application layout and component styles, including map controls and dashboard sections.

- `src/admin.css`
  - Administration, user and management-panel styles.

- `src/controls.css`
  - Shared controls such as buttons, inputs and map controls.

- `src/cameras.css`
  - Camera panel and live-feed styles.

- `src/kwara-brand.css`
  - Kwara-specific branding and visual identity styles.

- `src/notification-styles.css`
  - Notification and alert styling.

- `public/manifest.webmanifest`
  - PWA name, icons, theme and installation metadata.

- `public/service-worker.js`
  - Caches selected frontend assets and supports offline navigation behavior.

## 4. Backend files and how the backend works

### Main backend

- `server/index.js`
  - Main backend entry point.
  - Creates Express and Socket.IO.
  - Loads configuration and initializes storage.
  - Seeds or updates administrator accounts.
  - Defines middleware and API routes.
  - Checks JWT authentication and user permissions.
  - Emits real-time events after important changes.
  - Handles graceful shutdown.

The backend request flow is:

1. The browser sends an HTTP request with the bearer token or session cookie.
2. Express receives the request.
3. Middleware applies CORS, security headers, body limits, rate limits and authentication where required.
4. The route validates and sanitizes incoming values.
5. The route checks role and location permissions.
6. The route reads or writes PostgreSQL/JSON data.
7. The server returns JSON to the browser.
8. For shared changes, Socket.IO broadcasts an event to connected clients.

### Storage

- `server/data.json`
  - Local fallback storage for users, incidents, cameras, map layers, chats and notifications.
  - Useful for development and demonstration.
  - It is not the preferred production database because file storage can be lost or difficult to scale.

- PostgreSQL
  - Enabled by setting `DATABASE_URL`.
  - `server/index.js` initializes the required tables and uses parameterized SQL queries.
  - This is the recommended production path.

A good answer if asked about persistence is:

> The application has a storage adapter pattern inside the server. It uses PostgreSQL when configured and falls back to JSON for local development. For production I would use PostgreSQL, migrations, backups and audit logs rather than relying on a local JSON file.

### Backend supporting modules

- `server/security.js`
  - Password, email, text, coordinate, URL, media, attachment and request-size validation.
  - Sanitizes user-controlled values before storage or use.
  - Contains rate-limit helpers.

- `server/ai.js`
  - Calls configured AI/news providers when available.
  - Provides local fallback analysis when external AI is unavailable.
  - Validates provider responses and enforces important Kwara facts.

- `server/turn.js`
  - Builds and sanitizes STUN/TURN ICE server configuration for WebRTC cameras.
  - Keeps private TURN credentials on the server.

- `server/location.js`
  - Formats reverse-geocoding responses and coordinate fallbacks.

- `server/osun2026Results.js`
  - Exports published Osun 2026 result data used by the result endpoints.

- `server/data/osun2026PollingUnitResults.json`
  - Detailed imported Osun polling-unit result data.

## 5. Important REST API groups

These are the main API groups in `server/index.js`:

- `/api/health`
  - Health check for deployment monitoring.

- `/api/auth/login` and `/api/auth/logout`
  - Authenticate users and end sessions.

- `/api/profile`
  - Read or update the current user profile and password.

- `/api/users`, `/api/report-viewers`
  - Manage personnel and permitted reporting users.

- `/api/parties`
  - Manage party records.

- `/api/incidents`
  - Create, list, update, assign and discuss incidents.

- `/api/notifications`
  - Retrieve, read and delete notifications.

- `/api/cameras`
  - Register and manage camera feeds.

- `/api/map-layers`
  - Create, update and delete custom map layers.

- `/api/chat/rooms` and `/api/chat/rooms/:id/messages`
  - Manage rooms, members and messages.

- `/api/gps/ping`
  - Receive field-user location updates.

- `/api/results`, `/api/irev/osun` and `/api/irev/osun/results`
  - Provide election result data.

- `/api/analysis/ai`, `/api/news` and `/api/news/summary`
  - Provide AI analysis and news-related data.

- `/api/location/reverse`
  - Convert coordinates into a readable location.

- `/api/turn/credentials`
  - Return validated ICE configuration without exposing raw server secrets.

## 6. Real-time Socket.IO flow

REST is used for actions that need a direct request and response. Socket.IO is used when connected clients need to receive changes immediately.

Examples:

- A user creates an incident through REST.
- The server saves it and emits an incident-created event.
- Other authorized dashboards receive the event and update without refreshing.

Real-time event groups include:

- `gps:update`, `gps:stop`, `gps:offline`
- `emergency:send`, `emergency:alert`
- Incident, user, layer and camera created/updated/deleted events
- `chat:room`, `chat:message`, `chat:deleted`
- `notification:new`
- Camera registration, sharing, viewing requests and WebRTC signaling

Socket authentication happens in the Socket.IO handshake. The server checks the bearer token before accepting the connection. Camera signaling is restricted to the intended admin and field-user communication path and has payload/rate controls.

## 7. Authentication and security explanation

The login flow is:

1. The user submits email and password.
2. The server finds the account and compares the password using `bcryptjs`.
3. If valid, it creates a short-lived JWT.
4. The JWT includes the user identity and a password-hash fingerprint.
5. The server also sets an HttpOnly session cookie.
6. The frontend stores the session object in browser storage and sends the bearer token for API calls.
7. Each protected request validates token signature, issuer, audience, expiry, active account status and password fingerprint.

Roles include `Super Admin`, `Admin`, `Supervisor` and `Agent`. The backend, not only the frontend, must enforce permissions. Supervisors can be restricted by LGA or ward, and agents have narrower operational permissions.

Security controls include:

- Bcrypt password hashing.
- JWT validation and password fingerprint invalidation.
- CORS restrictions.
- Content Security Policy and other security headers.
- Login and general request rate limits.
- Input sanitization and validation.
- Body-size, attachment and media limits.
- Parameterized database queries.
- Server-controlled allowlists for dynamic map-layer fields.
- Separate limits for GPS, emergency and camera signaling events.

A strong answer if asked about security is:

> I validate permissions on the backend because frontend checks can be bypassed. I also sanitize user input, use parameterized queries, hash passwords, validate JWT claims, apply rate limits and keep deployment secrets in environment variables. Before operational use, the remaining work includes refresh-token rotation, audit logs, account lockout, backup encryption and an independent security review.

## 8. Deployment explanation

### Vercel frontend and Render backend

- Vercel hosts the built Vite frontend.
- Render runs the Express/Socket.IO backend.
- `VITE_API_URL` tells the frontend where the Render API lives.
- `CORS_ORIGIN` tells the backend which frontend origins are allowed.
- The Render service must stay online because login, API calls, Socket.IO, cameras and AI requests depend on it.

### Deployment files

- `Dockerfile`
  - Builds the app using Node 22 Alpine.
  - Runs the production server as a non-root user.
  - Exposes port 5000.

- `render.yaml`
  - Defines the Render service, health check and environment configuration.

- `vercel.json`
  - Rewrites frontend routes to `index.html` so the SPA works on refresh.

- `railway.toml`
  - Provides an alternative Docker deployment configuration and health check.

- `DEPLOYMENT.md`
  - Detailed instructions for Render, Vercel, PostgreSQL, CORS and TURN.

- `start-dashboard.cmd`
  - Windows helper for starting the dashboard locally.

The health check is `/api/health`. A deployment is not considered healthy merely because the frontend loads; the backend, database connection and required environment variables must also work.

## 9. Scripts and tests

### Scripts

- `scripts/security-check.js`
  - Checks required security configuration and production startup settings.

- `scripts/parse_nigeria_polling_data.js`
  - Converts polling-unit source data into the shared generated data file.

- `scripts/create_polling_label_maps.js`
  - Generates polling-unit, state, LGA and ward label maps.

- `scripts/import-osun-pu-results.js`
  - Downloads/parses Osun polling-unit results.

- `scripts/create_pwa_icons.py`
  - Generates PWA icons.

- `scripts/create_role_guide.py`
  - Generates a role and responsibility DOCX guide.

### Tests

- `server/ai.test.js`: AI fallback and historical-fact behavior.
- `server/security.test.js`: sanitization, password, media and attachment validation.
- `server/turn.test.js`: TURN configuration and ICE sanitization.
- `server/location.test.js`: reverse-location formatting.
- `shared/electionData.test.js`: location and role lookup behavior.
- `shared/historicalElectionData.test.js`: dataset completeness and missing-value behavior.

The repository currently has no `test` script in `package.json`. Run the tests directly with:

```powershell
node --test server/*.test.js shared/*.test.js
```

Useful commands:

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run build
npm.cmd run security:check
```

## 10. Questions your reviewer may ask

### Why React?

React makes the interface component-based. The dashboard can be divided into map, chat, camera, notification and modal components, each with its own rendering responsibility.

### Why use both REST and Socket.IO?

REST is good for request/response operations such as login or creating an incident. Socket.IO is good for broadcasting a change to many connected users immediately.

### Why is `Dashboard.jsx` large?

It is currently the orchestration layer for many workflows. That makes the data flow easy to follow from one place, but it also makes the file a maintenance hotspot. A future refactor could extract API hooks, Socket.IO handling, map state and feature-specific controllers.

### What happens if the AI provider is unavailable?

`server/ai.js` has local fallback behavior and validates the result. The application should not depend entirely on an external AI provider for basic operation.

### What happens if PostgreSQL is unavailable?

The application can use JSON fallback storage when no database URL is configured. In production, PostgreSQL should be configured and monitored; JSON fallback is mainly for local/demo use.

### How are unauthorized actions prevented?

The backend authenticates the request, checks the user's role and scope, validates the payload and only then performs the operation. UI hiding is not treated as security.

### How are camera feeds protected?

The browser requests sanitized ICE configuration from the backend. TURN credentials remain server-side. Socket.IO signaling requires authentication and applies communication restrictions and rate controls.

### What would you improve next?

1. Split `Dashboard.jsx` into feature hooks and smaller containers.
2. Add API integration tests and frontend component tests.
3. Use database migrations and PostgreSQL in every deployed environment.
4. Add durable audit logs for login, assignment, GPS access and deletion.
5. Add refresh-token rotation, account lockout and password reset.
6. Add monitoring, backups, GPS retention rules and an independent security review.

## 11. Honest limitations to mention

This is a demonstration/early operational build. The important limitations are:

- JSON storage is not suitable as the primary production persistence layer.
- There are no comprehensive frontend or API integration tests yet.
- The dashboard controller is large and should be modularized over time.
- Production secrets must be configured in Render and never committed.
- HTTPS is required for phone GPS and native image sharing on other devices.
- TURN, AI, news, routing and geocoding depend on external provider configuration.

Being clear about these limitations is a strength in a code review. It shows that you understand not only how the current code works, but also what is required before wider operational use.

## 12. Short presentation order

When demonstrating the code, use this order:

1. Start at `src/main.jsx` and show how React starts.
2. Move to `src/App.jsx` and explain login/session selection.
3. Open `Login.jsx` and explain the authentication request.
4. Open `Dashboard.jsx` and explain that it coordinates the features.
5. Show `MapCanvas.jsx`, `ChatPanel.jsx` and `CameraPanel.jsx` as specialized views.
6. Open `server/index.js` and explain the request flow and storage choice.
7. Show `server/security.js` and explain validation.
8. Show one REST route and its matching frontend request.
9. Show one Socket.IO event and explain real-time updates.
10. Finish with `DEPLOYMENT.md` and the known production improvements.

The key sentence to remember is:

> The frontend is responsible for the user experience, the backend is responsible for trusted decisions and data, and Socket.IO keeps connected users synchronized in real time.
