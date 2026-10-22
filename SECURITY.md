# Security Policy

## Reporting a vulnerability

If you find a security issue in this project, please report it privately rather than opening a
public issue. Use GitHub's **Security > Advisories > Report a vulnerability** button on the
repository, or contact the maintainer directly.

---

## How this project handles secrets

This repository is published for review. It must never contain a working credential.

| Rule | How it is enforced |
| :--- | :--- |
| No secret is committed | The client holds no credential of any kind. There is no API key, no service-account token and no SMTP credential in the browser code. |
| `.env` is never tracked | `.env`, `.env.*` and `*.env` are ignored; only `.env.example` is committed. |
| No credential in browser-visible variables | The API base URL is the only build-time setting, and it is a plain URL. Anything placed in a `VITE_*` variable is **embedded in the shipped bundle** and therefore public — never put a secret in one. |
| No server-side secret in the client | Password hashing, JWT signing, OTP fingerprinting and the SMTP credentials all live in the backend. The client only ever receives the JWT. |
| Database dumps and private keys are never committed | `*.dump`, `*backup*.sql`, `*.pem`, `*.key`, `*.p12`, `*.pfx` and `*.jks` are ignored. |
| Logs are never committed | `*.log` and `logs/` are ignored. |

---

## Security design of the client

| Control | Implementation |
| :--- | :--- |
| Authentication | The backend issues a JWT; the client stores it under `auth_token` in `localStorage` and sends it as `Authorization: Bearer <token>`. |
| Session validation | On startup the app calls `GET /profile`. A 401 (expired or revoked) clears the stored session and returns the user to the sign-in view. |
| Uniform 401 handling | The API client treats **any** 401 the same way and notifies the app, so a revoked token always returns the user to the login screen. |
| Password input | Password fields are submitted over the same channel as the rest of the app; the client never persists a password and never logs one. |
| Password policy | The complexity rule lives in `src/constants/passwordPolicy.js` and is mirrored by the backend, which is the authority. The UI check is a convenience, not the control. |
| No secrets in the bundle | The only build-time value is the API base URL. |

### Known trade-off: the token in `localStorage`

The JWT is kept in `localStorage` so it survives a page reload. `localStorage` is readable by any
script running on the origin, so it is exposed to an XSS attack — this is the standard trade-off
for a token-based SPA and the reason the app never renders untrusted HTML and never injects user
input into markup.

A deployment that needs to be resilient to XSS should move the token to an `HttpOnly`,
`Secure`, `SameSite=Strict` cookie and add a CSRF defence on the backend. That is a backend
change and is out of scope for this client.

---

## Deployment notes

* `src/services/api.js` points at `http://localhost:8080/api/auth` for local development, and
  `vite.config.js` proxies `/api` to the same host. Point both at the real API host for a
  deployment — and serve the app over **HTTPS**, because a bearer token must not travel in
  clear text.
* Never place a secret in a `VITE_*` variable. Everything prefixed that way is compiled into the
  JavaScript bundle and is readable by anyone who opens the site.
* `dist/` is build output and is not tracked.
