import importlib
import os
from pathlib import Path

from fastapi.testclient import TestClient


TEST_DB = Path(__file__).resolve().parents[1] / "test_reqflow.db"
if TEST_DB.exists():
    TEST_DB.unlink()
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB.as_posix()}"
os.environ.pop("OPENAI_API_KEY", None)

main = importlib.import_module("app.main")
client = TestClient(main.app)


def auth(username="admin", password="admin123"):
    response = client.post("/api/auth/login", json={"username": username, "password": password})
    assert response.status_code == 200
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def test_login_dashboard_and_metrics():
    headers = auth()
    dashboard = client.get("/api/dashboard/summary", headers=headers)
    assert dashboard.status_code == 200
    assert dashboard.json()["cards"]["requirements"] >= 8
    metrics = client.get("/metrics")
    assert "reqflow_http_requests_total" in metrics.text


def test_requirement_lifecycle_and_analysis():
    headers = auth("analyst", "demo123")
    created = client.post(
        "/api/requirements",
        headers=headers,
        json={"title": "Data retention policy", "description": "Administrators shall retain audit history for at least 365 days.", "priority": "Must", "category": "Security"},
    )
    assert created.status_code == 201
    requirement_id = created.json()["id"]
    analysis = client.post(f"/api/requirements/{requirement_id}/analyze", headers=headers)
    assert analysis.status_code == 200
    assert analysis.json()["provider"] == "local"
    story = client.post(f"/api/requirements/{requirement_id}/user-stories", headers=headers)
    assert story.status_code == 201
    assert len(story.json()["acceptance_criteria"]) == 3
    history = client.get(f"/api/requirements/{requirement_id}/history", headers=headers)
    assert len(history.json()) == 1


def test_prioritization_and_traceability():
    headers = auth()
    matrix = client.get("/api/prioritization/matrix", headers=headers)
    assert matrix.status_code == 200
    assert set(matrix.json()["quadrants"]) == {"Quick wins", "Strategic", "Fill-ins", "Defer"}
    trace = client.get("/api/traceability", headers=headers)
    assert trace.status_code == 200
    assert trace.json()["coverage"] > 0


def test_document_generation_and_exports():
    headers = auth()
    generated = client.post("/api/documents/generate", headers=headers, json={"document_type": "BRD", "requirement_ids": []})
    assert generated.status_code == 201
    document_id = generated.json()["id"]
    assert client.get(f"/api/documents/{document_id}/export?format=pdf", headers=headers).status_code == 200
    assert client.get(f"/api/documents/{document_id}/export?format=docx", headers=headers).status_code == 200


def test_change_approval_rbac():
    analyst = auth("analyst", "demo123")
    change = client.post("/api/change-requests", headers=analyst, json={"requirement_id": 1, "summary": "Clarify the validation flow", "reason": "Acceptance criteria need observable errors", "impact": "Low"})
    assert change.status_code == 201
    denied = client.post(f"/api/change-requests/{change.json()['id']}/decision", headers=analyst, json={"decision": "Approved"})
    assert denied.status_code == 403
    owner = auth("owner", "demo123")
    approved = client.post(f"/api/change-requests/{change.json()['id']}/decision", headers=owner, json={"decision": "Approved"})
    assert approved.status_code == 200


def test_process_model_and_ai_assistant():
    headers = auth()
    model = client.post("/api/process-models/generate", headers=headers, json={"model_type": "BPMN", "requirement_id": 1})
    assert model.status_code == 200
    assert len(model.json()["model"]["nodes"]) >= 5
    answer = client.post("/api/assistant/chat", headers=headers, json={"question": "What acceptance criteria are missing?", "requirement_id": 1})
    assert answer.status_code == 200
    assert answer.json()["provider"] == "local"
