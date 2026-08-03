# Use official Playwright Python base image with pre-installed Linux browser dependencies
FROM mcr.microsoft.com/playwright/python:v1.48.0-noble

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

# Set working directory
WORKDIR /app

# Copy requirements and install python packages
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
