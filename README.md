# Sector Tagger

Visual editor for creating, managing and tagging sectored layouts. Built with modern web technologies including Bun, Astro, Svelte 5, SQLite, and WebSocket for real-time collaboration.

## Features

- Interactive canvas for visual layout management
- Hierarchical structure (pages -> views -> sectors)
- Real-time collaboration via WebSocket
- Offline support with LocalStorage
- SQLite database for persistent storage
- SSL/HTTPS support
- Docker support for easy deployment

## Tech Stack

- **Runtime**: [Bun](https://bun.sh/) - Fast JavaScript runtime
- **Framework**: [Astro](https://astro.build/) - Modern web framework
- **UI Library**: [Svelte 5](https://svelte.dev/) - Reactive UI framework
- **Database**: [SQLite](https://www.sqlite.org/) with [Drizzle ORM](https://orm.drizzle.team/)
- **Real-time**: WebSocket for live updates
- **Development**: TypeScript for type safety

## Project Structure

```
sector-tagger/
├── certs/                    # SSL certificates
│   ├── cert.pem
│   └── key.pem
├── data/                     # Data directory
│   └── db.sqlite            # SQLite database
├── scripts/                  # Helper scripts
│   ├── init-db.ts           # Database initialization
│   ├── start-dev.sh         # Development startup
│   └── ws-server.ts         # WebSocket server
├── src/
│   ├── assets/              # Static assets
│   ├── components/          # Svelte components
│   │   ├── BaseSector.svelte     # Base sector component
│   │   ├── HoverPanel.svelte     # Hover information panel
│   │   ├── SelectedPanel.svelte  # Selected item details
│   │   ├── Tagger.svelte         # Main canvas component
│   │   └── TransformHandle.svelte # Transform controls
│   ├── layouts/             # Astro layouts
│   ├── lib/                 # Core library code
│   │   ├── api/            # API and WebSocket
│   │   │   ├── types.ts           # API types
│   │   │   ├── webSocketServer.ts # WS server
│   │   │   └── websocketClient.ts # WS client
│   │   ├── config.ts       # App configuration
│   │   ├── db/            # Database
│   │   │   ├── index.ts    # DB exports
│   │   │   ├── migrate.ts  # Migrations
│   │   │   └── schema.ts   # DB schema
│   │   └── storage/       # Storage handlers
│   │       └── localStore.ts # Local storage
│   ├── pages/              # Astro pages
│   │   └── index.astro    # Main page
│   ├── styles/            # Global styles
│   └── types/             # TypeScript types
├── .env                    # Environment variables
├── .env.example           # Environment template
├── astro.config.mjs       # Astro configuration
├── docker-compose.yml     # Docker Compose config
├── Dockerfile            # Docker build config
└── package.json          # Project metadata
```

## Key Components

### Canvas System
- `Tagger.svelte`: Main canvas component managing the layout editor
- `BaseSector.svelte`: Base component for all sector types (pages, views, sectors)
- Hierarchical rendering with proper z-index handling

### Real-time Collaboration
- WebSocket server for live updates
- Client-side WebSocket integration
- Event synchronization across clients

### Data Management
- SQLite database for persistent storage
- Drizzle ORM for type-safe database operations
- LocalStorage for offline capabilities

### UI Components
- HoverPanel: Shows quick info on hover
- SelectedPanel: Detailed information for selected items
- TransformHandle: Controls for item manipulation

## Environment Variables

```env
# Server Configuration
VITE_SERVER_HOST=localhost
VITE_SERVER_PORT=3000
VITE_SERVER_PROTOCOL=https

# WebSocket Configuration
VITE_WS_HOST=localhost
VITE_WS_PORT=4321
VITE_WS_PATH=/api/ws

# SSL Configuration
VITE_SSL_KEY_PATH=./certs/key.pem
VITE_SSL_CERT_PATH=./certs/cert.pem

# Database Configuration
VITE_DB_PATH=./data/db.sqlite

# Development Mode
VITE_DEV_MODE=true
```

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
4. Generate SSL certificates (for HTTPS):
   ```bash
   mkdir certs
   openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' \
     -keyout certs/key.pem -out certs/cert.pem
   ```
5. Initialize database:
   ```bash
   bun run scripts/init-db.ts
   ```
6. Start development server:
   ```bash
   bun run dev
   ```

## Docker Deployment

1. Build and run with Docker Compose:
   ```bash
   docker compose up --build
   ```

The application will be available at:
- Frontend: https://localhost:3000
- WebSocket: wss://localhost:4321

## Architecture

### Data Flow
1. User interactions on canvas trigger events
2. Events are processed locally and sent to WebSocket server
3. Server broadcasts events to all connected clients
4. Clients update their state and re-render affected components
5. Changes are persisted to SQLite database

### State Management
- Svelte stores for reactive state
- LocalStorage for offline persistence
- WebSocket for real-time sync
- SQLite for permanent storage

### Security
- HTTPS/WSS for secure communication
- Environment variables for configuration
- SSL certificate management

## License

MIT License - see LICENSE file for details
