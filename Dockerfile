FROM --platform=linux/amd64 oven/bun:1.0 as base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install
RUN bun add -g concurrently

# Build the app
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Production image
FROM base AS runner
ENV NODE_ENV=production
ENV WS_PORT=4321
ENV WS_HOST=0.0.0.0

# Create app directory
WORKDIR /app

# Copy everything
COPY --from=builder /app ./

# Install production dependencies including concurrently
RUN bun install -g concurrently

# Create data directory for SQLite
RUN mkdir -p /app/data

# Copy production env file
COPY .env.production .env

# Create SSL directory and copy certs
RUN mkdir -p /app/certs
COPY ./certs/* /app/certs/

EXPOSE 3000
EXPOSE 4321

CMD ["bun", "run", "start"]
