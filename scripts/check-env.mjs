import fs from "node:fs";
import path from "node:path";

function loadLocalEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;

    let value = match[2];
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is missing or empty.`);
  return value;
}

function validateDatabaseUrl(name) {
  const value = requireEnv(name);
  let url;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} is not a valid PostgreSQL URL.`);
  }

  if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
    throw new Error(`${name} must use the postgresql:// or postgres:// scheme.`);
  }

  if (
    value.includes("AUTH_SECRET") ||
    value.includes("%22") ||
    /\[(?:YOUR[-_ ]?PASSWORD|PASSWORD)\]/i.test(value) ||
    /(?:DATABASE_URL|DIRECT_URL|AUTH_SECRET|NEXT_PUBLIC_APP_URL)\s*=/i.test(
      value
    )
  ) {
    throw new Error(
      `${name} contains a placeholder, another environment assignment, or encoded quotes. Set it to only one PostgreSQL URL.`
    );
  }
}

loadLocalEnv();
validateDatabaseUrl("DATABASE_URL");
validateDatabaseUrl("DIRECT_URL");
requireEnv("AUTH_SECRET");

console.log("Environment variables are valid for the Netlify build.");
