FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN apt-get update
RUN apt-get install -y openssl
RUN corepack enable && corepack prepare pnpm@10.9.0 --activate
WORKDIR /usr/bin/app
COPY /package.json /src .
COPY /src ./src

FROM base AS deps
COPY /pnpm-lock.yaml /pnpm-workspace.yaml .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM deps AS prisma
COPY /prisma ./prisma
RUN pnpm prisma generate

FROM base
COPY --from=deps /usr/bin/app/node_modules ./node_modules
COPY --from=prisma /usr/bin/app/prisma ./prisma
CMD [ "pnpm", "start" ]
