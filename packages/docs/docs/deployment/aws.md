# Deploying Zap.ts on AWS

This guide covers two AWS deployment methods: a classic self-hosted approach using EC2 and a recommended alternative using AWS Amplify.

## Classic Self-Hosted Approach with AWS EC2

This method involves manually setting up an AWS EC2 instance to host Zap.ts, offering full control over the server environment but requiring more configuration effort.

### Prerequisites

- An AWS account ([sign up here](https://aws.amazon.com)).
- Git and a package manager (e.g., bun, npm, yarn, or pnpm) installed locally.
- A Zap.ts project pushed to a Git repository (e.g., GitHub).
- (Optional) A domain name and Route 53 for DNS management.

### Steps

1. **Launch an EC2 Instance**

   - Log in to the [AWS Management Console](https://console.aws.amazon.com).
   - Navigate to EC2 > **Launch Instance**.
   - Choose an Amazon Linux 2 AMI, select a `t2.micro` instance (free tier eligible), and configure security groups to allow inbound traffic on ports 22 (SSH), 80 (HTTP), and 3000 (Next.js default).
   - Download the `.pem` key file for SSH access.

2. **Set Up the Server**

   - SSH into your instance: `ssh -i your-key.pem ec2-user@your-ec2-public-ip`.
   - Update the system: `sudo yum update -y`.
   - Install Node.js: `curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash - && sudo yum install -y nodejs`.
   - Install a package manager (e.g., `sudo npm install -g bun` for Bun).

3. **Clone Zap.ts**

   ```bash
   git clone <your-repository-url> zap-ts
   cd zap-ts
   ```

4. **Install Dependencies**
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

5. **Configure Environment**

   - Create a `.env` file with required variables (e.g., `DATABASE_URL`, `BETTER_AUTH_SECRET`).
   - Refer to Zap.ts’s `.env.example` for specifics.

6. **Build and Run**

   - Build: `bun run build` (or equivalent).
   - Start: `bun run start` (runs on port 3000).

7. **Set Up a Reverse Proxy with NGINX (Optional)**

   - Install NGINX: `sudo yum install nginx -y`.
   - Configure `/etc/nginx/conf.d/zap-ts.conf`:
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
   - Restart NGINX: `sudo systemctl restart nginx`.

8. **Secure with SSL (Optional)**

   - Install Certbot: `sudo yum install certbot python3-certbot-nginx -y`.
   - Run: `sudo certbot --nginx` and follow the prompts.

9. **Test**
   - Access `http://your-ec2-public-ip:3000` or `https://your-domain.com` and verify functionality (PWA, API routes, MDX, UI components).

### Notes

- Use PM2 for production stability: `sudo npm install -g pm2; pm2 start "bun run start" --name zap-ts`.
- Adjust security group rules in the AWS Console if needed (e.g., open port 80).

## AWS Amplify Deployment (Recommended)

AWS Amplify simplifies deployment with a managed CI/CD pipeline, global CDN, and seamless Next.js support. It’s recommended for its ease and scalability.

### Prerequisites

- An AWS account ([sign up here](https://aws.amazon.com)).
- A Zap.ts project pushed to a Git repository (e.g., GitHub, GitLab, or AWS CodeCommit).
- Node.js installed locally for initial setup.

### Steps

1. **Set Up Your Zap.ts Project Locally**

   - Clone your repo: `git clone <your-repository-url>`.
   - Install dependencies:
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
   - Test locally: `bun run build && bun run start`.

2. **Push to Git Repository**

   - Ensure your repo is up-to-date: `git add . && git commit -m "Ready for Amplify" && git push`.

3. **Connect to AWS Amplify**

   - Log in to the [AWS Management Console](https://console.aws.amazon.com).
   - Navigate to AWS Amplify > **New app** > **Host web app**.
   - Select your Git provider, authorize AWS Amplify, and choose your Zap.ts repository and branch (e.g., `main`).

4. **Configure Build Settings**

   - Amplify auto-detects Next.js settings:
     - **Build Command**: `next build`.
     - **Start Command**: `next start`.
     - **Base Directory**: `/`.
   - Add environment variables (e.g., `DATABASE_URL`) in the **Environment variables** section.

5. **Deploy**

   - Click **Save and deploy**. Amplify builds and deploys your app (takes ~2-5 minutes).
   - Once complete, get a URL like `https://main.random-id.amplifyapp.com`.

6. **Test**

   - Visit the deployed URL and verify PWA, API routes, MDX rendering, and UI components.

7. **Custom Domain (Optional)**
   - In Amplify, go to **Domain management** > **Add domain**.
   - Use Route 53 or external DNS, then follow prompts to configure and enable SSL.

### Why Amplify?

- Fully managed CI/CD with Git-based deployments.
- Automatic scaling and global CDN via CloudFront.
- Built-in SSL and domain management, reducing manual setup compared to EC2.

## Troubleshooting

- **EC2**: Check security group rules, NGINX logs (`/var/log/nginx/error.log`), and ensure port 3000 is accessible.
- **Amplify**: Verify build logs in the Amplify Console and ensure environment variables are set correctly.

## Conclusion

- **EC2 Classic**: Best for those needing full server control and comfortable with manual configuration.
- **Amplify**: Recommended for its simplicity, automation, and managed infrastructure.

Choose based on your project needs—happy deploying!
