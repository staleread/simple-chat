# simple-chat

Simple modular monolith chat app

## Setup Guides

The app consists of Node.js API and Postgres database. Here are some ways
how you can run them

### 1. Using Docker Compose

Setup `.env.docker` file with the template:

```
DB_USER=username
DB_PASSWORD=password
DB_NAME=chat-db
PASSWORD_SALT='$2b$10$exactly22chars-of-salt'
JWT_SECRET=secret
JWT_EXPIRES_IN=15m
```

Just run in project root folder

```
pnpm docker:up
```

Checkout Swagger docs running on [http://localhost:8000/docs](http://localhost:8000/docs)

And then to delete the containers

```
pnpm docker:down
```

### 2. As Node.js app with DB Docker container

Run DB container

```
docker run -d --name chat-db -p 5432:5432 \
-e POSTGRES_USER=username \
-e POSTGRES_PASSWORD=password \
-e POSTGRES_DB=chat-db \
postgres
```

Generate Prisma client

```
pnpm prisma generate
```

Setup `.env` file with the template:

```
PORT=8000
DATABASE_URL=postgresql://username:password@localhost:5432/chat-db
PASSWORD_SALT='$2b$10$exactly22chars-of-salt'
JWT_SECRET=secret
JWT_EXPIRES_IN=15m
```

And run local app with

```
pnpm dev
```

Checkout Swagger docs running on [http://localhost:8000/docs](http://localhost:8000/docs)
