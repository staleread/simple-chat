FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY src package.json /app
WORKDIR /app

FROM base AS prod-deps
COPY pnpm-* /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
CMD [ "pnpm", "start" ]
