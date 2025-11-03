# Use official Python 3.11 slim image
FROM python:3.11-slim

# Install system dependencies (build essentials for compiling C extensions)
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Upgrade pip and install all python dependencies
RUN pip install --upgrade pip setuptools wheel
RUN pip install -r requirements.txt

# Expose port 5001
EXPOSE 5001

# Start the app using gunicorn and gevent worker
CMD ["gunicorn", "--worker-class", "gevent", "-w", "1", "--bind", "0.0.0.0:5001", "wsgi:app"]
