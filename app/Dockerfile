FROM oven/bun:1.1.10
RUN useradd -ms /bin/sh -u 1001 app
USER app

WORKDIR /app
# User relative path from the project root
COPY ./package.json ./
RUN bun install

# Copy source files into application directory
COPY --chown=app:app . /app
