# simple-chat

Simple modular monolith chat app

## Setup Guide

### Set environment variables

Create `.env` file in project root folder with the following structure:

```
DATABASE_URL="postgresql://username:password@localhost:5432/chat-db"
ADMIN_PASSWORD="1234"
PASSWORD_SALT="$2b$10$exactly-22-char-salt.."
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="15m"
```

### Init DB

Run PostgreSQL Docker container:

```
docker run \
--name chat-db \
-e POSTGRES_USER=username \
-e POSTGRES_PASSWORD=password \
-e POSTGRES_DB=chat-db \
-p 5432:5432 \
-d postgres
```

### Setup Prisma ORM

Install dependencies:

```
pnpm install
```

Synchronize the DB with current Prisma schema and generate Prisma Cient

```
pnpm prisma db push
```

Seed the DB (add admin user)

```
pnpm prisma db seed
```

### Run server

```
pnpm dev
```
