# --- base image with Node 20 ---
    FROM node:20-bullseye AS base
    WORKDIR /app
    
    # Enable Yarn via Corepack
    RUN corepack enable
    
    # Copy the whole repo (monorepo needs all workspaces visible)
    COPY . .
    
    # Install dependencies (no --immutable so it can hydrate in container)
    RUN yarn install
    
    # Build server + web for production (adjust if needed)
    RUN yarn nexio build -p @nexio/server --deps --wait-deps \
     && yarn nexio build -p @nexio/web --deps --wait-deps
    
    # --- runtime image ---
    FROM node:20-bullseye
    WORKDIR /app
    
    ENV NODE_ENV=production
    ENV PORT=3010
    
    # Copy built app from builder
    COPY --from=base /app ./
    
    EXPOSE 3010
    
    # Start the server (adjust if there is a dedicated start script)
    CMD ["yarn", "nexio", "dev", "-p", "@nexio/server"]