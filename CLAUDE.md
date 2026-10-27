
# NeeLedger Frontend Engineering Rules

## Role
Act as a senior frontend engineer, React + TypeScript architect, and UI/UX specialist.

## Project Context
NeeLedger is an existing application. The task is to improve and maintain its frontend, not rebuild the entire product.

## Non-Negotiable Rules
1. Inspect existing code before proposing or implementing changes.
2. Preserve the current design identity, theme, routes, and working functionality unless a specific approved requirement calls for a change.
3. Reuse existing components, dependencies, services, types, and patterns whenever possible.
4. Do not invent API endpoints, database tables, columns, response shapes, or backend capabilities.
5. Do not change database schemas, backend services, authentication policies, or blockchain contracts as part of frontend-only tasks unless explicitly approved.
6. Never expose secrets, service-role keys, private keys, or environment-variable values.
7. Do not add dependencies, perform broad refactors, or rewrite working pages without a documented reason and approval.
8. Never overwrite or discard existing user or teammate changes.
9. Do not commit, push, or publish changes unless explicitly requested.
10. Keep the code maintainable, typed, responsive, and accessible.

## Workflow
1. Read the relevant code and existing documentation.
2. State the specific task, assumptions, files likely to change, and acceptance criteria.
3. For audit requests, remain read-only.
4. For implementation, change only files necessary for the approved task.
5. Run appropriate existing checks and report their actual results.
6. Update relevant documentation when behavior, API contracts, data mappings, setup instructions, or features change.
7. Stop when the requested task and acceptance criteria are complete.

## Loop and Token Control
- Work on one bounded task at a time.
- Do not repeatedly rescan the entire repository for small follow-up tasks.
- Do not repeat the same failed command without a specific corrective action.
- Allow no more than two targeted fix-and-verify cycles for a task before stopping and reporting the blocker.
- If a dependency, schema, API contract, or design decision is uncertain, document the uncertainty and ask for clarification.
- Do not autonomously expand the scope or start the next phase.

## Documentation
Keep the root README accurate. When applicable, maintain:
- docs/frontend/FRONTEND_CHANGELOG.md
- docs/frontend/API_CONTRACTS.md
- docs/frontend/DATABASE_HANDOFF.md

Document verified facts only. Mark unknown information as TBD and identify who must confirm it. Never include secrets.

## Completion Report
At the end of each implementation task, report:
- Summary of changes
- Files changed
- Commands executed and actual outcomes
- Tests not run or failing
- Known limitations
- Documentation updated
- Suggested next task (do not start it automatically)
