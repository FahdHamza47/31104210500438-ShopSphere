# Cloud Service Classification — ShopSphere

| Service | Provider | Model | Why |
|---|---|---|---|
| Frontend hosting | Vercel | **PaaS** | You push a git repo and Vercel builds, deploys, and serves it — you never provision or patch a server or runtime, only your application code. |
| Backend hosting | Vercel (Serverless Functions) | **PaaS** | Same deployment model as the frontend — you supply an Express app and function code; Vercel handles the compute, scaling, and OS/runtime layer entirely. |
| Database | Supabase (managed PostgreSQL) | **SaaS** (with a PaaS-like data API layer) | You consume a fully-managed Postgres instance through a dashboard/connection string — Supabase operates the database engine, backups, and patching; you only manage schema and data via Prisma. |

**Note on the database line:** Supabase is sometimes classified as PaaS
since you're technically running "your own" Postgres instance rather than
consuming a shared multi-tenant API. Either PaaS or SaaS is defensible here
depending on which definition your course uses — the important part for
this rubric item is the *reasoning*: you never provision a VM, never patch
the OS, and never manage the database server process yourself, which is
what distinguishes both PaaS and SaaS from IaaS.
