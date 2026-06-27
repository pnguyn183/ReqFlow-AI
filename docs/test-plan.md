# Test Plan

## Automated scope

- Authentication success and protected API access
- Dashboard aggregation and Prometheus metrics
- Requirement creation, analysis, version history and user-story generation
- RICE ranking and traceability coverage
- BRD generation with PDF and DOCX exports
- Change approval permission enforcement
- BPMN generation and assistant fallback behavior
- TypeScript production build and Docker Compose validation

## Manual acceptance scenarios

1. Sign in as Business Analyst and create a functional requirement.
2. Run analysis and confirm quality score, stakeholders, ambiguity and missing items.
3. Generate a user story and verify acceptance criteria and Definition of Done.
4. Compare RICE ranking with value-versus-complexity placement.
5. Generate BRD and export both PDF and DOCX.
6. Create each model type and verify source requirement context.
7. Review traceability gaps from goal through test case.
8. Submit a change as Analyst and confirm approval is denied for that role.
9. Sign in as Product Owner and approve the pending change.
10. Ask the assistant for missing acceptance criteria with and without an OpenAI key.

## Performance acceptance

Use a representative PostgreSQL dataset of at least 10,000 requirements. Measure
P95 API response under concurrent search, detail, traceability and dashboard load.
Document generation should be tested separately because it is a batch workload.
