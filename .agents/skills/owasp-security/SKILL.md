---
name: owasp-security
description: >-
  Audits code and configuration against OWASP Top 10:2025, ASVS 5.0, and API Security Top 10.
  Use when conducting source code reviews for injection, broken access control, authentication,
  cryptography, SSRF, security headers, dependency risks, and container/IaC hardening.
---

# OWASP Security Audit Skill

## 1. Scope & Execution Principles
- **Defensive & Passive Analysis Only**: Review source code, AST, and configurations statically. Never execute active attacks or exploit payloads against production or remote services.
- **Source-to-Sink Tracing**: Verify whether untrusted user inputs actually reach sensitive execution sinks without prior validation or sanitization.
- **Triage & Quality**: Filter out theoretical or cosmetic issues; prioritize verified vulnerabilities with clear blast radius and remediation guidance.

## 2. Review Checklist
1. **A01: Broken Access Control (IDOR/BOLA)**
   - Verify authorization checks on *every* private route.
   - Enforce server-side role validation (RBAC) rather than client-asserted roles.
   - Confirm users cannot access or mutate resources belonging to others via manipulated IDs.
2. **A02: Cryptographic Failures**
   - Check password hashing: Bcrypt/Argon2 with appropriate work factor (Salt rounds >= 10).
   - Ensure secrets and encryption keys are not hardcoded in source files.
   - Verify JWT signatures, expiration (`exp`), and algorithm restrictions (prevent `none` or algorithm confusion).
3. **A03: Injection (SQL, NoSQL, CRLF, Command)**
   - Ensure all database queries use parameterized queries or prepared statements (`$1, $2`).
   - Check SMTP/email sending functions for Carriage Return Line Feed (`\r\n`) header injections.
   - Prohibit dynamic string concatenation or template literal execution in database and system commands.
4. **A04: Insecure Design & Rate Limiting**
   - Confirm anti-brute force mechanisms on authentication and sensitive endpoints.
   - Verify rate limiting implementations resist IP spoofing (e.g., `X-Forwarded-For` with proper proxy trust).
5. **A05: Security Misconfiguration**
   - Ensure debug flags, verbose stack traces, and internal errors are suppressed in production.
   - Check CORS policy: avoid wildcard `*` when credentials or sensitive tokens are transmitted.
   - Verify security headers (e.g., `Helmet`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`).
6. **A06: Vulnerable and Outdated Components**
   - Audit dependencies using native package manager tools (`npm audit`).
   - Inspect lockfiles and review CVE databases for known library vulnerabilities.
7. **A07: Identification and Authentication Failures**
   - Check OAuth token validation (e.g., Google ID token audience, expiry, verified email status).
   - Enforce session invalidation and proper token expiration times.
8. **A08: Software and Data Integrity Failures**
   - Validate integrity of external data feeds and third-party API payloads.
9. **A09: Security Logging and Monitoring Failures**
   - Confirm sensitive data (passwords, tokens, PII) is never logged to files or console.
10. **A10: Server-Side Request Forgery (SSRF)**
    - Validate and allowlist all outbound network requests initiated by the server.
