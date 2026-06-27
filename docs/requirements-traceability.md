# Requirements Traceability Matrix

| ID | Functional requirement | API implementation | UI implementation | Test coverage |
| --- | --- | --- | --- | --- |
| FR-001 | Submit requirements | `POST /api/requirements`, `POST /api/requirements/import` | Requirement repository | `test_requirement_lifecycle_and_analysis` |
| FR-002 | Analyze requirements | `POST /api/requirements/{id}/analyze` | Analysis studio | `test_requirement_lifecycle_and_analysis` |
| FR-003 | Generate documentation | `POST /api/documents/generate` | Documentation center | `test_document_generation_and_exports` |
| FR-004 | Generate user stories | `POST /api/requirements/{id}/user-stories` | Requirement drawer, backlog | `test_requirement_lifecycle_and_analysis` |
| FR-005 | Prioritize requirements | `/api/prioritization/*` | Backlog prioritization view | `test_prioritization_and_traceability` |
| FR-006 | Generate process diagrams | `POST /api/process-models/generate` | Process model canvas | `test_process_model_and_ai_assistant` |
| FR-007 | Maintain traceability | `/api/traceability` | Traceability matrix | `test_prioritization_and_traceability` |
| FR-008 | Manage requirement changes | `/api/change-requests/*`, requirement history | Change control, history drawer | `test_change_approval_rbac` |
| FR-009 | Export documents | `GET /api/documents/{id}/export` | PDF/DOCX actions | `test_document_generation_and_exports` |

## Non-functional coverage

| Requirement | Implementation evidence |
| --- | --- |
| API response < 500 ms | Response timing header and Prometheus latency histogram |
| Availability > 99.9% | Health endpoint, Prometheus scrape and Grafana dashboard |
| Audit logging | `AuditLog` entity and protected action logging |
| RBAC security | Server-side role permission matrix and negative approval test |
| Scalable document generation | Stateless generator boundary and documented worker extraction path |
| Support > 10,000 requirements | Indexed identifiers, database filtering and PostgreSQL deployment target |
