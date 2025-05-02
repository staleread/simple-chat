# simple-chat

Simple modular monolith chat app

## Setup Guide

The app consists of Node.js API and Postgres database. Here is how you can
run both using Docker containers

### Create Docker bridge network

```
docker network create -d bridge chat-net
```

### Run DB container

```
docker run -d --name chat-db --network chat-net -p 5432:5432 \
-e POSTGRES_USER=username \
-e POSTGRES_PASSWORD=password \
-e POSTGRES_DB=chat-db \
postgres
```

### Build and run API container

First, `cd` to project root. Create a `.env` file with the contents like this:

```
PORT=8000
DATABASE_URL=postgresql://username:password@chat-db:5432/chat-db
ADMIN_PASSWORD=1234
PASSWORD_SALT=$2b$10$exactly22chars-of-salt
JWT_SECRET=some-secret
JWT_EXPIRES_IN=15m
```

> [!IMPORTANT]
> Ensure you are not using the quotes in that file. (See [the article](https://dev.to/tvanantwerp/don-t-quote-environment-variables-in-docker-268h))

Now build the Docker image (remember, you are still in the project root folder)

```
docker build -t chat-api .
```

And finally run the container in the network

```
docker run -d --name chat-api --network chat-net \
-p 8000:8000 --env-file .env chat-api
```

Checkout Swagger docs running on [http://localhost:8000/docs](http://localhost:8000/docs)
