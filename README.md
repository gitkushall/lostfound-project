# LostFound

A campus/community platform to report, search, and claim lost items.

## Features

- **Auth**: Sign up, login, logout (password reset link placeholder)
- **Items**: Create Lost or Found posts with category, location, date, description, optional photo URL
- **Search & filters**: By type (Lost/Found), category, status, keyword, date range
- **Claim process**: Request to claim with message; poster approves/denies; status becomes RETURNED when approved
- **Notifications**: In-app list for "Someone requested your found item" and "Your claim was approved"
- **My Posts**: List, edit, mark returned, close, view claim requests

## Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma
- **Auth**: NextAuth.js (Credentials + JWT)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment:

   ```bash
   cp .env.example .env
   # Edit .env: set DATABASE_URL and NEXTAUTH_SECRET
   ```

3. Start PostgreSQL and create a database named `lostfound`, or point `DATABASE_URL` at a hosted Postgres database.

4. Initialize the database:

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. Run the dev server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000). Sign up, then use Home / Post / My Posts / Notifications / Profile.

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run vercel-build` — apply Prisma migrations, then build for Vercel
- `npm run start` — start production server
- `npm run db:migrate` — create and apply a local migration
- `npm run db:deploy` — apply committed migrations in deployment environments
- `npm run db:studio` — open Prisma Studio for the database

## Vercel deployment

1. Provision a hosted PostgreSQL database.
2. Set `DATABASE_URL` in Vercel for the project.
3. Set the Vercel Build Command to:

   ```bash
   npm run vercel-build
   ```

4. Redeploy so Prisma migrations run before the Next.js build.

## Auto-delete inactive posts (30-day rule)

Call `GET /api/cron/cleanup-old-posts` periodically (e.g. daily via cron or Vercel Cron). It deletes posts that are older than 30 days and have had no claim or message activity in the last 30 days. Notifications referencing those items are removed as well.

## Data model

- **User**: id, name, email, passwordHash, role (USER/ADMIN)
- **ItemPost**: type (LOST/FOUND), title, description, category, locationText, dateOccurred, photoUrl, status (OPEN/PENDING/RETURNED/CLOSED), postedByUserId
- **ClaimRequest**: itemId, requesterUserId, message, verificationAnswers (JSON), status (PENDING/APPROVED/DENIED)
- **Notification**: userId, type, data (JSON), isRead

## Optional next steps

- Password reset (email link + token)
- Admin/moderator role (review reports, handle abuse)
- File upload for photos (e.g. S3 or local `/public/uploads`)
- Verification questions per item (e.g. "What's inside the wallet?") with answers stored in ClaimRequest
- Email notifications (e.g. Resend or Nodemailer)
