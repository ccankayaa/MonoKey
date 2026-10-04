import { writeFile } from "node:fs/promises";
import process from "node:process";

const required = [
  "MONOKEY_API_BASE_URL",
  "MONOKEY_FIREBASE_AUTH_DOMAIN",
  "MONOKEY_FIREBASE_PROJECT_ID",
  "MONOKEY_WEB_ORIGIN",
];

for (const name of required) {
  if (!process.env[name]?.trim()) {
    throw new Error(`${name} is required.`);
  }
}

function exactHttpsOrigin(name, value) {
  const parsed = new URL(value);
  if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error(`${name} must be an HTTPS URL without credentials, query, or fragment.`);
  }

  if (parsed.pathname !== "/") {
    throw new Error(`${name} must be an exact origin without a path.`);
  }

  return parsed.origin;
}

const apiOrigin = exactHttpsOrigin("MONOKEY_API_BASE_URL", process.env.MONOKEY_API_BASE_URL.trim());
exactHttpsOrigin("MONOKEY_WEB_ORIGIN", process.env.MONOKEY_WEB_ORIGIN.trim());
const authDomain = process.env.MONOKEY_FIREBASE_AUTH_DOMAIN.trim();
if (!/^[a-z0-9.-]+$/i.test(authDomain) || authDomain.startsWith(".") || authDomain.endsWith(".")) {
  throw new Error("MONOKEY_FIREBASE_AUTH_DOMAIN must be a hostname without a scheme or path.");
}

const authOrigin = exactHttpsOrigin("MONOKEY_FIREBASE_AUTH_DOMAIN", `https://${authDomain}`);

const projectId = process.env.MONOKEY_FIREBASE_PROJECT_ID.trim();
if (!/^[a-z0-9][a-z0-9-]{4,28}[a-z0-9]$/.test(projectId)) {
  throw new Error("MONOKEY_FIREBASE_PROJECT_ID is not a valid Firebase project ID.");
}

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://*.google-analytics.com",
  `connect-src 'self' https://*.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://*.google-analytics.com ${apiOrigin}`,
  `frame-src ${authOrigin}`,
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
].join("; ");

const config = {
  hosting: {
    public: "apps/web/dist",
    ignore: ["firebase.json", "**/.*", "**/node_modules/**"],
    rewrites: [{ source: "**", destination: "/index.html" }],
    headers: [
      {
        source: "**",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "**/*.@(js|css)",
        headers: [{ key: "Cache-Control", value: "public,max-age=31536000,immutable" }],
      },
    ],
  },
};

await writeFile("firebase.generated.json", `${JSON.stringify(config, null, 2)}\n`, { flag: "w" });
console.log(`Generated Firebase Hosting config for ${projectId} with API origin ${apiOrigin}.`);
