## 2024-05-18 - [Fix Open Redirect Vulnerability in Authentication Flow]
**Vulnerability:** Open Redirect
**Learning:** Checking that a redirect URL starts with `/` (`startsWith("/")`) is not enough to prevent open redirects because it allows protocol-relative URLs (e.g., `//malicious.com`).
**Prevention:** Always check that the URL starts with `/` and DOES NOT start with `//` (e.g., `url.startsWith("/") && !url.startsWith("//")`), or parse the URL and verify its hostname explicitly.
