# ===== BASE ======
FROM node:22-slim AS base
WORKDIR /usr/bin/app

COPY /package.json .
COPY /src ./src

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apt-get update -y && apt-get install -y openssl
RUN corepack enable && corepack prepare pnpm@10.9.0 --activate

# ====== BUILDER ======
FROM base AS builder
COPY /pnpm-lock.yaml /pnpm-workspace.yaml .
COPY /prisma ./prisma

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile
RUN pnpm prisma -v && pnpm prisma generate

# ====== PRODUCTION ======
FROM base
COPY --from=builder /usr/bin/app/node_modules ./node_modules
COPY --from=builder /usr/bin/app/prisma ./prisma
CMD [ "sh", "-c", "pnpm db:deploy && pnpm start" ]
