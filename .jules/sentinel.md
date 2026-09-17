## 2024-05-18 - [User Enumeration and Missing Security Headers]
**Vulnerability:** User Enumeration Timing Attack and Missing Security Headers
**Learning:** Found an early return during login authorization which could allow attackers to enumerate valid admin emails via timing attacks. Additionally, the Next.js app lacked standard security headers (X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security), increasing the risk of clickjacking and MITM attacks.
**Prevention:** Avoid conditional execution of slow cryptographic functions (like bcrypt.compare) based on email validity. Execute the hash comparison unconditionally to ensure constant time execution. Additionally, configure Next.js global security headers in next.config.ts for defense in depth.
