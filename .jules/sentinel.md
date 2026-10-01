## 2024-03-24 - [Avoid Synchronous Cryptography in Auth]
**Vulnerability:** Event Loop Blocking Denial of Service (DoS) vulnerability due to `bcrypt.compareSync` in login flow.
**Learning:** Node.js runs on a single-threaded event loop. Using synchronous, computationally heavy functions like `bcrypt.compareSync` on unauthenticated public endpoints blocks the entire server thread during the operation, allowing an attacker to quickly take down the server by spamming login requests.
**Prevention:** Always use asynchronous, non-blocking versions of cryptographic operations, like `await bcrypt.compare()`, to ensure the Node.js event loop remains free to handle other requests concurrently.
