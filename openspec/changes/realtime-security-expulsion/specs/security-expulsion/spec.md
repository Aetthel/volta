## ADDED Requirements

### Requirement: Database Trial and Permission Validation
The backend `authenticate` middleware SHALL verify that the requesting user's business subscription status is active and trial period has not expired.

#### Scenario: Valid active trial
- **WHEN** an authenticated API request is received and `trialExpiresAt` is in the future
- **THEN** the backend process allows the request to proceed to the controller

#### Scenario: Expired trial detection
- **WHEN** an authenticated API request is received and `trialExpiresAt` is in the past
- **THEN** the backend responds with HTTP 403 status and JSON payload `{ error: "Prueba finalizada", code: "TRIAL_EXPIRED", redirect: "/" }`

### Requirement: Global Client Security Interceptor
The frontend application SHALL intercept HTTP API responses and immediately trigger user logout and redirection to the landing page (`/`) when a `TRIAL_EXPIRED` or `PERMISSIONS_REVOKED` response code is received.

#### Scenario: Expulsion on API call
- **WHEN** an API response returns HTTP 403 with `code: "TRIAL_EXPIRED"`
- **THEN** the client immediately invokes `signOut({ callbackUrl: "/" })` to clear session and redirect to landing page

### Requirement: Real-time Background Security Guard
The application SHALL maintain a client-side background component `<SecurityGuard />` that periodically polls account status every 30 seconds and on window focus.

#### Scenario: Background trial expiration while idle
- **WHEN** the 30-second interval fires or user switches focus to the browser window and permissions check fails
- **THEN** `<SecurityGuard />` automatically triggers `signOut({ callbackUrl: "/" })` without requiring manual user interaction
