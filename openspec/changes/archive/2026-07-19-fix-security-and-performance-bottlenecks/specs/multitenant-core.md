## ADDED Requirements

### Requirement: Database-Level Client Lookup Isolation

The appointment creation system MUST query client records at the database level using indexed fields (phone number or name) to match existing clients, rather than scanning the entire business's client table in-memory.

#### Scenario: Register appointment for existing client

- **WHEN** an appointment is created for a client whose phone number matches an existing client record in the database
- **THEN** the system MUST associate the appointment with the existing client without retrieving all other client records of that business
