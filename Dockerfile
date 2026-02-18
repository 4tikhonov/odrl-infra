FROM ruby:3.2-alpine

# Install dependencies
RUN apk add --no-cache libsodium-dev git make gcc musl-dev jq bash curl python3 py3-pip openssh && \
    gem install httparty ed25519 multibases multihashes multicodecs optparse rbnacl dag uri oydid && \
    gem install json-canonicalization -v 0.2.1 && \
    gem install securerandom -v 0.1.1 && \
    gem update

# Install Python dependencies for testing and API
RUN pip3 install --no-cache --upgrade pip setuptools pytest fastapi uvicorn google-auth requests rdflib --break-system-packages

# Setup OYDID CLI
COPY cli/oydid.rb /usr/local/bin/oydid
RUN chmod 755 /usr/local/bin/oydid

# Copy test script and API app
COPY test_oydid.py /usr/src/app/test_oydid.py
COPY app /usr/src/app/app
WORKDIR /usr/src/app

# Default command matches docker-compose, but useful if run standalone
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
