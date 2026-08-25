# Structured Logging

`src/utils/logger.ts` writes one JSON line per log entry to stdout/stderr:

```json
{"timestamp":"2026-08-25T10:03:41.221Z","level":"info","message":"request completed","method":"GET","path":"/api/products","statusCode":200,"durationMs":42}
```

Every entry has a `timestamp` (ISO 8601) and a `level` (`info` / `warn` / `error`), per rubric 4.2.

- `src/middleware/requestLogger.ts` logs every HTTP request once it finishes
  (info for 2xx/3xx, warn for 4xx, error for 5xx).
- `src/middleware/errorMiddleware.ts` logs every error passed to `next(error)`
  at `error` severity, including the stack trace.

## Where these logs are read in production

The backend is deployed on Vercel. Vercel captures anything written to
stdout/stderr from a serverless function invocation and shows it under:

**Project → your backend project → Logs tab** (real-time), or via the CLI:
`vercel logs <deployment-url>`.

No separate log aggregation service is required for this project — the
Vercel Logs tab is the log destination referenced in rubric 4.2 and 4.3
(failed-release detection).
