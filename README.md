# Onikan Terracotta Chronicles

A JavaScript application for public documentation and discovery of the Onikan artifact collection, with a protected admin experience on the same site.

## Project layout

- `client/` — React and Vite public application and admin interface
- `server/` — Express API
- `prisma/` — MySQL data model and migrations
- `api/` — Vercel same-origin proxy to the Railway API
- `Dockerfile` — Railway API image

## Requirements

- Node.js 20 or newer
- MySQL 8 or newer

## Local setup

1. Create a MySQL database named `onikan_terracotta` (or change the name in the connection URL).
2. Copy `.env.example` to `.env` and set `DATABASE_URL` to match your MySQL username, password, host, port, and database, plus a long random `SESSION_SECRET`.
3. Install dependencies with `npm install`.
4. Generate the Prisma client with `npm run db:generate`.
5. Create the database schema with `npm run db:migrate`.
6. Create the first admin interactively with `npm run admin:create`.
7. Start the React client and API with `npm run dev`.

The client runs at `http://localhost:5173`; the API runs at `http://localhost:4000`. Admins sign in at `http://localhost:5173/admin`. Check `http://localhost:4000/api/health` for API availability.

## Application rules

- Catalogue numbers are unique (`Artifact.catalogueNumber`).
- Artifacts have separate generated internal IDs.
- There is no fixed collection-size limit.
- Public visibility is controlled by `PublicationStatus`.
- Admin authorization is designed around user roles and server-side route guards. The public and admin experiences will share one deployed site origin.

## Current scope

The public site includes the collection, artifact documentation pages, collection and per-object QR codes, and staff sign-in. Admins and editors can create and edit records, upload images, and publish or save drafts. Admin sessions are stored in MySQL; passwords are hashed with scrypt. The initial admin is created through the private terminal prompt.

When Cloudinary credentials are configured, uploads use Cloudinary. Without them, local development stores files under `server/uploads`; production uploads require Cloudinary. The local upload directory is for development only.

The homepage's Benin head photograph is a credited reference image by Mike Peel, licensed CC BY-SA 4.0. Replace it with an approved collection image when one is available.

## Deployment preparation

The deployment split is Vercel for the static React/Vite site and its small same-origin API proxy, and Railway for the Express API and MySQL database. The browser calls `/api` on Vercel, which forwards requests to Railway; this keeps the admin session cookie first-party. Production image uploads go from the browser directly to Cloudinary using short-lived signed upload parameters. They do not pass through Vercel Functions, which have a 4.5 MB request/response limit.

### Build the Railway API image locally

```sh
docker build --platform=linux/amd64 -t onikan-terracotta-api:local .
```

The frontend is a static Vite build and is not containerized for Vercel.

### Railway setup

1. Create a Railway project and add a private MySQL service.
2. Add an API service from this repository. Railway will use the root `Dockerfile`.
3. Set `DATABASE_URL` to the MySQL service's private `MYSQL_URL` reference, such as `${{MySQL.MYSQL_URL}}` (use the exact Railway service name).
4. Set `NODE_ENV=production`, a long random `SESSION_SECRET`, and `CLIENT_ORIGIN` to the Vercel public site origin.
5. Add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`. Production image upload requires these values.
6. Set the Railway pre-deploy command to `npm run db:deploy` and health check path to `/api/health`. The API listens on Railway's injected `PORT`.
7. Generate a public domain for the API service. Set this origin as `RAILWAY_API_URL` in Vercel.
8. After deployment, create the initial administrator in an interactive Railway shell with `npm run admin:create`.

Railway keeps MySQL private by default; the API connects over the project's private network. Apply schema migrations with Railway's pre-deploy command so a failed migration prevents the new API deployment from serving.

### Vercel setup

1. Import the repository as one Vercel project with the repository root as the project root.
2. The checked-in `vercel.json` sets the build command to `npm run build --workspace client` and output directory to `client/dist`.
3. Set `RAILWAY_API_URL` to the Railway API's public HTTPS origin (for example, `https://your-api.up.railway.app`, without `/api`).
4. Set `VITE_PUBLIC_SITE_URL` to the public collection URL. Add the public domain and an `admin.` subdomain to this Vercel project; the `admin.` host openfor s the sign-in page directly. `/admin` remains available for local development.
5. Do not set `VITE_API_URL`; requests should go through Vercel's `/api` proxy.

Keep Railway and Vercel secrets in their platform environment-variable settings, not in Git. Any Vercel environment-variable changes require a new deployment.
