## MODIFIED Requirements

### Requirement: EventManager React State Synchronization

The `EventManager` component SHALL synchronize state updates without invoking `setState` callbacks within `useMemo`.

#### Scenario: Props update synchronization
- **WHEN** parent components supply updated `initialEvents` props to `EventManager`
- **THEN** state synchronization MUST occur inside `useEffect` or pure render derivation to comply with React Hooks rules
