# Architecture Diagram — Notes

See `31104210500438-ShopSphere-Architecture-Diagram.svg` for the diagram.

## Traffic path

1. **Browser → Frontend** — user loads the React SPA, served as a static
   build from Vercel.
2. **Frontend → Backend API** (REST, `VITE_API_URL`) — all product, cart,
   auth, and order requests. This is the Task 1 deployment: one Vercel
   project running `backend/src/server.ts`.
3. **Frontend → Review service** (REST, `VITE_REVIEW_SERVICE_URL`) — review
   reads/writes go directly to the independently-deployed review service
   (Task 3), never through the main backend.
4. **Backend API → PostgreSQL** and **Review service → PostgreSQL** — both
   services connect to the same Supabase project via Prisma, using
   separate tables (`products`/`carts`/`orders`/`users` vs `reviews`) and
   separate Prisma clients. Neither service shares an ORM connection or
   codebase with the other.

## Matching this to your actual deployment

Once deployed, replace the generic labels above with your real URLs in a
copy of this doc (or as an annotation) so the diagram matches Task 1
exactly, e.g.:
- Frontend: `https://<your-project>.vercel.app`
- Backend API: `https://<your-backend-project>.vercel.app`
- Review service: `https://<your-review-service>.vercel.app`
- Database: Supabase project ref `<your-project-ref>`
