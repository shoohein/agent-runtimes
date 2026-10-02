# NOTE: any Debian-based image with node/npm.
# Default base image (overridable via AGENT_BASE_IMAGE at build time).
ARG BASE_IMAGE=node:24-trixie-slim
ARG PI_VERSION=latest
FROM ${BASE_IMAGE}

ARG AGENT_UID=1000
ARG AGENT_GID=1000

USER root
RUN PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 PUPPETEER_SKIP_DOWNLOAD=1 \
    npm install -g @earendil-works/pi-coding-agent@${PI_VERSION} --omit=dev --ignore-scripts --no-audit --no-fund \
    && npm cache clean --force \
    && rm -rf /root/.npm

RUN groupadd -o --gid "$AGENT_GID" agent \
  && useradd -o --uid "$AGENT_UID" --gid "$AGENT_GID" \
  --create-home --home-dir /home/agent --shell /bin/bash agent
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
ENV UV_TOOL_DIR=/opt/uv-tools
ENV UV_TOOL_BIN_DIR=/usr/local/bin
RUN uv tool install pre-commit==4.6.2 \
    && uv cache clean

USER agent
# Seed the npm volume mountpoint as agent (avoids a root-owned dir)
RUN mkdir -p /home/agent/.pi/agent/npm
# Seed cache dirs as agent (pre-commit hook envs + go build cache need write access)
RUN mkdir -p /home/agent/.cache/pre-commit /home/agent/.cache/go-build
