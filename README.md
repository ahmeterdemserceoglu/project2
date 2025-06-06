<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
# E-commerce App

This project requires environment variables for services like Supabase, Stripe and SMTP. A sanitized `env.txt` is provided for reference only. **Real credentials should be placed in `.env.local` or supplied through your deployment environment.**

If any of the previous secrets from `env.txt` were ever used in a deployment, be sure to purge or rotate them immediately.

=======
# Ecommerce App

This is a full-stack ecommerce application built with [Next.js](https://nextjs.org/), TypeScript and Tailwind CSS. The project integrates Supabase for storage and authentication, and Stripe for payment processing.

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables. Copy or rename the provided `env.txt` file to `.env.local` at the project root and adjust the values for your own keys and secrets. The `.env.local` file is ignored by Git so your secrets remain private.
3. Start the development server:
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` in your browser to view the app.
>>>>>>> origin/codex/add-readme.md-with-setup-instructions
=======
# E-commerce App

This project uses **npm** as the package manager.

## Setup

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Start the production server after building:

```bash
npm start
```

## Additional Resources

See `sql/README.md` for instructions on applying SQL functions.
>>>>>>> origin/codex/choose-package-manager-and-update-docs
=======
# E-commerce App

This project is a Next.js based e-commerce application.

## Running Tests

The project uses **Jest** with **React Testing Library** for testing.

Install dependencies and run:

```bash
npm test
```

To watch files and re-run tests on change:

```bash
npm run test:watch
```
>>>>>>> origin/codex/set-up-testing-framework-and-add-tests
