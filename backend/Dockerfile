# Use official Playwright Python base image with pre-installed Linux browser dependencies
FROM mcr.microsoft.com/playwright/python:v1.48.0-noble

# Set memory & threading optimizations for Render Free 512MB RAM limit
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000 \
    MALLOC_ARENA_MAX=2 \
    OMP_NUM_THREADS=1 \
    MKL_NUM_THREADS=1 \
    OPENBLAS_NUM_THREADS=1 \
    HF_HUB_DISABLE_SYMLINKS_WARNING=1

# Set working directory
WORKDIR /app

# Install lightweight CPU-only PyTorch first to save >300MB RAM compared to CUDA PyTorch
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Copy requirements and install remaining python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Ensure Playwright chromium browser is installed
RUN playwright install chromium

# Copy application source code
COPY . .

# Expose port
EXPOSE 8000

# Run FastAPI backend with Uvicorn dynamically binding to PORT
CMD exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
