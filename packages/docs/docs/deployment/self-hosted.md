# Self-Hosted Deployment of Zap.ts

This guide covers two self-hosted deployment methods: a classic manual approach and a recommended alternative using Coolify.

## Classic Self-Hosted Approach

The classic approach involves manually setting up a server and deploying Zap.ts using standard tools like Node.js or Docker. This offers full control but requires more effort.

### Prerequisites

- A server (e.g., VPS from DigitalOcean, Linode, or Hetzner) with SSH access.
- Git, Node.js (v18+), and a package manager (e.g., bun, npm, yarn, or pnpm) installed.
- (Optional) Docker for containerized deployment.
- A domain name (optional) and NGINX or similar for reverse proxying.

### Steps

1. **Set Up Your Server**

   - SSH into your server: `ssh user@your-server-ip`.
   - Update the system: `sudo apt update && sudo apt upgrade -y` (Ubuntu/Debian).
   - Install Node.js: `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt install -y nodejs`.
   - Install a package manager (e.g., `npm install -g bun` for Bun).

2. **Clone Zap.ts**

   ```bash
   git clone <your-repository-url> zap-ts
   cd zap-ts
   ```

3. **Install Dependencies**
   ::: code-group

   ```bash [bun]
   bun install
   ```

   ```bash [npm]
   npm install
   ```

   ```bash [yarn]
   yarn install
   ```

   ```bash [pnpm]
   pnpm install
   ```

   :::

4. **Configure Environment**

   - Create a `.env` file with required variables (e.g., `DATABASE_URL`, `BETTER_AUTH_SECRET`).
   - Refer to Zap.ts’s `.env.example` for specifics.

5. **Build and Run**

   - Build: `bun run build` (or equivalent).
   - Start: `bun run start` (runs on port 3000 by default).

6. **Set Up Reverse Proxy (Optional)**

   - Install NGINX: `sudo apt install nginx -y`.
   - Configure `/etc/nginx/sites-available/zap-ts`:
     ```nginx
     server {
         listen 80;
         server_name your-domain.com;
         location / {
             proxy_pass http://localhost:3000;
             proxy_set_header Host $host;
             proxy_set_header X-Real-IP $remote_addr;
         }
     }
     ```
   - Enable: `sudo ln -s /etc/nginx/sites-available/zap-ts /etc/nginx/sites-enabled/`.
   - Restart NGINX: `sudo systemctl restart nginx`.

7. **Secure with SSL (Optional)**

   - Use Certbot: `sudo apt install certbot python3-certbot-nginx -y && sudo certbot --nginx`.

8. **Test**
   - Access `http://your-server-ip` or `https://your-domain.com` and verify functionality (PWA, API routes, MDX, UI components).

### Notes

- Use a process manager like PM2 (`npm install -g pm2; pm2 start npm --name "zap-ts" -- start`) for production stability.
- Ensure your server’s firewall allows ports 80, 443, and 3000 (e.g., `ufw allow 80,443,3000`).

## Self-Hosted Deployment with Coolify (Recommended)

Coolify is an open-source, self-hosted Platform-as-a-Service (PaaS) that simplifies deploying Zap.ts with automation and a user-friendly interface. It’s recommended for its ease and efficiency.

### Prerequisites

- A server (e.g., VPS) with SSH access and at least 2 CPUs/2GB RAM.
- Docker installed (Coolify relies on Docker).
- A domain name (optional).

### Steps

1. **Install Coolify**

   - SSH into your server: `ssh user@your-server-ip`.
   - Run: `curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash`.
   - Access Coolify at `http://your-server-ip:8000` and complete the initial setup.

2. **Add Your Server**

   - In Coolify, add your server (typically “localhost” if Coolify is on the same machine).

3. **Create a Project**

   - Click **New Project** and name it (e.g., “Zap.ts”).

4. **Add Zap.ts Resource**

   - Select **Public Repository** or **Git Repository**.
   - Enter your Zap.ts repo URL (e.g., `<your-repository-url>`).
   - Choose “localhost” as the server and “Standalone Docker” as the destination.

5. **Configure Settings**

   - Coolify auto-detects Next.js settings:
     - **Build Pack**: Nixpacks (default).
     - **Install Command**: Auto-detected (e.g., `bun install`).
     - **Build Command**: `next build`.
     - **Start Command**: `next start`.
   - Set the port (e.g., 3000) and add environment variables (e.g., `DATABASE_URL`).

6. **Deploy**

   - Click **Deploy**. Coolify builds and deploys Zap.ts.
   - Access it via the auto-generated URL or configure a custom domain.

7. **Test**
   - Verify PWA functionality, API routes, MDX rendering, and UI components.

### Why Coolify?

- Automates Docker setup, SSL certificates, and deployments.
- Supports Git integration for automatic deploys on code push.
- Offers a graphical interface for managing resources, reducing manual effort compared to the classic approach.

## Troubleshooting

- **Classic Approach**: Ensure ports are open, NGINX is configured correctly, and dependencies are installed.
- **Coolify**: Verify Docker is running and server resources meet Coolify’s requirements (check logs in the Coolify UI).

## Conclusion

- **Classic Self-Hosted**: Ideal for those wanting full control and a hands-on experience, though it requires more setup time.
- **Coolify**: Recommended for self-hosting with its automation, ease of use, and modern deployment features.

Choose the method that fits your needs—happy deploying!
