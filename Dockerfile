FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN mkdir -p /usr/bin/app/{prisma,src}
WORKDIR /usr/bin/app
COPY /package.json .
COPY /src ./src
COPY /prisma/schema.prisma ./prisma/.

FROM base AS prod-deps
COPY /pnpm-lock.yaml /pnpm-workspace.yaml .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base
COPY --from=prod-deps /usr/bin/app/node_modules ./node_modules
RUN pnpm prisma generate
CMD [ "pnpm", "start" ]
