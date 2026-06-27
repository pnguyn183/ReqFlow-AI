# ReqFlow AI

## AI-Powered Requirement Management Platform

Version: 1.0  
Prepared by: Hoang Phuc Nguyen  
Role: IT Business Analyst

ReqFlow AI manages the complete requirement lifecycle: intake, analysis, user
stories, prioritization, document generation, process modeling, traceability,
change approval, and AI-assisted quality review.

## Implemented modules

| Module | Capabilities |
| --- | --- |
| Authentication & RBAC | Signed access tokens, Analyst, Product Owner, Project Manager, Admin and Viewer permissions |
| Requirement intake | Create, search, filter, CSV import, classification and versioned repository |
| Requirement analysis | Functional/NFR extraction, stakeholders, ambiguities, missing requirements and quality scoring |
| User stories | Story statement, acceptance criteria, Definition of Done and story points |
| Prioritization | MoSCoW, RICE ranking and value-versus-complexity quadrants |
| Documentation | BRD, SRS and product backlog generation with PDF/DOCX export |
| Process modeling | Use case, BPMN-style process and ERD suggestions |
| Traceability | Business goal to requirement, user story, task and test-case coverage |
| Change management | Change requests, approval decisions, requirement history and audit evidence |
| AI assistant | Requirement Q&A and gap suggestions with OpenAI or deterministic local analysis |

## Technology

- Frontend: React 18, TypeScript, Vite, Tailwind toolchain, Lucide icons
- Backend: FastAPI, SQLAlchemy, OpenAI Python SDK
- Data: PostgreSQL, MongoDB, Redis, Qdrant; SQLite for local development
- Documents: ReportLab and python-docx
- Operations: Docker Compose, Prometheus, Grafana, GitHub Actions

## Run locally

### Backend

```powershell
cd D:\project_04\backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8001
```

### Frontend

```powershell
cd D:\project_04\frontend
npm install
npm run dev
```

Open `http://127.0.0.1:5174`. API documentation is available at
`http://127.0.0.1:8001/docs`.

### Demo users

| Role | Username | Password |
| --- | --- | --- |
| Business Analyst | `analyst` | `demo123` |
| Product Owner | `owner` | `demo123` |
| Administrator | `admin` | `admin123` |

## OpenAI configuration

The application runs without an API key using the built-in BA analysis engine.
For model-backed analysis and Q&A, copy `.env.example` to `.env`, set
`OPENAI_API_KEY`, and optionally change `OPENAI_MODEL`. The backend uses the
[OpenAI Responses API](https://developers.openai.com/api/docs/guides/text).

Do not commit `.env` or expose API keys in frontend code.

## Docker stack

```powershell
docker compose up --build
```

| Service | URL |
| --- | --- |
| ReqFlow AI | http://localhost:5174 |
| API docs | http://localhost:8001/docs |
| Qdrant | http://localhost:6333/dashboard |
| Prometheus | http://localhost:9091 |
| Grafana | http://localhost:3001 (`admin` / `admin`) |

## Validation

```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest -q

cd ..\frontend
npm run build

cd ..
docker compose config --quiet
```

Project documentation is in [`docs`](./docs).
