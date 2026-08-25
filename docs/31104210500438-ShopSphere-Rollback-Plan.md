# Rollback Plan — ShopSphere

**Status:** Accepted · **Date:** 2026-08-25

## 1. Detecting a failed release

The health-check endpoint (`/api/health` on both the backend and the
review service — Task 1.4) is registered with UptimeRobot on a 5-minute
check interval. A failed release is detected one of two ways:

- **Immediate:** the CI/CD pipeline itself fails a check (tests, build, or
  the deploy step) and never reaches production — no rollback needed, the
  bad code simply never goes live.
- **Post-deploy:** the release passed CI but broke something only visible
  under real traffic (a runtime error, a misconfigured env var). UptimeRobot
  sends an alert within one failed check cycle (≤5 minutes) if `/api/health`
  stops returning 200, and the structured request/error logs in Vercel's
  Logs tab (Task 4.2) show a spike in `level: "error"` entries with
  `statusCode >= 500` immediately after the deploy timestamp — that
  correlation (error spike starting exactly at the new deployment's
  creation time) is what confirms *this release* caused it, rather than an
  unrelated incident.

## 2. Restoring the previous working version

**Application (frontend / backend / review service) — Vercel instant rollback:**
1. Open the affected project in the Vercel dashboard → Deployments.
2. Find the last deployment that was healthy (green, pre-incident timestamp).
3. Click **⋯ → Promote to Production**. Vercel repoints the production
   domain to that build immediately — no rebuild, no CI run, typically
   under a minute.
4. Confirm recovery: `/api/health` returns 200 again and the Logs tab
   error rate drops back to baseline.

**Database (Supabase Postgres) — only if the release included a migration:**
1. Most releases won't need this step — most bugs are application code,
   not schema changes, and step 2 alone (Vercel rollback) fixes them.
2. If the bad release *did* run `prisma migrate deploy` with a breaking
   schema change: write and deploy a new **forward** migration that
   reverses the change (e.g. re-adding a dropped column), rather than
   trying to force Prisma's migration history backward. Prisma migrations
   are meant to move forward only.
3. If data was corrupted (not just schema), restore from Supabase's
   automatic daily backups (Project → Database → Backups) to a point
   before the bad release, or use point-in-time recovery if enabled on
   your Supabase plan.
4. Re-run the application rollback (step 2 above) at the same time so the
   running code version matches the restored schema/data version.

**After rollback:** re-open the pull request that caused the incident,
fix it, and let it go through the full pipeline (Task 4.1) again — never
push a hotfix directly to `main`, since that's exactly the branch
protection rule in place to prevent.
