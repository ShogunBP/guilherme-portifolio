## 2024-10-25 - [Add Next.js Security Headers]
**Vulnerability:** Missing fundamental security headers on the web application responses.
**Learning:** Default Next.js configuration does not automatically set headers like Strict-Transport-Security, X-Content-Type-Options, or Referrer-Policy, which provides a weak default security posture for Clickjacking and MIME-sniffing.
**Prevention:** In Next.js, standard security headers can be globally enforced using the `headers()` method in `next.config.ts`.
