FROM python:3.11-slim

WORKDIR /app

# Install system dependencies + chromium
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    ca-certificates \
    chromium \
    chromium-driver \
    fonts-liberation \
    libnss3 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libatspi2.0-0 \
    libpangocairo-1.0-0 \
    libxss1 \
    && rm -rf /var/lib/apt/lists/*

# Use system Chromium for Selenium inside the container (required for crawling)
ENV USE_SYSTEM_CHROMIUM=1

# Verify Chromium installation - THIS IS CRITICAL
RUN echo "=== Verifying Chromium Installation ===" && \
    which chromium && \
    which chromedriver && \
    ls -la /usr/bin/chromium* && \
    ls -la /usr/bin/chromedriver* && \
    chromium --version && \
    chromedriver --version

# Install uv
RUN curl -LsSf https://astral.sh/uv/install.sh | sh && \
    mv /root/.local/bin/uv /usr/local/bin/uv

COPY pyproject.toml uv.lock* ./
RUN uv sync --no-dev

COPY . .

EXPOSE 8000 50051

CMD ["uv", "run", "main.py"]