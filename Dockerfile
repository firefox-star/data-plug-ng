FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=10000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/.next/standalone ./standalone
COPY --from=builder /app/.next/static ./standalone/.next/static
COPY --from=builder /app/public ./standalone/public
COPY --from=builder /app/prisma ./standalone/prisma
COPY --from=builder /app/.env ./standalone/.env

# Create required directories
RUN mkdir -p /app/standalone/db /app/standalone/uploads/payment_proofs
RUN chown -R nextjs:nodejs /app/standalone

USER nextjs
WORKDIR /app/standalone

EXPOSE 10000

CMD ["node", "server.js"]
