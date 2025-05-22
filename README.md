# simple-chat

Simple modular monolith chat app

## Setup Guide

The app consists of a Node.js Fastify API, a PostgreSQL database, and a Redis cache. You can run it in two main ways:

### 1. Using Docker Compose

Create a `.env.docker` file using the following template:

```
POSTGRES_USER=username
POSTGRES_PASSWORD=password
POSTGRES_DB=chat-db
SERVER_URL=http://localhost:8000
REDIS_URL=redis://chat-redis
ADMIN_PASSWORD=admin
RATE_LIMIT=100
RATE_LIMIT_TIME_WINDOW=60000
PASSWORD_SALT='$2b$10$Base64SaltWithLength22'
JWT_SECRET=secret
JWT_EXPIRES_IN=15m
```

To start the services:

```
pnpm docker:up
```

To stop them:

```
pnpm docker:down
```

Swagger docs will be available at [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Local Development with Dockerized Databases

If you prefer to run only the API locally and use Docker for the database/cache:

Start PostgreSQL:

```
docker run -d --name chat-postgres -p 5432:5432 \
  -e POSTGRES_USER=username \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=chat-db \
  postgres
```

Start Redis:

```
docker run -d --name chat-redis -p 6379:6379 redis
```

Create a .env file:

```
PORT=8000
SERVER_URL=http://localhost:8000
RATE_LIMIT=100
RATE_LIMIT_TIME_WINDOW=60000
REDIS_URL=redis://localhost
POSTGRES_URL=postgresql://username:password@localhost:5432/chat-db
ADMIN_PASSWORD=admin
PASSWORD_SALT='$2b$10$Base64SaltWithLength22'
JWT_SECRET=secret
JWT_EXPIRES_IN=15m
```

Push DB schema and seed data (optional):

```
pnpm db:deploy
```

Start the app in watch mode:

```
pnpm dev
```

Swagger docs will be available at [http://localhost:8000/docs](http://localhost:8000/docs)
