# Deploying Zap.ts on DigitalOcean

This guide covers two approaches: a classic self-hosted deployment on a DigitalOcean Droplet and a recommended method using DigitalOcean’s App Platform for a managed experience.

## Classic Deployment with DigitalOcean Droplet

This method involves manually setting up a DigitalOcean Droplet to host Zap.ts, offering full control over the server environment but requiring more setup effort.

### Prerequisites

- A DigitalOcean account ([sign up here](https://www.digitalocean.com)).
- Git and a package manager (e.g., npm, yarn, pnpm, or bun) installed locally.
- A Zap.ts project pushed to a Git repository (e.g., GitHub).
- (Optional) A domain name for custom DNS setup.

### Steps

1. **Create a Droplet**

   - Log in to [DigitalOcean](https://cloud.digitalocean.com).
   - Click **Create** > **Droplets**.
   - Choose an Ubuntu image (e.g., 22.04 LTS), select a plan (e.g., $6/month basic), and add an SSH key for authentication.
   - Launch the Droplet and note its public IP.

2. **Set Up the Server**

   - SSH into your Droplet: `ssh root@your-droplet-ip`.
   - Update the system: `sudo apt update && sudo apt upgrade -y`.
   - Install Node.js: `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt install -y nodejs`.
   - Install a package manager (e.g., `sudo npm install -g pnpm` for pnpm).

3. **Clone Zap.ts**

   ```bash
   git clone <your-repository-url> zap-ts
   cd zap-ts
   ```

4. **Install Dependencies**
   ::: code-group

   ```bash [npm]
   npm install
   ```

   ```bash [yarn]
   yarn install
   ```

   ```bash [pnpm]
   pnpm install
   ```

   ```bash [bun]
   bun install
   ```

   :::

5. **Configure Environment**

   - Create a `.env` file with required variables (e.g., `DATABASE_URL`, `NEXTAUTH_SECRET`).
   - Refer to Zap.ts’s `.env.example` for specifics.

6. **Build and Run**

   - Build: `npm run build` (or equivalent).
   - Start: `npm run start` (runs on port 3000 by default).

7. **Set Up Reverse Proxy with NGINX (Optional)**

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

8. **Secure with SSL (Optional)**

   - Install Certbot: `sudo apt install certbot python3-certbot-nginx -y`.
   - Run: `sudo certbot --nginx`.

9. **Test**
   - Access `http://your-droplet-ip:3000` or `https://your-domain.com` and verify PWA, API routes, MDX, and UI components.

### Notes

- Use PM2 for production stability: `sudo npm install -g pm2; pm2 start "npm run start" --name zap-ts`.
- Open ports 80, 443, and 3000 in the DigitalOcean firewall (Networking > Firewalls).

## DigitalOcean App Platform Deployment (Recommended)

DigitalOcean’s App Platform is a managed PaaS that simplifies deploying Zap.ts with automatic scaling, built-in CI/CD, and Next.js support. This is the recommended approach for ease and efficiency.

### Prerequisites

- A DigitalOcean account ([sign up here](https://www.digitalocean.com)).
- A Zap.ts project pushed to a Git repository (e.g., GitHub, GitLab, or Bitbucket).
- Node.js installed locally for initial setup.

### Steps

1. **Prepare Your Zap.ts Project**

   - Clone your repo: `git clone <your-repository-url>`.
   - Install dependencies:
     ::: code-group

     ```bash [npm]
     npm install
     ```

     ```bash [yarn]
     yarn install
     ```

     ```bash [pnpm]
     pnpm install
     ```

     ```bash [bun]
     bun install
     ```

     :::

   - Test locally: `npm run build && npm run start`.

2. **Push to Git Repository**

   - Commit changes: `git add . && git commit -m "Ready for App Platform" && git push`.

3. **Create an App on App Platform**

   - Log in to [DigitalOcean](https://cloud.digitalocean.com).
   - Click **Create** > **Apps**.
   - Select your Git provider, authorize DigitalOcean, and choose your Zap.ts repository and branch (e.g., `main`).

4. **Configure App Settings**

   - App Platform auto-detects Next.js:
     - **Build Command**: `next build`.
     - **Run Command**: `next start`.
     - **Source Directory**: `/`.
   - Add environment variables (e.g., `DATABASE_URL`, `NEXTAUTH_SECRET`) under **Settings** > **App Variables**.

5. **Deploy**

   - Click **Launch App**. App Platform builds and deploys your app (takes ~2-5 minutes).
   - Get a URL like `https://your-app-name.ondigitalocean.app`.

6. **Test**

   - Visit the URL and verify PWA, API routes (oRPC), MDX rendering, and UI components.

7. **Custom Domain (Optional)**
   - Go to **Settings** > **Domains**, add your domain, and update DNS with an A record pointing to the App Platform IP.

### Why App Platform?

- Managed infrastructure with automatic scaling and SSL.
- Git-based CI/CD for seamless updates.
- Full Next.js support, including SSR and API routes, with less manual setup than a Droplet.

## Troubleshooting

- **Droplet**: Check NGINX logs (`/var/log/nginx/error.log`), ensure ports are open, and verify dependencies.
- **App Platform**: Review build logs in the DigitalOcean dashboard and confirm environment variables.

## Conclusion

- **Droplet**: Ideal for those needing full server control and custom configurations.
- **App Platform**: Recommended for its simplicity, automation, and managed Next.js support.

Choose based on your project needs—happy deploying!
