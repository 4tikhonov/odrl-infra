# Stage 1: Build Frontend
FROM node:20-alpine as frontend-build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

# Stage 2: Backend & Runtime
FROM ruby:3.2-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
    libsodium-dev git make gcc libc-dev jq bash curl python3 python3-pip openssh-client && \
    rm -rf /var/lib/apt/lists/* && \
    gem install httparty ed25519 multibases multihashes multicodecs optparse rbnacl dag uri oydid && \
    gem install json-canonicalization -v 0.2.1 && \
    gem install securerandom -v 0.1.1 && \
    gem update

# Install Python dependencies
# Added aiofiles for FastAPI StaticFiles
RUN pip3 install --no-cache pytest fastapi uvicorn google-auth requests rdflib aiofiles qdrant-client fastembed --break-system-packages

# Setup OYDID CLI
COPY oydid/cli/oydid.rb /usr/local/bin/oydid
RUN chmod 755 /usr/local/bin/oydid

# Copy test script and API app
COPY tests /usr/src/app/tests
COPY app /usr/src/app/app

# Copy Frontend Build Artifacts
# Copy to a location outside /usr/src/app to avoid volume masking
COPY --from=frontend-build /app/dist /frontend_dist

WORKDIR /usr/src/app

# Default command matches docker-compose, but useful if run standalone
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
