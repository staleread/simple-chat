# monolith-chat

Simple monolith chat app

## Setup Guide

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

Set datasource environment variable in `.env` file:

```
DATABASE_URL="postgresql://username:password@localhost:5432/chat-db"
```

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
