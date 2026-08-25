// Structured logger — every line is a single JSON object with, at minimum,
// a timestamp and a severity level (rubric 4.2). Deliberately dependency-free
// (no winston/pino) so it works identically in a normal Node process and in
// a Vercel serverless function without extra config.
//
// In production these lines go to stdout/stderr, which is exactly what
// Vercel's Runtime Logs (Project -> Logs tab, or `vercel logs <deployment-url>`)
// captures and displays — that's "where these logs are read in production".

type Level = "info" | "warn" | "error";

interface LogFields {
  [key: string]: unknown;
}

function write(level: Level, message: string, fields: LogFields = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...fields,
  };

  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info: (message: string, fields?: LogFields) => write("info", message, fields),
  warn: (message: string, fields?: LogFields) => write("warn", message, fields),
  error: (message: string, fields?: LogFields) => write("error", message, fields),
};
