# monolith-chat

## Setup Guide

### Init DB

Run PostgreSQL Docker container:

```
docker run \
--name simple-chat-db \
-e POSTGRES_USER=mykola \
-e POSTGRES_PASSWORD=1234 \
-e POSTGRES_DB=simple-chat-db \
-p 5432:5432 \
-d postgres
```

### Setup Prisma ORM

Set datasource environment variable in `.env` file:

```
DATABASE_URL="postgresql://mykola:1234@localhost:5432/simple-chat-db"
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
