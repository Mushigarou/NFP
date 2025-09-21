FROM node:18

WORKDIR /app

COPY ./package*.json ./

RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

# /* -------------------------------------------------------------------------- */
# /*                             Build Docker File                              */
# /* -------------------------------------------------------------------------- */

# # Base image
# FROM node:23-alpine AS base
# RUN apk add --no-cache g++ make py3-pip libc6-compat
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# EXPOSE 3000

# # Build stage
# ARG NEXT_PUBLIC_BASE_URL
# ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}

# FROM base AS builder
# WORKDIR /app
# COPY . .
# # Make the env available for Next.js build and runtime
# RUN echo "NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}" > .env
# RUN npm run build

# # Production stage
# FROM base AS production
# WORKDIR /app

# ENV NODE_ENV=production
# RUN npm ci

# RUN addgroup -g 1001 -S nodejs
# RUN adduser -S nextjs -u 1001
# USER nextjs

# COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/package.json ./package.json
# COPY --from=builder /app/public ./public
# # Copy generated env file
# COPY --from=builder /app/.env ./.env

# CMD ["npm", "start"]