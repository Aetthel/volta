## ADDED Requirements

### Requirement: Admin Dashboard Metrics

The system SHALL calculate dashboard metrics dynamically using the actual services and prices recorded in the database. Calculated metrics MUST reflect the specific services and prices of the appointments rather than hardcoded static price maps or default client preferences.

#### Scenario: Displaying admin metrics

- **WHEN** the Admin views the dashboard stats
- **THEN** the system calculates estimated income and average tickets based on actual appointment service names and dynamic database prices
