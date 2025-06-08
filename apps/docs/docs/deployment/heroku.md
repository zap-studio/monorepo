# Deploying Zap.ts on Heroku

This guide covers two approaches: a classic Heroku deployment using dynos and a recommended method with a custom Buildpack configuration for optimal Next.js support.

## Classic Heroku Deployment

This method deploys Zap.ts on Heroku using a standard Node.js dyno, suitable for basic Next.js applications with minimal configuration.

### Prerequisites

- A Heroku account ([sign up here](https://www.heroku.com)).
- The Heroku CLI installed locally (`npm install -g heroku` or download from [Heroku](https://devcenter.heroku.com/articles/heroku-cli)).
- A Zap.ts project pushed to a Git repository (e.g., GitHub or Heroku’s Git).
- Node.js and a package manager (e.g., npm, yarn, or pnpm) installed locally.

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

     :::

   - Test locally: `npm run build && npm run start`.

2. **Set Up Heroku**

   - Log in to Heroku: `heroku login`.
   - Create an app: `heroku create your-app-name`.

3. **Configure for Heroku**

   - Add a `Procfile` in your project root:
     ```plaintext
     web: npm start
     ```
   - Ensure `package.json` has a `start` script (default in Next.js: `"start": "next start"`).
   - Specify Node.js version in `package.json` (e.g., `"engines": { "node": "18.x" }`).

4. **Add Environment Variables**

   - Set variables locally or via the Heroku dashboard:
     ```bash
     heroku config:set DATABASE_URL=your-db-url
     heroku config:set BETTER_AUTH_SECRET=your-secret
     ```
   - Check `.env.example` in Zap.ts for required variables.

5. **Deploy**

   - Push to Heroku:
     ```bash
     git add .
     git commit -m "Ready for Heroku"
     git push heroku main
     ```
   - Open the app: `heroku open`.

6. **Test**
   - Visit `https://your-app-name.herokuapp.com` and verify PWA, API routes, MDX rendering, and UI components.

### Notes

- Heroku dynos restart daily, so ensure your app handles restarts gracefully.
- Free tier dynos sleep after inactivity—consider a paid tier for production.

## Heroku with Custom Buildpack (Recommended)

This approach uses a custom Next.js Buildpack to fully support Zap.ts’s features (e.g., server-side rendering, API routes), making it the recommended method for Heroku deployment.

### Prerequisites

- A Heroku account ([sign up here](https://www.heroku.com)).
- The Heroku CLI installed locally.
- A Zap.ts project in a Git repository.

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

     :::

   - Test locally: `npm run build && npm run start`.

2. **Create a Heroku App**

   - Log in: `heroku login`.
   - Create an app: `heroku create your-app-name`.

3. **Add the Next.js Buildpack**

   - Set the Buildpack:
     ```bash
     heroku buildpacks:set https://github.com/heroku/heroku-buildpack-nodejs.git
     heroku buildpacks:add https://github.com/heroku/heroku-buildpack-next-js.git
     ```
   - Verify: `heroku buildpacks`.

4. **Configure Heroku**

   - Add a `Procfile` (optional, as the Buildpack auto-detects):
     ```plaintext
     web: next start
     ```
   - Update `package.json` with `"engines": { "node": "18.x" }`.

5. **Set Environment Variables**

   - Add via CLI or dashboard:
     ```bash
     heroku config:set DATABASE_URL=your-db-url
     heroku config:set BETTER_AUTH_SECRET=your-secret
     ```
   - Include all variables from `.env.example`.

6. **Deploy**

   - Push to Heroku:
     ```bash
     git add .
     git commit -m "Add Next.js Buildpack"
     git push heroku main
     ```
   - Open the app: `heroku open`.

7. **Test**
   - Visit `https://your-app-name.herokuapp.com` and confirm PWA, API routes (oRPC), MDX, and UI components work.

### Why Custom Buildpack?

- Fully supports Next.js features like SSR and API routes, unlike the default Node.js setup.
- Simplifies deployment with automatic Next.js optimization.
- Better aligns with Zap.ts’s modern architecture compared to the classic approach.

## Troubleshooting

- **Classic Deployment**: Check logs (`heroku logs --tail`) for build or runtime errors. Ensure `start` script is defined.
- **Buildpack Deployment**: Verify Buildpack order (Node.js first, then Next.js) and environment variables are set.

## Conclusion

- **Classic Heroku**: Suitable for simple deployments with basic Next.js features.
- **Custom Buildpack**: Recommended for full Zap.ts functionality, including SSR and API routes.

Choose based on your needs—happy deploying!
