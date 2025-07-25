ARG NODE_VERSION=22.15
 
################################################################################
# Use node image for base image for all stages.
FROM node:${NODE_VERSION}-alpine AS base
 
# Set working directory for all build stages.
WORKDIR /src/frontend

COPY .env.local .

################################################################################
# Create a stage for installing production dependencies.
FROM base AS deps
 
# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.yarn to speed up subsequent builds.
# Leverage bind mounts to package.json and yarn.lock to avoid having to copy them
# into this layer.
RUN --mount=type=bind,source=./frontend/package.json,target=package.json \
   --mount=type=bind,source=./frontend/package-lock.json,target=package-lock.json \
    npm ci
 
################################################################################
# Create a stage for building the application.
FROM deps AS build
 
# Copy the rest of the source files into the image.
COPY ./frontend .
 
# Run the build script.
RUN npm run build

################################################################################
# Create a new stage to run the application with minimal runtime dependencies
# where the necessary files are copied from the build stage.
FROM base AS final
 
# Use production node environment by default.
ENV NODE_ENV=production
 
# Run the application as a non-root user.
USER node
 
# Copy package.json so that package manager commands can be used.
COPY ./frontend/package.json .
 
# Copy the production dependencies from the deps stage and also
# the built application from the build stage into the image.
COPY --from=deps /src/frontend/node_modules /src/frontend/node_modules
COPY --from=build /src/frontend/.output /src/frontend/.output
COPY --from=build /src/frontend/.vinxi /src/frontend/.vinxi
COPY --from=build /src/frontend/.env.local /src/frontend/.env.local
 
# Expose the port that the application listens on.
EXPOSE 3000
