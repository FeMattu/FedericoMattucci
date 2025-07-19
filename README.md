# Personal Multilanguage Portfolio Website with dedicated CMS

## Author

- **Name**: Federico Mattucci
- **Website**: [federico-mattucci.vercel.app](https://federico-mattucci.vercel.app)
- **Email**: [mattucci.federico@gmail.com](mailto:mattucci.federico@gmail.com)

---

## Project Overview

This is a modern web application built with Next.js, designed to showcase portfolio projects, manage content, and provide an admin panel for site management. The project supports internationalization (Italian and English) and integrates authentication using NextAuth.js.

---

## Technologies Used

- **Next.js**: Framework for building React applications with server-side rendering and static site generation.
- **TailwindCSS**: Utility-first CSS framework for styling.
- **NextAuth.js**: Authentication library for Next.js.
- **AWS CloudFront**: Content delivery network (CDN) for serving assets.
- **Docker**: Containerization platform for development and deployment.
- **Playwright**: End-to-end testing framework.
- **Radix UI**: Accessible UI components.
- **Vercel Analytics**: Analytics and performance insights.

---

## Directory Structure

```
├── public/
│   ├── images/
│   │   └── logo/
│   │       └── Logo-black.jpg
│   ├── languages/
│   │   ├── en.json
│   │   └── it.json
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── admin/
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── contacts/
│   │   │   ├── policy/
│   │   │   ├── portfolio/
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/route.ts
│   │   │   ├── image/
│   │   │   └── images-list/
│   ├── components/
│   ├── i18n/
│   ├── lib/
│   ├── providers/
│   └── styles/
├── Dockerfile
├── docker-compose.yml
├── package.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── middleware.ts
├── auth.ts
├── .env.example
├── README.md
```

### Key Directories

- **`public/`**: Contains static assets like images and translations.
- **`src/app/`**: Main application logic, including pages and API routes.
- **`src/components/`**: Reusable React components.
- **`src/i18n/`**: Internationalization configuration.
- **`src/lib/`**: Utility functions and libraries.
- **`src/providers/`**: Context providers for themes and caching.
- **`src/styles/`**: Global CSS styles.

---

## Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-at-least-32-characters

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AWS CloudFront
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=your-aws-region
AWS_BUCKET_NAME=your-aws-bucket-name
```

---

## Docker Setup

### Build and Run

1. **Build the Docker image**:
   ```bash
   docker build -t nextjs-app .
   ```

2. **Run the container**:
   ```bash
   docker run -p 3000:3000 nextjs-app
   ```

### Using Docker Compose

1. **Start the container**:
   ```bash
   docker compose up --build
   ```

2. **Stop the container**:
   ```bash
   docker compose down
   ```

---

## Managing Without Docker

If you prefer not to use Docker, you can manage the project using npm commands.

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

### Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Start the development server with Turbo mode:
   ```bash
   npm run dev:turbo
   ```

### Build and Start

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

---

## Google API Setup

To configure Google OAuth, follow these steps:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Navigate to "APIs & Services" > "Credentials".
4. Click "Create Credentials" > "OAuth client ID".
5. Set the application type to "Web application".
6. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - Your production URL (when you deploy).
7. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development).
   - `https://yourdomain.com/api/auth/callback/google` (for production).
8. Click "Create" and copy the Client ID and Client Secret to your `.env.local` file.

### Generating a NextAuth Secret

Run this command in your terminal to generate a secure random secret:

```bash
openssl rand -base64 32
```

Copy the output to your `.env.local` file as the `NEXTAUTH_SECRET` value.

---

## Authentication Setup

Refer to [`NEXTAUTH_SETUP.md`](NEXTAUTH_SETUP.md) for detailed instructions on setting up authentication with NextAuth.js and Google OAuth.

---

## Testing

### Playwright

Run end-to-end tests using Playwright:

```bash
./test-docker.sh
```

This script will:
- Start the Docker container
- Run Playwright tests
- Stop the container

---

## Deployment

The project is optimized for deployment on Vercel. Follow the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Troubleshooting

1. **Authentication Issues**:
   - Verify environment variables.
   - Check Google OAuth redirect URIs.

2. **Docker Issues**:
   - Ensure Docker is installed and running.
   - Check for port conflicts.

3. **Build Errors**:
   - Clear `.next` cache and rebuild:
     ```bash
     rm -rf .next && npm run build
     ```

---

## Clean Build Script

The `clean-build.sh` script is used to clean up the project and rebuild it from scratch. This is useful when encountering build errors or issues with cached files.

### Usage

1. Run the script:
   ```bash
   ./clean-build.sh
   ```

### What It Does

- Removes the `.next` directory, which contains cached build files.
- Removes `node_modules` to ensure dependencies are reinstalled.
- Reinstalls dependencies using `npm install`.
- Rebuilds the project using `npm run build`.

### When to Use

- If you encounter build errors that persist after running `npm run build`.
- If you suspect issues with cached files or outdated dependencies.
- Before deploying the project to ensure a clean build.

---

## License

This project is licensed under the MIT License.
