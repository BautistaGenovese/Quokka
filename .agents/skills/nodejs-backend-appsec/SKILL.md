---
name: nodejs-backend-appsec
description: >-
  Audits Node.js, Express, PostgreSQL (node-postgres), JWT, OAuth 2.0, Nodemailer, and Docker architectures.
  Use when conducting comprehensive AppSec code reviews on Node.js REST APIs and database layers.
---

# Node.js & Express Backend AppSec Audit Skill

## 1. Authentication & JWT Hardening
- **Algorithm Enforcement**: Verify that `jwt.verify(token, secret, { algorithms: ['HS256'] })` explicitly restricts algorithms to avoid algorithm confusion (e.g., none or asymmetric key confusion).
- **Expiration & Secret Entropy**: Ensure tokens have explicit expiration (`expiresIn`) and that `JWT_SECRET` has minimum 256 bits (32+ bytes) of entropy with no insecure defaults.
- **Payload Sanitization**: Ensure sensitive fields (`password_hash`, internal IDs, PII) are strictly omitted from JWT payload.
- **Google OAuth 2.0 Verification**: Verify `googleClient.verifyIdToken()` validates `audience === process.env.GOOGLE_CLIENT_ID` and checks `payload.email_verified === true`.

## 2. Authorization & Broken Access Control (BAC / BOLA)
- **Middleware Guard Completeness**: Ensure every private route explicitly invokes both authentication (`requireAuth`) and authorization (`requireRol`) middleware before the handler.
- **Horizontal & Vertical Privilege Escalation**: Verify that resource mutating/deleting operations check ownership (`req.user.id === resource.owner_id`) or require explicit administrative privileges.

## 3. PostgreSQL & Driver (`pg` / `node-postgres`) Security
- **Strict Parameterization**: Ensure queries never interpolate strings or concatenate user inputs. All dynamic values must pass through `$1, $2, ...` query parameters.
- **SSL Configuration in Production**: Check `pg.Pool` SSL settings. Remote cloud databases (Neon, Render, Supabase) require TLS encryption (`ssl: { rejectUnauthorized: false }` or trusted CA cert).
- **Resource Exhaustion & Pool Limits**: Check pool sizing (`max`), connection timeouts, and proper client release (`client.release()`) on error paths.

## 4. Rate Limiting & DoS Defense
- **Reverse Proxy IP Trust**: In cloud environments (Render, Cloudflare), inspect how client IP is obtained. If `trust proxy` is disabled, `req.ip` may reflect the reverse proxy IP, causing collective blocking. If enabled blindly, `X-Forwarded-For` can be spoofed.
- **Memory Consumption in Custom Limiters**: In-memory rate limiters using `Map` must enforce automatic eviction / garbage collection to prevent memory leaks under distributed scanning.
- **Targeted Endpoint Protection**: Ensure login, registration, password reset, and public contact/messaging endpoints have specific rate limits.

## 5. HTTP & Express Layer Hardening
- **Security Headers**: Ensure headers are hardened (using Helmet or explicit headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, removal of `X-Powered-By`).
- **Body Parser Limits**: Check that `express.json({ limit: '100kb' })` defines an explicit request payload size limit to prevent memory exhaustion DoS.
- **CORS Policies**: Avoid `origin: '*'` in production when transmitting bearer tokens or credentials. Validate origin against an allowlist.
- **Error Handling**: Verify that error handlers never leak internal database errors, SQL queries, or stack traces to HTTP client responses.

## 6. Email & SMTP Security (Nodemailer)
- **CRLF Injection Prevention**: Sanitize all header fields (`to`, `subject`, `from`) against `\r` and `\n` characters to prevent SMTP header injection and BCC spam relays.
- **HTML Sanitization**: Escape user input in email bodies to prevent HTML injection and phishing abuse.
- **Relay Abuse**: Prohibit arbitrary recipient emails chosen by anonymous clients without strict validation.

## 7. External API Consumption (SSRF & Cache)
- **Outbound Request Validation**: Validate third-party API target URLs (e.g., GitHub API) using strict allowlists.
- **Cache Poisoning & Resource Limiting**: Ensure in-memory caches have max-size boundaries and validate cached structures.
- **Timeout & Failure Tolerance**: Wrap outbound requests in timeouts so slow upstream APIs do not tie up Node.js event loop workers.

## 8. Deployment & Supply Chain Security
- **Dependency Vulnerabilities**: Audit dependencies with `npm audit` and verify package integrity.
- **Container Hygiene**: Ensure Docker containers run as non-root users and do not expose sensitive local debugging ports.
- **Secret Management**: Confirm secrets are supplied strictly via environment variables, with no defaults or leaked values in `.env.example` or Git commit history.
