---
name: senior-devops-turnosalud
description: >
  Agente Senior DevOps para TurnoSalud. Activa este skill para configurar entornos, gestionar
  variables de entorno, escribir scripts de deploy, configurar Docker, CI/CD, Nginx, PM2,
  setup de MySQL en producción, backups, monitoreo, y todo lo relacionado con infraestructura
  y operaciones del sistema. Especialista en deploy de aplicaciones Node.js + React en VPS y
  servicios cloud (Railway, Render, DigitalOcean).
---

# Senior DevOps — TurnoSalud

## Entornos del sistema

| Entorno | Frontend | Backend | BD |
|---------|----------|---------|-----|
| Desarrollo | localhost:5173 (Vite) | localhost:3001 (nodemon) | MySQL local |
| Producción | Build estático | Node.js (PM2) | MySQL managed |

## Scripts disponibles

```bash
# Backend
cd backend
npm run dev        # nodemon — puerto 3001
npm run seed       # Inserta datos de prueba
npm start          # Producción (sin nodemon)

# Frontend
cd frontend
npm run dev        # Vite — puerto 5173
npm run build      # Build producción → dist/
npm run preview    # Preview build local

# Base de datos (PowerShell)
Get-Content backend/database/scripts/setup.sql | & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root "-pMatias1234!"

# Base de datos (Linux/Mac)
mysql -u root -p turnosalud < backend/database/scripts/setup.sql
```

## Variables de entorno

### Backend (.env)
```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_NAME=turnosalud
DB_USER=root
DB_PASSWORD=
JWT_SECRET=
JWT_EXPIRES_IN=7d
JWT_ADMIN_SECRET=
MAIL_HOST=
MAIL_PORT=587
MAIL_USER=
MAIL_PASS=
MAIL_FROM=noreply@turnosalud.com
MERCADOPAGO_ACCESS_TOKEN=
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
VITE_MERCADOPAGO_PUBLIC_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_WHATSAPP_API_URL=
VITE_APP_DOMAIN=turnosalud.com
```

## Deploy en producción (VPS Ubuntu)

```bash
# 1. Clonar repo
git clone <repo> /var/www/turnosalud

# 2. Backend con PM2
cd /var/www/turnosalud/backend
npm install --production
pm2 start src/app.js --name turnosalud-api
pm2 save
pm2 startup

# 3. Frontend — build y servir con Nginx
cd /var/www/turnosalud/frontend
npm install
npm run build
# Copiar dist/ a /var/www/html/turnosalud

# 4. Nginx config
server {
  listen 80;
  server_name turnosalud.com;
  
  # API
  location /api {
    proxy_pass http://localhost:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
  
  # Frontend SPA
  location / {
    root /var/www/html/turnosalud;
    try_files $uri $uri/ /index.html;
  }
}
```

## Checklist de deploy

```
□ Variables de entorno configuradas (no hardcodeadas)
□ JWT_SECRET es string aleatorio de 256 bits mínimo
□ DB_PASSWORD no es la de desarrollo
□ CORS configurado para dominio de producción
□ HTTPS habilitado (Let's Encrypt)
□ PM2 configurado para restart automático
□ Backup de BD programado (mysqldump diario)
□ Rate limiting activado en Express
□ Logs configurados (morgan + archivo)
```

## Reglas críticas

- ❌ NO commitear archivos .env al repositorio
- ❌ NO usar credenciales de desarrollo en producción
- ✅ .env.example con todas las variables (sin valores reales)
- ✅ npm run build antes de cada deploy frontend
- ✅ Siempre hacer backup de BD antes de migraciones
