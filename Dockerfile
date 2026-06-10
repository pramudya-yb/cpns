FROM oven/bun:1 as base
WORKDIR /app

# Copy configuration and workspaces
COPY package.json bun.lock turbo.json ./
COPY apps ./apps
COPY packages ./packages

# Install dependencies using Bun
RUN bun install --frozen-lockfile

# Build the API server
ENV NODE_ENV=production
RUN bunx turbo build -F server

# Expose port (biasanya Back4App menggunakan port otomatis, tapi kita set 3000 sesuai default)
EXPOSE 3000

# Jalankan server
CMD ["bun", "run", "--cwd", "apps/server", "start"]
