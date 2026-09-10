
### Protocol Relative URL Open Redirect Validation (LoginForm)
When validating redirects that are expected to be local (starting with `/`), checking `redirectTo.startsWith('/')` alone is insufficient because it permits protocol-relative URLs like `//attacker.com`. A secure validation must explicitly reject double-slash prefixes. Thus, use the pattern: `redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')`.
