## ADDED Requirements

### Requirement: Secure and Redirection-Aware Brute-Force Protection

The authentication system MUST NOT clear or reset the rate limiting attempt counter for credential-based logins on failed authentication responses, regardless of whether they return a 302 redirection or a 200 OK error payload.

#### Scenario: Failed login redirects back to login page

- **WHEN** a login attempt with invalid credentials results in a 302 redirect containing an error parameter in the Location header
- **THEN** the rate limiter counter for that IP MUST increment and NOT be reset

#### Scenario: Failed login returns 200 OK with error body

- **WHEN** a login attempt with invalid credentials returns a 200 OK status containing a credentials validation error body
- **THEN** the rate limiter counter for that IP MUST increment and NOT be reset

#### Scenario: Successful login redirects to home/dashboard

- **WHEN** a login attempt with valid credentials results in a 302 redirect with no error parameters in the Location header
- **THEN** the rate limiter counter for that IP MUST be reset

### Requirement: Exception-Safe Token Verification Length Check

The JWT parsing utility on the frontend MUST verify that the byte length of the signature matches the byte length of the expected signature before comparing them, avoiding internal Node.js runtime exceptions.

#### Scenario: Verify token with invalid signature length

- **WHEN** the token verification utility receives a token whose signature length differs from the expected signature length
- **THEN** it MUST return null immediately without throwing an uncaught timingSafeEqual exception
