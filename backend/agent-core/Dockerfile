FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && \
    apt-get install -y curl build-essential ca-certificates && \
    rm -rf /var/lib/apt/lists/*

RUN curl -LsSf https://astral.sh/uv/install.sh | sh && \
    mv /root/.local/bin/uv /usr/local/bin/uv

RUN uv --version

COPY pyproject.toml uv.lock* ./

RUN uv sync --no-dev


# COPY . .

EXPOSE 8000

CMD ["uv", "run", "main.py"]
