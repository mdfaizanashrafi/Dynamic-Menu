# Deployment Guide

This guide covers the complete deployment process for DynamicMenu, including prerequisites, environment setup, database configuration, and deployment steps for both frontend and backend.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Post-Deployment Checklist](#post-deployment-checklist)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Server Requirements

#### Minimum Specifications

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 2 cores | 4+ cores |
| RAM | 2 GB | 4+ GB |
| Storage | 20 GB SSD | 50+ GB SSD |
| Bandwidth | 1 TB/month | 5+ TB/month |

#### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 18.x LTS | Runtime environment |
| PostgreSQL | 14+ | Primary database |
| Redis | 7+ | Caching & sessions |
| Nginx | 1.18+ | Reverse proxy |
| PM2 | 5.x | Process management |

### Domain & SSL

- Registered domain name
- SSL certificate (Let's Encrypt recommended)
- DNS access for subdomain configuration

### Cloud Provider Options

| Provider | Services | Estimated Cost/Month |
|----------|----------|---------------------|
| AWS | EC2, RDS, S3, CloudFront | $50-200 |
| Google Cloud | Compute Engine, Cloud SQL | $50-200 |
| DigitalOcean | Droplet, Managed Database | $20-80 |
| Hetzner | Cloud Server | $10-50 |
| Vercel + Railway | Serverless + Managed DB | $0-50 |

---

## Environment Setup

### Server Initialization

```bash
# Update system packages (Ubuntu/Debian)
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git nginx postgresql postgresql-contrib redis-server

# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installations
node --version  # v18.x.x
npm --version   # 9.x.x
psql --version  # 14.x
redis-cli --version
```

### Create Application User

```bash
# Create dedicated user for the application
sudo useradd -m -s /bin/bash dynamicmenu
sudo usermod -aG sudo dynamicmenu

# Switch to application user
sudo su - dynamicmenu

# Create application directory
mkdir -p ~/app
cd ~/app
```

### Directory Structure

```
/home/dynamicmenu/
├── app/
│   ├── backend/           # Backend application
│   ├── frontend/          # Frontend build files
│   └── uploads/           # File uploads directory
├── logs/                  # Application logs
│   ├── backend/
│   └── nginx/
├── backups/               # Database backups
└── scripts/               # Deployment scripts
    ├── deploy.sh
    └── backup.sh
```

---

## Database Setup

### PostgreSQL Configuration

```bash
# Switch to postgres user
sudo su - postgres

# Create database and user
psql << EOF
CREATE USER dynamicmenu WITH PASSWORD 'your-secure-password';
CREATE DATABASE dynamicmenu OWNER dynamicmenu;
GRANT ALL PRIVILEGES ON DATABASE dynamicmenu TO dynamicmenu;
\q
EOF

# Exit postgres user
exit
```

### PostgreSQL Security Hardening

```bash
# Edit PostgreSQL configuration
sudo nano /etc/postgresql/14/main/postgresql.conf

# Update these settings:
listen_addresses = 'localhost'  # Only local connections
max_connections = 100
shared_buffers = 256MB
work_mem = 4MB
maintenance_work_mem = 64MB

# Configure pg_hba.conf for local connections
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Ensure these lines exist:
local   all             all                                     peer
host    all             all             127.0.0.1/32            scram-sha-256
host    all             all             ::1/128                 scram-sha-256

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Redis Configuration

```bash
# Edit Redis configuration
sudo nano /etc/redis/redis.conf

# Security settings
bind 127.0.0.1
port 6379
requirepass your-redis-password

# Memory settings
maxmemory 256mb
maxmemory-policy allkeys-lru

# Enable persistence
save 900 1
save 300 10
save 60 10000

# Restart Redis
sudo systemctl restart redis
sudo systemctl enable redis
```

### Database Backup Script

```bash
# Create backup script
sudo tee /home/dynamicmenu/scripts/backup.sh << 'EOF'
#!/bin/bash

# Configuration
DB_NAME="dynamicmenu"
DB_USER="dynamicmenu"
BACKUP_DIR="/home/dynamicmenu/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup database
pg_dump -U "$DB_USER" -h localhost "$DB_NAME" | gzip > "$BACKUP_DIR/db_backup_$DATE.sql.gz"

# Backup uploads
if [ -d "/home/dynamicmenu/app/uploads" ]; then
    tar -czf "$BACKUP_DIR/uploads_backup_$DATE.tar.gz" -C /home/dynamicmenu/app uploads
fi

# Remove old backups
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Log backup
logger "DynamicMenu backup completed: db_backup_$DATE.sql.gz"
EOF

chmod +x /home/dynamicmenu/scripts/backup.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /home/dynamicmenu/scripts/backup.sh") | crontab -
```

---

## Backend Deployment

### 1. Clone and Configure

```bash
# Switch to application user
sudo su - dynamicmenu
cd ~/app

# Clone repository (or upload via SCP/SFTP)
git clone https://github.com/your-org/dynamicmenu.git .
# OR extract uploaded archive
tar -xzf dynamicmenu-backend.tar.gz

# Navigate to backend
cd backend

# Install dependencies
npm ci --only=production

# Create environment file
cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://dynamicmenu:your-secure-password@localhost:5432/dynamicmenu?schema=public"

# Server
PORT=3001
NODE_ENV=production
API_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-change-this
JWT_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://:your-redis-password@localhost:6379

# File Storage (AWS S3 - optional)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_REGION=us-east-1

# Email (optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=noreply@yourdomain.com

# Logging
LOG_LEVEL=info
EOF
```

### 2. Database Migration

```bash
cd ~/app/backend

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Verify database connection
npx prisma db pull
```

### 3. Build Application

```bash
# Build TypeScript
npm run build

# Verify build
ls -la dist/
```

### 4. PM2 Process Management

```bash
# Install PM2 globally
sudo npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'dynamicmenu-api',
      script: './dist/server.js',
      instances: 'max',        // Use all CPU cores
      exec_mode: 'cluster',    // Enable clustering
      env: {
        NODE_ENV: 'production',
      },
      error_file: '/home/dynamicmenu/logs/backend/err.log',
      out_file: '/home/dynamicmenu/logs/backend/out.log',
      log_file: '/home/dynamicmenu/logs/backend/combined.log',
      time: true,
      max_memory_restart: '500M',
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',
      kill_timeout: 5000,
      listen_timeout: 10000,
      // Auto-restart on failure
      autorestart: true,
      // Don't restart if crashing too fast
      exp_backoff_restart_delay: 100,
    },
  ],
};
EOF

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup

# Monitor application
pm2 status
pm2 logs dynamicmenu-api
pm2 monit
```

### 5. Nginx Configuration

```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/dynamicmenu << 'EOF'
upstream dynamicmenu_backend {
    server 127.0.0.1:3001;
    keepalive 64;
}

# Rate limiting zone
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

server {
    listen 80;
    server_name api.yourdomain.com;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Logging
    access_log /home/dynamicmenu/logs/nginx/api-access.log;
    error_log /home/dynamicmenu/logs/nginx/api-error.log;
    
    # Client body size for uploads
    client_max_body_size 10M;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        application/json
        application/javascript
        application/rss+xml
        application/atom+xml
        image/svg+xml;

    location / {
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://dynamicmenu_backend;
        proxy_http_version 1.1;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint (no rate limiting)
    location /api/health {
        proxy_pass http://dynamicmenu_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Static file serving (if needed)
    location /uploads {
        alias /home/dynamicmenu/app/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/dynamicmenu /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 6. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal test
sudo certbot renew --dry-run

# Ensure auto-renewal is set up
sudo systemctl status certbot.timer
```

### 7. Firewall Configuration

```bash
# Configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (adjust port if needed)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status verbose
```

---

## Frontend Deployment

### Option 1: Static Hosting (Recommended)

#### Build Frontend

```bash
# On local machine or CI/CD
cd frontend

# Install dependencies
npm ci

# Create production environment
cat > .env.production << 'EOF'
VITE_API_URL=https://api.yourdomain.com
VITE_APP_URL=https://yourdomain.com
EOF

# Build for production
npm run build

# Verify build
ls -la dist/
```

#### Deploy to CDN/Static Host

##### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configure environment variables on Vercel Dashboard:
# VITE_API_URL=https://api.yourdomain.com
```

##### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist

# Or use drag-and-drop on Netlify Dashboard
```

##### AWS S3 + CloudFront

```bash
# Sync build to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### Option 2: Nginx Static Serving

```bash
# Create frontend directory
sudo mkdir -p /var/www/dynamicmenu
cd /var/www/dynamicmenu

# Copy or extract build files
sudo tar -xzf /path/to/frontend-build.tar.gz

# Set permissions
sudo chown -R www-data:www-data /var/www/dynamicmenu
sudo chmod -R 755 /var/www/dynamicmenu

# Create Nginx config
sudo tee /etc/nginx/sites-available/dynamicmenu-frontend << 'EOF'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Logging
    access_log /home/dynamicmenu/logs/nginx/frontend-access.log;
    error_log /home/dynamicmenu/logs/nginx/frontend-error.log;
    
    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /var/www/dynamicmenu;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
    
    # Main application (SPA routing)
    location / {
        root /var/www/dynamicmenu;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # No-cache for HTML
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/dynamicmenu-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Post-Deployment Checklist

### Pre-Launch Verification

#### Backend Checks

- [ ] API health endpoint returns 200 OK
  ```bash
  curl https://api.yourdomain.com/api/health
  ```
- [ ] Database migrations applied successfully
- [ ] Redis connection established
- [ ] PM2 processes running (`pm2 status`)
- [ ] Logs are being written (`pm2 logs`)
- [ ] SSL certificate valid and not expired
- [ ] Nginx serving requests without errors
- [ ] Rate limiting active
- [ ] Security headers present

#### Frontend Checks

- [ ] Application loads without console errors
- [ ] All API requests succeed (check Network tab)
- [ ] Assets loading with correct MIME types
- [ ] Favicon and meta tags present
- [ ] Responsive design working on mobile
- [ ] PWA manifest and service worker (if applicable)

#### Functionality Checks

- [ ] User registration works
- [ ] User login works
- [ ] JWT tokens are generated and validated
- [ ] Restaurant creation works
- [ ] Menu items can be created/updated/deleted
- [ ] QR codes can be generated
- [ ] Public menu page loads
- [ ] File uploads work (if S3 configured)

### Monitoring Setup

#### Application Monitoring (PM2)

```bash
# Enable PM2 monitoring
pm2 monitor

# Setup keymetrics.io (optional)
pm2 link <secret> <public>
```

#### Log Monitoring

```bash
# Install and configure Logrotate
sudo tee /etc/logrotate.d/dynamicmenu << 'EOF'
/home/dynamicmenu/logs/backend/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0644 dynamicmenu dynamicmenu
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}

/home/dynamicmenu/logs/nginx/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 www-data adm
    sharedscripts
    postrotate
        systemctl reload nginx
    endscript
}
EOF
```

#### Uptime Monitoring

Set up external monitoring with services like:
- UptimeRobot (free tier available)
- Pingdom
- StatusCake
- Datadog Synthetics

Configure checks for:
- `https://api.yourdomain.com/api/health` (API)
- `https://yourdomain.com` (Frontend)

### Security Checklist

- [ ] All secrets changed from defaults
- [ ] Database password is strong
- [ ] JWT secret is at least 32 characters
- [ ] Redis has authentication enabled
- [ ] SSH key authentication only (no password)
- [ ] Unnecessary ports closed in firewall
- [ ] Automatic security updates enabled
- [ ] Fail2Ban installed and configured

```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Basic configuration
sudo tee /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
EOF

sudo systemctl restart fail2ban
```

### Backup Verification

- [ ] Automated backups scheduled
- [ ] Backup files are being created
- [ ] Test restore procedure

```bash
# Test database restore
# 1. Create test database
sudo -u postgres createdb dynamicmenu_test

# 2. Restore from backup
gunzip < /home/dynamicmenu/backups/db_backup_YYYYMMDD_HHMMSS.sql.gz | \
  sudo -u postgres psql dynamicmenu_test

# 3. Verify data
sudo -u postgres psql dynamicmenu_test -c "SELECT COUNT(*) FROM users;"

# 4. Clean up
sudo -u postgres dropdb dynamicmenu_test
```

### Documentation

- [ ] API documentation accessible
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Rollback procedure documented
- [ ] Team members have server access

---

## Troubleshooting

### Common Issues

#### Application Won't Start

```bash
# Check PM2 logs
pm2 logs dynamicmenu-api --lines 100

# Check for port conflicts
sudo netstat -tlnp | grep 3001

# Verify environment variables
cat ~/app/backend/.env

# Test database connection
psql $DATABASE_URL -c "SELECT 1;"
```

#### Database Connection Errors

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
sudo -u postgres psql -c "\l"

# Verify user exists
sudo -u postgres psql -c "\du"

# Check pg_hba.conf
sudo cat /etc/postgresql/14/main/pg_hba.conf | grep -v "^#"
```

#### Nginx Errors

```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Check access logs
sudo tail -f /var/log/nginx/access.log

# Verify upstream is responding
curl http://127.0.0.1:3001/api/health
```

#### SSL Certificate Issues

```bash
# Test certificate
openssl s_client -connect api.yourdomain.com:443 -servername api.yourdomain.com

# Renew certificate manually
sudo certbot renew --force-renewal

# Check certificate expiry
echo | openssl s_client -servername api.yourdomain.com -connect api.yourdomain.com:443 2>/dev/null | \
  openssl x509 -noout -dates
```

#### High Memory Usage

```bash
# Check memory usage
free -h
pm2 monit

# Restart application
pm2 restart dynamicmenu-api

# Check for memory leaks
pm2 logs dynamicmenu-api | grep -i "memory"
```

### Quick Recovery Commands

```bash
# Full application restart
pm2 stop all
pm2 start all

# Clear PM2 logs
pm2 flush

# Reload Nginx
sudo systemctl reload nginx

# Restart PostgreSQL
sudo systemctl restart postgresql

# Restart Redis
sudo systemctl restart redis
```

### Emergency Rollback

```bash
# Rollback to previous version
cd ~/app/backend

# Restore from backup (if needed)
git log --oneline -10  # View recent commits
git checkout <previous-commit>

# Reinstall dependencies
npm ci --only=production

# Rebuild
npm run build

# Restart application
pm2 restart all

# Verify rollback
curl https://api.yourdomain.com/api/health
```

---

## Maintenance Procedures

### Weekly Maintenance

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Review error logs
pm2 logs --err --lines 50

# Update packages
sudo apt update && sudo apt upgrade -y

# Restart services (if needed)
sudo systemctl restart nginx
pm2 restart all
```

### Monthly Maintenance

```bash
# Review and rotate logs
sudo logrotate -f /etc/logrotate.conf

# Clean old backups
find ~/backups -name "*.gz" -mtime +30 -delete

# Update Node.js (if new LTS available)
# Review and update dependencies
npm outdated
npm update

# Security audit
npm audit
npm audit fix

# Review firewall rules
sudo ufw status verbose
```

---

## Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
