# Fresher.AI — Production Deployment Guide

This guide details two deployment strategies:
1. **Full-Stack Deployment on AWS EC2 with Docker Compose** (Recommended for academic & demo presentations).
2. **Decoupled Deployment: Static Frontend on AWS S3/CloudFront + Backend Microservices on EC2**.

---

## Architecture Topology

```
                       Internet (HTTPS :443)
                                │
                                ▼
                       ┌─────────────────┐
                       │   Nginx Proxy   │ (Reverse Proxy & SSL Certbot)
                       └────────┬────────┘
                                │
          ┌─────────────────────┴─────────────────────┐
          ▼                                           ▼
┌─────────────────────────┐               ┌─────────────────────────┐
│     Client (Vite)       │               │   API Gateway (:5000)   │
│  http://localhost:5173  │               │                         │
└─────────────────────────┘               └───────────┬─────────────┘
                                                      │ Proxies
                         ┌─────────────┬──────────────┼─────────────┬─────────────┐
                         ▼             ▼              ▼             ▼             ▼
                   ┌──────────┐  ┌──────────┐   ┌──────────┐  ┌──────────┐  ┌──────────┐
                   │   User   │  │  Resume  │   │Interview │  │ Feedback │  │ Roadmap  │
                   │  Service │  │  Service │   │ Service  │  │ Service  │  │ Service  │
                   │  (:5001) │  │  (:5002) │   │ (:5003)  │  │ (:5004)  │  │ (:5005)  │
                   └────┬─────┘  └────┬─────┘   └────┬─────┘  └────┬─────┘  └────┬─────┘
                        │             │              │             │             │
                        └─────────────┼──────────────┴─────────────┴─────────────┘
                                      │
                         ┌────────────┴────────────┐
                         ▼                         ▼
                  ┌───────────────┐         ┌───────────────┐
                  │ MongoDB :27017│         │  Redis :6379  │
                  └───────────────┘         └───────────────┘
```

---

## Strategy 1: AWS EC2 + Docker Compose

### 1. Launch EC2 Instance
- **AMI**: Ubuntu 24.04 LTS (x86_64).
- **Instance Type**: `t3.large` or `t3.medium` (minimum 4GB RAM recommended for compiling microservices and containers).
- **Security Group Inbound Rules**:
  - `SSH (22)`: Your IP
  - `HTTP (80)`: `0.0.0.0/0`
  - `HTTPS (443)`: `0.0.0.0/0`
  - `Client Dev (5173)`: `0.0.0.0/0` (Optional during testing)
  - `Gateway (5000)`: `0.0.0.0/0` (Optional during testing)

### 2. Install Docker & Docker Compose on Ubuntu
```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg git

# Install Docker Engine
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Allow non-root docker commands
sudo usermod -aG docker $USER
newgrp docker
```

### 3. Clone Repository and Configure `.env`
```bash
git clone https://github.com/your-username/fresher-ai.git
cd fresher-ai

cp .env.example .env
nano .env # Enter GEMINI_API_KEY and public EC2 DNS/IP
```

### 4. Build and Start Full Container Mesh
```bash
docker compose up -d --build
```

Verify running containers:
```bash
docker compose ps
```

---

## Strategy 2: Nginx Reverse Proxy with SSL (Production)

### 1. Install Nginx and Certbot
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 2. Configure `/etc/nginx/sites-available/fresher-ai`
```nginx
server {
    server_name fresherai.yourdomain.com;

    # Frontend Client
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API Gateway
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 25M;
    }
}
```

### 3. Enable Site & Generate Free SSL Certificate
```bash
sudo ln -s /etc/nginx/sites-available/fresher-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Issue Let's Encrypt SSL
sudo certbot --nginx -d fresherai.yourdomain.com
```

---

## Strategy 3: AWS S3 + CloudFront Static Hosting (Optional)

1. Build client dist:
   ```bash
   npm --prefix client run build
   ```
2. Create an AWS S3 Bucket (e.g. `fresher-ai-client-prod`). Enable static website hosting.
3. Sync dist folder to S3:
   ```bash
   aws s3 sync client/dist s3://fresher-ai-client-prod --delete
   ```
4. Create an AWS CloudFront Distribution pointing to the S3 bucket origin. Configure custom error responses to return `/index.html` on `404` (for React Router client-side routing).

