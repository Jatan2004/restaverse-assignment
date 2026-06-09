"""
Integration tests for the Employee Search API.

Run with:
    cd backend
    pytest tests/ -v
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.models.employee import Employee
from datetime import date

# ── Test database (in-memory SQLite so tests are isolated and fast) ──────────
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test_temp.db"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Override the DB dependency in the app with the test DB
app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    """Create tables and seed test data before the module's tests run."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    # Seed a few employees
    test_employees = [
        Employee(name="Rahul Sharma", email="rahul.test@company.com",
                 department="Engineering", designation="Senior Software Engineer",
                 date_of_joining=date(2021, 3, 15)),
        Employee(name="Priya Singh", email="priya.test@company.com",
                 department="Human Resources", designation="HR Manager",
                 date_of_joining=date(2019, 8, 24)),
        Employee(name="Amit Verma", email="amit.test@company.com",
                 department="Marketing", designation="Digital Marketer",
                 date_of_joining=date(2023, 2, 18)),
    ]
    db.add_all(test_employees)
    db.commit()
    db.close()
    yield
    # Cleanup after tests
    Base.metadata.drop_all(bind=engine)
    # Dispose the engine to release file locks on Windows
    engine.dispose()
    import os
    if os.path.exists("test_temp.db"):
        os.remove("test_temp.db")


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


# ── Test Cases ───────────────────────────────────────────────────────────────

class TestEmployeeSearch:

    def test_get_all_employees_success(self, client):
        """GET /employees/all should return all seeded employees."""
        response = client.get("/employees/all")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 3  # Based on setup_test_db which seeds 3 employees

    def test_search_by_name_returns_results(self, client):
        """Valid name search should return matching employees."""
        response = client.get("/employees?search=Rahul")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        # Verify the result contains the expected employee
        names = [emp["name"] for emp in data]
        assert any("Rahul" in name for name in names)

    def test_search_by_department_returns_results(self, client):
        """Valid department search should return matching employees."""
        response = client.get("/employees?search=Engineering")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        departments = [emp["department"] for emp in data]
        assert all("Engineering" in dept for dept in departments)

    def test_search_no_match_returns_empty_list(self, client):
        """Search with no matching employees should return an empty list."""
        response = client.get("/employees?search=xyzabc123nonexistent")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0

    def test_missing_search_param_returns_400(self, client):
        """Missing 'search' query parameter should return 400 Bad Request."""
        response = client.get("/employees")
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "search" in data["detail"].lower()

    def test_empty_search_param_returns_400(self, client):
        """Empty 'search' query parameter should return 400 Bad Request."""
        response = client.get("/employees?search=")
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data

    def test_whitespace_only_search_returns_400(self, client):
        """Whitespace-only search should return 400 Bad Request."""
        response = client.get("/employees?search=   ")
        assert response.status_code == 400

    def test_response_schema_is_correct(self, client):
        """Response objects must contain all required fields."""
        response = client.get("/employees?search=Rahul")
        assert response.status_code == 200
        data = response.json()
        required_fields = {"id", "name", "email", "department", "designation", "date_of_joining"}
        for emp in data:
            assert required_fields.issubset(emp.keys()), f"Missing fields in: {emp}"

    def test_root_endpoint_returns_status(self, client):
        """Root endpoint should confirm the API is online."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "online"

    def test_response_content_type_is_json(self, client):
        """API must respond with JSON content type."""
        response = client.get("/employees?search=Priya")
        assert "application/json" in response.headers["content-type"]


class TestEmployeeCreation:

    def test_create_employee_success(self, client):
        """Valid employee payload should successfully create an employee."""
        payload = {
            "name": "New Employee",
            "email": "new.employee@company.com",
            "department": "Engineering",
            "designation": "Software Engineer",
            "date_of_joining": "2024-06-01"
        }
        response = client.post("/employees", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == payload["name"]
        assert data["email"] == payload["email"]
        assert "id" in data

    def test_create_employee_duplicate_email_returns_400(self, client):
        """Creating an employee with an already existing email should return 400 Bad Request."""
        payload = {
            "name": "Another Rahul",
            "email": "rahul.test@company.com",  # seeded in setup_test_db
            "department": "Engineering",
            "designation": "Manager",
            "date_of_joining": "2024-06-01"
        }
        response = client.post("/employees", json=payload)
        assert response.status_code == 400
        data = response.json()
        assert "already exists" in data["detail"]

    def test_create_employee_invalid_email_returns_422(self, client):
        """Creating an employee with an invalid email schema format should return 422 Unprocessable Entity."""
        payload = {
            "name": "Invalid Email User",
            "email": "not-an-email-address",
            "department": "Engineering",
            "designation": "Engineer",
            "date_of_joining": "2024-06-01"
        }
        response = client.post("/employees", json=payload)
        assert response.status_code == 422

