# ReqFlow AI Backend

FastAPI service for requirement intake, analysis, user stories, prioritization,
document generation, process models, traceability, change control, and AI Q&A.

## Local run

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

OpenAPI: `http://127.0.0.1:8000/docs`

The service uses SQLite locally. Set `DATABASE_URL` for PostgreSQL. When
`OPENAI_API_KEY` is absent, the analysis endpoints use the built-in deterministic
BA engine. Set `OPENAI_MODEL` to override the default model.
