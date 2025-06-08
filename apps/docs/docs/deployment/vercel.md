# Deploying Zap.ts on Vercel

Zap.ts is a Next.js boilerplate designed for rapid development and easy deployment. This guide walks you through deploying your Zap.ts project to Vercel seamlessly.

Since Zap.ts is a Next.js-based boilerplate, the deployment process follows the standard steps for deploying a Next.js app on Vercel. Let’s get started!

## Prerequisites

Before you begin, ensure you have the following:

- A Zap.ts project set up locally.
- A Vercel account ([sign up here](https://vercel.com/signup) if you don’t have one).
- Git installed on your machine.
- Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket).

## Step-by-Step Deployment

### 1. Prepare Your Zap.ts Project

Ensure your Zap.ts project is ready for deployment:

- Run `npm run build` (or your preferred package manager’s equivalent) locally to verify that your project builds successfully.
- Check your `.gitignore` file to ensure sensitive files (e.g., `.env`) are excluded from version control.
- If your project uses environment variables (e.g., for Drizzle ORM with Neon Database or Better Auth), note them down—you’ll add them to Vercel later.

### 2. Push Your Project to a Git Repository

Vercel integrates seamlessly with Git. Push your Zap.ts project to a repository:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repository-url>
git push origin main
```

Replace `<your-repository-url>` with the URL of your Git repository.

### 3. Import Your Project to Vercel

1. Log in to your Vercel dashboard at [https://vercel.com](https://vercel.com).
2. Click **New Project**.
3. Select **Import Git Repository** and connect your Git provider (GitHub, GitLab, or Bitbucket).
4. Choose the repository containing your Zap.ts project and click **Import**.

### 4. Configure Project Settings

Vercel automatically detects that Zap.ts is a Next.js project and applies the appropriate build settings. However, review the following:

- **Framework Preset**: Should be set to **Next.js** (Vercel auto-detects this).
- **Root Directory**: Leave it as the default (`/`) unless your Zap.ts project is in a subdirectory.
- **Build Command**: Defaults to `next build`. No changes needed unless customized.
- **Output Directory**: Defaults to `.next`. No changes needed.
- **Install Command**: Defaults to your package manager’s install command. For example:

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

  :::

### 5. Add Environment Variables

If your Zap.ts project relies on environment variables (e.g., for Neon Database or Better Auth), add them in Vercel:

1. In the project settings, go to the **Environment Variables** section.
2. Add each variable as a key-value pair (e.g., `DATABASE_URL=your-neon-db-url`).
3. Ensure the variables are available for the correct environments (e.g., Production, Preview, Development).

Refer to your `.env.example` file for the required variables.

### 6. Deploy Your Project

1. Click **Deploy** in the Vercel dashboard.
2. Vercel will install dependencies, build your Next.js app, and deploy it.
3. Once complete, you’ll get a live URL (e.g., `https://your-project-name.vercel.app`).

### 7. Test Your Deployment

Visit the deployed URL to ensure everything works as expected. Check features like:

- PWA functionality (Zap.ts is PWA-ready).
- API routes (powered by oRPC for type safety).
- MDX content rendering (if used).
- UI components from shadcn/ui and Tailwind CSS.

## Custom Domain (Optional)

To use a custom domain:

1. Go to your project’s **Settings** > **Domains** in Vercel.
2. Add your domain (e.g., `yourdomain.com`).
3. Update your DNS records as instructed by Vercel.

## Troubleshooting

- **Build Errors**: Check the build logs in Vercel for details. Ensure all dependencies are listed in `package.json`.
- **Environment Variables**: Verify they’re correctly set and scoped in Vercel.
- **PWA Issues**: Ensure your `manifest.json` or `manifest.ts` and service worker files are correctly configured in the Zap.ts project.

Happy deploying!
