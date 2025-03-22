# Deploying Zap.ts on Netlify

This guide covers how to deploy Zap.ts using Netlify Functions for enhanced serverless capabilities.

## Netlify Functions Deployment

This approach uses Netlify Functions to support Zap.ts’s full Next.js capabilities, including server-side rendering and API routes, making it the recommended method for a seamless deployment.

### Prerequisites

- A Netlify account ([sign up here](https://www.netlify.com)).
- A Zap.ts project pushed to a Git repository.
- Node.js and a package manager installed locally.

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

   - Ensure your `next.config.js` is unmodified (no static export).

2. **Add Netlify Configuration**

   - Create a `netlify.toml` file in your project root:

     ```toml
     [build]
       command = "next build"
       publish = ".next"
       functions = "functions"

     [[plugins]]
       package = "@netlify/plugin-nextjs"
     ```

   - Install the Netlify Next.js plugin: `npm install -D @netlify/plugin-nextjs` (or your package manager equivalent).

3. **Set Up Functions Directory**

   - Netlify auto-handles Next.js API routes as serverless functions, but you can add custom functions in a `functions/` folder if needed.

4. **Push to Git**

   - Commit changes: `git add . && git commit -m "Add Netlify config" && git push`.

5. **Connect to Netlify**

   - Log in to [Netlify](https://app.netlify.com).
   - Click **New site from Git**, select your repo, and choose the branch (e.g., `main`).

6. **Configure Build Settings**

   - Netlify detects `netlify.toml`, so leave defaults:
     - **Build Command**: `next build`.
     - **Publish Directory**: `.next`.
   - Add environment variables (e.g., `DATABASE_URL`) in **Site settings** > **Environment variables**.

7. **Deploy**

   - Click **Deploy site**. The `@netlify/plugin-nextjs` plugin enables full Next.js support.
   - Get a URL like `https://your-site-name.netlify.app`.

8. **Test**
   - Verify PWA, API routes (via oRPC), MDX rendering, and UI components work as expected.

### Why Netlify Functions?

- Supports server-side rendering and API routes natively, unlike static hosting alone.
- Leverages Netlify’s serverless infrastructure for scalability.
- Simplifies deployment with the Next.js plugin, reducing manual configuration.

## Troubleshooting

Ensure the `@netlify/plugin-nextjs` plugin is installed and environment variables are set.

## Conclusion

Happy deploying!
