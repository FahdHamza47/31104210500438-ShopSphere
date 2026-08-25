# CI/CD Setup — Task 4.1

## Before this pipeline will run at all

`review-service/package-lock.json` doesn't exist yet (I never ran
`npm install` there — no network in my sandbox). Run it locally once and
commit the lockfile, or `npm ci` in the `review-service-build` job will
fail immediately:
```bash
cd review-service && npm install && git add package-lock.json && git commit -m "add review-service lockfile"
```

## The three environments

| Environment | Where it lives | How it's configured |
|---|---|---|
| **Development** | Your machine, via `docker-compose.yml` | `backend/.env`, `frontend/.env`, `review-service/.env` (all gitignored) |
| **Staging** | Vercel **Preview** deployments — automatic on every pull request | Set in each Vercel project's dashboard under Settings → Environment Variables, scoped to **Preview** only. Point `DATABASE_URL` at a separate Supabase branch/project if you want staging fully isolated from production data. |
| **Production** | Vercel **Production** deployments — triggered by this pipeline on merge to `main` | Set in each Vercel project's dashboard scoped to **Production**, AND duplicated as GitHub Actions secrets on the `production` **Environment** (Settings → Environments → production) so the pipeline's `prisma migrate deploy` step can reach the same database. |

## Required GitHub Actions secrets (repo-level, Settings → Secrets and variables → Actions)

- `VERCEL_TOKEN` — from vercel.com/account/tokens
- `VERCEL_ORG_ID` — from `vercel link` in any of the three project folders (creates `.vercel/project.json`, gitignored — read the `orgId` from there)
- `VERCEL_FRONTEND_PROJECT_ID`, `VERCEL_BACKEND_PROJECT_ID`, `VERCEL_REVIEW_PROJECT_ID` — the `projectId` from the same file, one per Vercel project

## Required secrets on the `production` GitHub Environment specifically

Create this environment at Settings → Environments → New environment →
name it exactly `production`. Add:
- `PROD_DATABASE_URL`, `PROD_DIRECT_URL` — your Supabase production connection strings

Scoping these to the `production` environment (rather than repo-level
secrets) means you can optionally require a reviewer approval before the
`deploy-production` job runs — Settings → Environments → production →
Deployment protection rules → Required reviewers.

## Branch protection (Task 4.1 — "main accepts a merge only after the pipeline succeeds")

This can't be expressed in the workflow YAML — it's a repo setting.
Settings → Branches → Add branch protection rule → branch name pattern `main`:
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging → select `backend-tests`,
  `frontend-tests`, `review-service-build`, `docker-build-check`
- ✅ Do not allow bypassing the above settings

Or via the GitHub CLI:
```bash
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  -f required_status_checks[strict]=true \
  -f "required_status_checks[contexts][]=Backend — install, build, test" \
  -f "required_status_checks[contexts][]=Frontend — install, build, test" \
  -f "required_status_checks[contexts][]=Review service — install, build" \
  -f "required_status_checks[contexts][]=Docker build verification" \
  -f enforce_admins=true \
  -f required_pull_request_reviews=null \
  -f restrictions=null
```

## Why no credential ever appears in the workflow file or a log

Every secret is referenced only as `${{ secrets.X }}`, injected straight
into a step's `env:` block, and read from there by the Vercel CLI /
Prisma — never echoed, printed, or interpolated into a `run:` command
string. GitHub Actions also automatically masks any string matching a
registered secret's value in the raw log output, as a second layer.
