# user-registration-flow Spec

## ADDED Requirements

### Requirement: Business and User Self-Registration

The system MUST allow new users to register a new Business and an initial ADMIN User at `/register`.

#### Scenario: Successful Registration

- Given a visitor fills out the registration form with valid name, email, password, business name, phone, and business type
- When they submit the form
- Then a new `Business` is created with `isDemo: true`, `demoExpiresAt: Date.now() + 10 days`, `subscriptionPlan: "PRO"`, and the selected `businessType`
- And a new `User` is created with role `ADMIN` and linked to the business
- And the user is automatically logged in or redirected to `/login` with success message

#### Scenario: Get Started Navigation from Landing Page

- Given a visitor on the Landing Page (`/`) or Login Page (`/login`)
- When they click "Get Started", "Empezar Gratis", or "Crear Cuenta Nueva"
- Then they are navigated to `/register`

#### Scenario: Business Type Selection

- Given the registration form
- When the user opens the Business Type dropdown
- Then options include "Peluquería / Barbería", "Estética / Belleza / Uñas", "Clínica / Fisioterapia / Salud", "Odontología", "Personal Trainer / Fitness", "Consultoría / Servicios Profesionales"

### Requirement: Top Trial Banner

The system MUST display a persistent top banner at the top of the dashboard layout while a business is in trial mode (`isDemo: true`).

#### Scenario: Active Trial Banner

- Given a logged-in user whose business has `isDemo: true` and `demoExpiresAt` in the future
- When navigating any page in the dashboard
- Then a sticky top banner displays the remaining trial days (e.g. "Prueba gratuita Plan Pro: te quedan X días") and a button to select plan

#### Scenario: Expired Trial Banner

- Given a business whose trial has expired (`demoExpiresAt <= Date.now()`)
- Then the top banner turns into an alert state informing that trial has ended and inviting to upgrade to Plan Base (18€) or Plan Pro (25€)

### Requirement: Automated Trial Expiration Alerts

The system MUST create entries in the `Alert` model when trial days reach milestone thresholds.

#### Scenario: Trial Milestone Alert Creation

- Given a business in trial mode
- When the trial reaches 3 days left, 1 day left, or 0 days left (expired)
- Then a new `Alert` is added to the user's alert notification list
