# simple-chat

Simple modular monolith chat app

## Setup Guide

### Set environment variables

Create `.env` file in project root folder with the following structure:

```
DATABASE_URL="postgresql://username:password@localhost:5432/chat-db"
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

Generate Prisma client

```
pnpm prisma generate
```

Synchronize the DB with current Prisma schema

```
pnpm prisma db push
```

### Run server

```
pnpm dev
```

### Add admin user

Start prisma studio and manually add a user with `ADMIN` role

```
pnpm prisma studio
```
